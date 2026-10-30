/* ============================================================
   Boutique Lakay — fonctions réservées à l'équipe

   Fichier séparé exprès : il n'est chargé que par gestion.html.
   Un acheteur ne télécharge pas ce code — la data mobile coûte
   cher et il n'a rien à y faire.

   Toutes les règles métier (délai de 72 h, remise en stock,
   vérification du code, compteur d'abandons) vivent en base, dans
   des fonctions. Ici on ne fait que les appeler : impossible de
   contourner une règle depuis le navigateur.
   ============================================================ */

const ADMIN = (function () {

  const sb = function () { return API.sb(); };

  /* ---------- Connexion de l'équipe ------------------------
     L'app publique utilise la connexion anonyme. Un agent doit
     donc d'abord quitter cette session anonyme, sinon il reste
     identifié comme un acheteur sans droits.                 */

  async function connexion(email, motdepasse) {
    try { await sb().auth.signOut(); } catch (e) {}
    const { data, error } = await sb().auth.signInWithPassword({
      email: email, password: motdepasse
    });
    if (error) throw error;
    return data.user;
  }

  async function deconnexion() {
    await sb().auth.signOut();
    try { localStorage.removeItem('bl:panier'); } catch (e) {}
  }

  // Renvoie le rôle du compte connecté, ou null si personne.
  async function monRole() {
    const p = await API.profil();
    return p ? p.role : null;
  }

  async function estEquipe() {
    const r = await monRole();
    return r === 'agent' || r === 'admin';
  }

  /* ---------- Boutiques ----------------------------------- */

  async function toutesBoutiques() {
    const { data, error } = await sb().from('boutiques')
      .select('*, abonnements(plan, debut, fin)')
      .order('cree_le', { ascending: false });
    if (error) throw error;
    return data;
  }

  function slugifier(nom) {
    return (nom || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  }

  async function creerBoutique(champs) {
    const moi = await API.monId();
    const corps = {
      // Le vendeur n'a pas encore de compte : la boutique est créée au
      // nom de l'agent, puis transférée quand le vendeur s'inscrit.
      proprietaire: champs.proprietaire || moi,
      nom: champs.nom,
      slug: champs.slug || slugifier(champs.nom) + '-' + Date.now().toString(36).slice(-4),
      commune: champs.commune,
      adresse_repere: champs.adresse_repere || null,
      description: champs.description || null,
      statut: 'en_attente'
    };
    const { data, error } = await sb().from('boutiques').insert(corps).select().single();
    if (error) throw error;
    return data;
  }

  async function majStatutBoutique(id, statut) {
    const { error } = await sb().from('boutiques').update({ statut: statut }).eq('id', id);
    if (error) throw error;
  }

  async function plans() {
    const { data, error } = await sb().from('plans').select('*').order('commission_bps', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Un seul abonnement actif par boutique : on clôt le précédent.
  async function definirPlan(boutiqueId, planCode) {
    await sb().from('abonnements')
      .update({ fin: new Date().toISOString().slice(0, 10) })
      .eq('boutique', boutiqueId).is('fin', null);
    const { error } = await sb().from('abonnements')
      .insert({ boutique: boutiqueId, plan: planCode });
    if (error) throw error;
  }

  /* ---------- Catalogue ----------------------------------- */

  // Brouillons compris : c'est la vue de travail de l'équipe.
  async function produitsBoutique(boutiqueId) {
    const { data, error } = await sb().from('produits')
      .select('*, variantes(id, libelle, stock, supplement), medias(id, chemin, ordre)')
      .eq('boutique', boutiqueId)
      .order('cree_le', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function creerProduit(champs) {
    const corps = {
      boutique: champs.boutique,
      categorie: champs.categorie,
      nom: champs.nom,
      description: champs.description || null,
      prix: champs.prix,                 // centimes
      prepaiement_exige: !!champs.prepaiement_exige,
      statut: 'brouillon'                // la publication est une étape à part
    };
    const { data, error } = await sb().from('produits').insert(corps).select().single();
    if (error) throw error;
    return data;
  }

  async function majProduit(id, champs) {
    const { error } = await sb().from('produits').update(champs).eq('id', id);
    if (error) throw error;
  }

  async function ajouterVariante(produitId, libelle, stock, supplement) {
    const { data, error } = await sb().from('variantes').insert({
      produit: produitId,
      libelle: libelle || 'Standard',
      stock: Math.max(0, parseInt(stock, 10) || 0),
      supplement: parseInt(supplement, 10) || 0
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function majStock(varianteId, stock) {
    const { error } = await sb().from('variantes')
      .update({ stock: Math.max(0, parseInt(stock, 10) || 0) }).eq('id', varianteId);
    if (error) throw error;
  }

  /* ---------- Photos --------------------------------------
     Le bucket est public en lecture (c'est une vitrine) et
     fermé en écriture à tout le monde sauf l'équipe.         */

  async function televerserPhoto(produitId, fichier, prisParAgent) {
    const ext = (fichier.name.split('.').pop() || 'jpg').toLowerCase();
    const chemin = produitId + '/' + Date.now().toString(36) + '.' + ext;

    const up = await sb().storage.from('produits')
      .upload(chemin, fichier, { contentType: fichier.type, upsert: false });
    if (up.error) throw up.error;

    const { count } = await sb().from('medias')
      .select('id', { count: 'exact', head: true }).eq('produit', produitId);

    const { data, error } = await sb().from('medias').insert({
      produit: produitId, chemin: chemin,
      ordre: count || 0, pris_par_agent: !!prisParAgent
    }).select().single();
    if (error) throw error;
    return data;
  }

  /* ---------- Publication --------------------------------
     Un produit sans photo ni stock ne doit pas partir en
     vitrine : une fiche vide ne se vend pas et abîme la
     confiance dans toute la plateforme.                     */

  async function publier(produitId) {
    const { data: p, error: e1 } = await sb().from('produits')
      .select('id, nom, prix, variantes(stock), medias(id)')
      .eq('id', produitId).single();
    if (e1) throw e1;

    const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
    if (!stock) throw new Error('Ajoutez au moins une variante avec du stock.');
    if (!(p.medias || []).length) throw new Error('Ajoutez au moins une photo.');

    const { error } = await sb().from('produits')
      .update({ statut: 'publie' }).eq('id', produitId);
    if (error) throw error;
  }

  async function depublier(produitId) {
    const { error } = await sb().from('produits')
      .update({ statut: 'suspendu' }).eq('id', produitId);
    if (error) throw error;
  }

  /* ---------- Comptoir ------------------------------------ */

  const CHAMPS = 'id, reference, statut, total, cree_le, confirme_tel_le, arrive_le, ' +
    'expire_le, retire_le, point:points_retrait(nom, commune), ' +
    'acheteur:profiles(nom, telephone, abandons), ' +
    'lignes:lignes_commande(nom_produit, libelle, quantite, prix_unitaire)';

  // Les commandes qui attendent un geste de l'équipe, les plus vieilles
  // d'abord : c'est l'ordre dans lequel un comptoir travaille.
  async function commandesOuvertes() {
    const { data, error } = await sb().from('commandes')
      .select(CHAMPS)
      .in('statut', ['recue', 'payee', 'fonds_bloques', 'au_point_retrait'])
      .order('cree_le', { ascending: true });
    if (error) throw error;
    return data;
  }

  async function chercherCommande(reference) {
    const { data, error } = await sb().from('commandes')
      .select(CHAMPS).ilike('reference', (reference || '').trim()).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function confirmerTelephone(id) {
    const { error } = await sb().rpc('confirmer_telephone', { p_commande: id });
    if (error) throw error;
  }

  async function marquerArrivee(id) {
    const { data, error } = await sb().rpc('marquer_arrivee', { p_commande: id });
    if (error) throw error;
    return data;
  }

  async function validerRetrait(id, code, moyen) {
    const { data, error } = await sb().rpc('valider_retrait', {
      p_commande: id, p_code: (code || '').trim(), p_moyen: moyen || 'especes'
    });
    if (error) throw error;
    return data;
  }

  async function marquerAbandon(id, motif) {
    const { data, error } = await sb().rpc('marquer_abandon', {
      p_commande: id, p_motif: motif || null
    });
    if (error) throw error;
    return data;
  }

  return {
    connexion: connexion, deconnexion: deconnexion,
    monRole: monRole, estEquipe: estEquipe,
    toutesBoutiques: toutesBoutiques, creerBoutique: creerBoutique,
    majStatutBoutique: majStatutBoutique, plans: plans, definirPlan: definirPlan,
    slugifier: slugifier,
    produitsBoutique: produitsBoutique, creerProduit: creerProduit,
    majProduit: majProduit, ajouterVariante: ajouterVariante, majStock: majStock,
    televerserPhoto: televerserPhoto, publier: publier, depublier: depublier,
    commandesOuvertes: commandesOuvertes, chercherCommande: chercherCommande,
    confirmerTelephone: confirmerTelephone, marquerArrivee: marquerArrivee,
    validerRetrait: validerRetrait, marquerAbandon: marquerAbandon
  };
})();

window.ADMIN = ADMIN;
