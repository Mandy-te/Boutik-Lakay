/* ============================================================
   Boutique Lakay — couche de données

   Tout accès à la base passe par ici. Aucune requête Supabase
   ailleurs dans l'app. Raison : le jour où cette web app devient
   une application Android/iOS, ce fichier part tel quel.

   Deux particularités du terrain haïtien, traitées ici :
   · le réseau coupe  -> chaque lecture a un cache de secours
   · pas de compte    -> connexion anonyme, aucun mur d'inscription
   ============================================================ */

const API = (function () {

  /* ---------- Client ---------------------------------------
     Créé à la première utilisation, pas au chargement du
     fichier. Si la librairie Supabase n'est pas arrivée (CDN
     injoignable, réseau coupé en pleine page), l'app ne plante
     pas : elle affiche le cache et propose de réessayer.      */

  let _sb = null;

  function sb() {
    if (_sb) return _sb;
    if (!window.supabase || !window.supabase.createClient) {
      const e = new Error('Application pas encore prête. Réessayez.');
      e.code = 'LIB_ABSENTE';
      throw e;
    }
    _sb = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    return _sb;
  }

  function pret() {
    return !!(window.supabase && window.supabase.createClient);
  }

  /* ---------- Cache local -----------------------------------
     Sert uniquement de secours en lecture quand la requête
     échoue. Jamais pour les commandes ni pour l'argent.      */

  function cacheLire(cle) {
    try {
      const brut = localStorage.getItem('bl:' + cle);
      if (!brut) return null;
      const o = JSON.parse(brut);
      const ageMin = (Date.now() - o.t) / 60000;
      return { data: o.d, perime: ageMin > CONFIG.cacheMinutes };
    } catch (e) { return null; }
  }

  function cacheEcrire(cle, data) {
    try {
      localStorage.setItem('bl:' + cle, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* mode privé, quota plein : on continue sans cache */ }
  }

  // Tente le réseau ; si ça échoue, rend le cache en signalant qu'il est vieux.
  async function avecCache(cle, requete) {
    try {
      const { data, error } = await requete();
      if (error) throw error;
      cacheEcrire(cle, data);
      return { data: data, horsLigne: false };
    } catch (e) {
      const c = cacheLire(cle);
      if (c) return { data: c.data, horsLigne: true, perime: c.perime };
      throw e;
    }
  }

  /* ---------- Session --------------------------------------
     Connexion anonyme : l'acheteur navigue et commande sans
     créer de compte. Supabase crée quand même un vrai compte,
     donc la RLS fonctionne et le compte peut recevoir un
     téléphone plus tard sans perdre l'historique.            */

  async function session() {
    const { data } = await sb().auth.getSession();
    if (data && data.session) return data.session;
    const res = await sb().auth.signInAnonymously();
    if (res.error) throw res.error;
    return res.data.session;
  }

  async function monId() {
    const s = await session();
    return s ? s.user.id : null;
  }

  async function profil() {
    const id = await monId();
    if (!id) return null;
    const { data, error } = await sb().from('profiles').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  // Appelé au moment de la commande : on a besoin du nom et du téléphone
  // pour l'appel de confirmation avant expédition.
  async function majProfil(champs) {
    const id = await monId();
    if (!id) throw new Error('Connexion requise');
    const { data, error } = await sb().from('profiles')
      .update(champs).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  /* ---------- Référentiels --------------------------------- */

  // Les catégories vivent en base : l'équipe en ajoute depuis l'écran de
  // gestion et elles apparaissent ici sans toucher au code.
  function categories() {
    return avecCache('categories', function () {
      return sb().from('categories').select('*').eq('actif', true).order('ordre');
    });
  }

  function pointsRetrait() {
    return avecCache('points', function () {
      return sb().from('points_retrait').select('*').eq('actif', true).order('commune');
    });
  }

  function parametres() {
    return avecCache('parametres', function () {
      return sb().from('parametres').select('*');
    });
  }

  /* ---------- Catalogue ------------------------------------
     La RLS ne laisse passer que les produits publiés et les
     boutiques vérifiées : pas de filtre de statut à écrire ici
     côté client, et rien à oublier.                          */

  const CHAMPS_PRODUIT =
    'id, nom, description, prix, categorie, prepaiement_exige, mis_en_avant_jusqu_au, ' +
    'boutique:boutiques!inner(id, nom, slug, commune, statut), ' +
    'variantes(id, libelle, stock, prix), ' +
    'medias(chemin, ordre, type, mime)';

  // Prix réellement payé pour une variante : le sien s'il existe, sinon
  // celui du produit. Une seule définition, utilisée partout.
  function prixVariante(produit, variante) {
    if (variante && variante.prix) return variante.prix;
    return produit.prix;
  }

  // Fourchette affichée sur une fiche dont les variantes n'ont pas le
  // même prix : « à partir de » plutôt qu'un prix qui change au clic.
  function fourchette(produit) {
    const vs = (produit.variantes || []).filter(function (v) { return v.stock > 0; });
    if (!vs.length) return { min: produit.prix, max: produit.prix };
    let min = Infinity, max = 0;
    vs.forEach(function (v) {
      const p = prixVariante(produit, v);
      if (p < min) min = p;
      if (p > max) max = p;
    });
    return { min: min, max: max };
  }

  function produits(filtres) {
    const f = filtres || {};
    const cle = 'produits:' + (f.categorie || 'all') + ':' + (f.boutique || '');
    return avecCache(cle, function () {
      let q = sb().from('produits').select(CHAMPS_PRODUIT)
        .eq('statut', 'publie')
        .eq('boutique.statut', 'verifiee'); // l'alias de l'embed, pas le nom de table
      if (f.categorie && f.categorie !== 'all') q = q.eq('categorie', f.categorie);
      if (f.boutique) q = q.eq('boutique', f.boutique);
      return q.order('cree_le', { ascending: false });
    });
  }

  async function produit(id) {
    const { data, error } = await sb().from('produits')
      .select(CHAMPS_PRODUIT).eq('id', id).single();
    if (error) throw error;
    return data;
  }

  function boutiques() {
    return avecCache('boutiques', function () {
      return sb().from('boutiques')
        .select('id, nom, slug, commune, description')
        .eq('statut', 'verifiee').order('nom');
    });
  }

  // URL publique d'un média rangé dans le bucket Storage.
  function photoUrl(chemin) {
    if (!chemin) return null;
    const { data } = sb().storage.from('produits').getPublicUrl(chemin);
    return data ? data.publicUrl : null;
  }

  function medias(produit, type) {
    return (produit.medias || [])
      .filter(function (m) { return !type || (m.type || 'image') === type; })
      .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
  }

  /* ---------- Commandes -----------------------------------
     Une seule requête : la base crée la commande, ses lignes,
     décrémente le stock et génère le code de retrait dans la
     même transaction. Sur un réseau qui coupe au milieu, il
     n'y a pas de commande à moitié créée.                    */

  async function creerCommande(panier, pointRetrait) {
    await session();
    const items = panier.map(function (l) {
      return { variante: l.variante, quantite: l.quantite };
    });
    const { data, error } = await sb().rpc('creer_commande', {
      p_items: items,
      p_point: pointRetrait,
      p_taux: CONFIG.tauxUsd
    });
    if (error) throw error;

    // Le code de retrait n'est stocké qu'en haché côté serveur : il ne
    // pourra jamais être relu. On le garde sur cet appareil pour que
    // l'acheteur le retrouve, et il est de toute façon réaffichable
    // par un agent au comptoir.
    try {
      const codes = JSON.parse(localStorage.getItem('bl:codes') || '{}');
      codes[data.reference] = data.code;
      localStorage.setItem('bl:codes', JSON.stringify(codes));
    } catch (e) { /* sans stockage, le code reste affiché à l'écran */ }

    return data;
  }

  function codeLocal(reference) {
    try {
      const codes = JSON.parse(localStorage.getItem('bl:codes') || '{}');
      return codes[reference] || null;
    } catch (e) { return null; }
  }

  const CHAMPS_COMMANDE =
    'id, reference, statut, sous_total, frais_retrait, total, taux_usd, ' +
    'confirme_tel_le, cree_le, arrive_le, expire_le, retire_le, libere_le, ' +
    'point:points_retrait(nom, commune, repere, telephone), ' +
    'lignes:lignes_commande(nom_produit, libelle, prix_unitaire, quantite)';

  async function mesCommandes() {
    await session();
    const { data, error } = await sb().from('commandes')
      .select(CHAMPS_COMMANDE).order('cree_le', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function commande(id) {
    const { data, error } = await sb().from('commandes')
      .select(CHAMPS_COMMANDE).eq('id', id).single();
    if (error) throw error;
    return data;
  }

  /* ---------- Espace vendeur ------------------------------- */

  async function maBoutique() {
    const id = await monId();
    if (!id) return null;
    const { data } = await sb().from('boutiques')
      .select('*, abonnements(plan, debut, fin)')
      .eq('proprietaire', id).maybeSingle();
    return data;
  }

  async function commandesBoutique(boutiqueId) {
    const { data, error } = await sb().from('lignes_commande')
      .select('nom_produit, libelle, quantite, prix_unitaire, commission_bps, ' +
              'commande:commandes(id, reference, statut, cree_le, point:points_retrait(nom, commune))')
      .eq('boutique', boutiqueId);
    if (error) throw error;
    return data;
  }

  async function soldeBoutique(boutiqueId) {
    const { data } = await sb().from('solde_boutique')
      .select('*').eq('boutique', boutiqueId).maybeSingle();
    return data;
  }

  return {
    sb: sb, pret: pret,
    session: session, monId: monId, profil: profil, majProfil: majProfil,
    categories: categories, pointsRetrait: pointsRetrait, parametres: parametres,
    produits: produits, produit: produit, boutiques: boutiques, photoUrl: photoUrl,
    prixVariante: prixVariante, fourchette: fourchette, medias: medias,
    creerCommande: creerCommande, codeLocal: codeLocal,
    mesCommandes: mesCommandes, commande: commande,
    maBoutique: maBoutique, commandesBoutique: commandesBoutique,
    soldeBoutique: soldeBoutique
  };
})();

window.API = API;
