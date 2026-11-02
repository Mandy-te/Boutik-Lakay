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

const OPS = (function () {

  const sb = function () { return API.sb(); };

  /* ---------- Connexion de l'équipe ------------------------
     L'app publique utilise la connexion anonyme. Un agent doit
     donc d'abord quitter cette session anonyme, sinon il reste
     identifié comme un acheteur sans droits.                 */

  /* On accepte une adresse e-mail OU un numéro de téléphone. Un vendeur
     s'inscrit avec son numéro et un code à 6 chiffres, comme un acheteur ;
     les agents et l'administration utilisent une adresse. Les deux
     arrivent ici, et la conversion du numéro en identifiant interne se
     fait au même endroit que pour les acheteurs. */
  async function connexion(identifiant, motdepasse) {
    const id = String(identifiant || '').trim();
    const courriel = API.telValide(id) ? API.identifiantInterne(id) : id;
    try { await sb().auth.signOut(); } catch (e) {}
    const { data, error } = await sb().auth.signInWithPassword({
      email: courriel, password: motdepasse,
      options: { captchaToken: await API.jetonCaptcha() }
    });
    if (error) throw new Error('Identifiant ou mot de passe incorrect.');
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
      departement: champs.departement || null,
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

  // Corriger une erreur de saisie : nom, commune, repère, description.
  // La commune n'est pas cosmétique — c'est elle qui décide du tarif
  // de livraison depuis cette boutique.
  async function majBoutique(id, champs) {
    const { error } = await sb().from('boutiques').update(champs).eq('id', id);
    if (error) throw error;
  }

  /* ---------- Points de retrait et tarifs ------------------
     Le tarif dépend du couple (commune du vendeur, point de
     retrait) : un achat au Cap livré au Cap ne coûte pas ce
     que coûte un colis venu de Ouanaminthe.                 */

  async function tousPoints() {
    const { data, error } = await sb().from('points_retrait')
      .select('*, tarifs:tarifs_livraison(id, commune_origine, frais, note)')
      .order('commune');
    if (error) throw error;
    return data;
  }

  /* On enregistre toujours l'orthographe officielle de la commune.
     Les listes de l'acheteur sont bâties sur ce champ : deux graphies
     de la même ville y feraient deux entrées, et un tarif saisi sur
     l'une ne s'appliquerait pas à l'autre. */
  function lieu(x) {
    return (typeof communeCanonique === 'function') ? communeCanonique(x) : x;
  }

  async function creerPoint(champs) {
    const { data, error } = await sb().from('points_retrait').insert({
      nom: champs.nom, departement: champs.departement || null,
      commune: lieu(champs.commune), repere: champs.repere,
      telephone: champs.telephone || null,
      frais: champs.frais, actif: true
    }).select().single();
    if (error) throw error;
    return data;
  }

  async function majPoint(id, champs) {
    const corps = Object.assign({}, champs);
    if ('commune' in corps) corps.commune = lieu(corps.commune);
    const { error } = await sb().from('points_retrait').update(corps).eq('id', id);
    if (error) throw error;
  }

  // Un point déjà utilisé par une commande est protégé par sa clé
  // étrangère : on le désactive plutôt que de trouer l'historique.
  async function supprimerPoint(id) {
    const { error } = await sb().from('points_retrait').delete().eq('id', id);
    if (error) {
      if (String(error.code) === '23503') {
        throw new Error('Ce point a déjà reçu des commandes : il ne peut pas être ' +
          'supprimé sans trouer l’historique. Désactive-le à la place.');
      }
      throw error;
    }
  }

  async function creerTarif(pointId, commune, frais, note) {
    const { data, error } = await sb().from('tarifs_livraison').insert({
      point_retrait: pointId, commune_origine: lieu(commune), frais: frais, note: note || null
    }).select().single();
    if (error) {
      if (String(error.message).indexOf('duplicate') !== -1) {
        throw new Error('Un tarif existe déjà pour cette commune vers ce point.');
      }
      throw error;
    }
    return data;
  }

  async function majTarif(id, champs) {
    const { error } = await sb().from('tarifs_livraison').update(champs).eq('id', id);
    if (error) throw error;
  }

  async function supprimerTarif(id) {
    const { error } = await sb().from('tarifs_livraison').delete().eq('id', id);
    if (error) throw error;
  }

  // Les communes où se trouvent les vendeurs : ce sont celles pour
  // lesquelles un tarif a un sens.
  async function communesVendeurs() {
    const { data, error } = await sb().from('boutiques').select('commune');
    if (error) return [];
    const vues = {};
    (data || []).forEach(function (b) { if (b.commune) vues[b.commune.trim()] = 1; });
    return Object.keys(vues).sort();
  }

  async function plans() {
    const { data, error } = await sb().from('plans').select('*')
      .order('ordre').order('commission_bps', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function creerPlan(champs) {
    const code = champs.code || slugifier(champs.nom).slice(0, 24).replace(/-/g, '_');
    if (!code) throw new Error('Donne un nom au plan.');
    const { data, error } = await sb().from('plans').insert({
      code: code,
      nom: champs.nom,
      description: champs.description || null,
      abonnement_mois: champs.abonnement_mois || 0,
      commission_bps: champs.commission_bps,
      max_references: champs.max_references,
      mises_en_avant: champs.mises_en_avant || 0,
      ordre: champs.ordre || 99,
      actif: true
    }).select().single();
    if (error) {
      if (String(error.message).indexOf('duplicate') !== -1) {
        throw new Error('Un plan porte déjà ce nom.');
      }
      throw error;
    }
    return data;
  }

  async function majPlan(code, champs) {
    const { error } = await sb().from('plans').update(champs).eq('code', code);
    if (error) throw error;
  }

  // Combien de boutiques sont sur ce plan : on ne désactive pas à l'aveugle.
  async function boutiquesParPlan() {
    const { data, error } = await sb().from('abonnements')
      .select('plan, boutique').is('fin', null);
    if (error) return {};
    const n = {};
    (data || []).forEach(function (a) { n[a.plan] = (n[a.plan] || 0) + 1; });
    return n;
  }

  /* Un seul abonnement actif par boutique. La base ferme le précédent
     et vérifie qui a le droit : un vendeur choisit son plan à
     l'inscription, l'équipe peut en changer ensuite. */
  async function definirPlan(boutiqueId, planCode) {
    const { error } = await sb().rpc('choisir_plan', {
      p_boutique: boutiqueId, p_plan: planCode
    });
    if (error) throw error;
  }

  /* ---------- Catégories ----------------------------------
     Elles vivent en base pour qu'une nouvelle catégorie n'oblige
     jamais à repasser par le code.                            */

  async function toutesCategories() {
    const { data, error } = await sb().from('categories')
      .select('*').order('ordre').order('nom_fr');
    if (error) throw error;
    return data;
  }

  async function creerCategorie(champs) {
    const code = champs.code || slugifier(champs.nom_fr).slice(0, 24);
    if (!code) throw new Error('Donne un nom à la catégorie.');
    const { data, error } = await sb().from('categories').insert({
      code: code,
      nom_fr: champs.nom_fr,
      nom_ht: champs.nom_ht || champs.nom_fr,
      ordre: parseInt(champs.ordre, 10) || 99,
      actif: true
    }).select().single();
    if (error) {
      if (String(error.message).indexOf('duplicate') !== -1) {
        throw new Error('Une catégorie porte déjà ce nom.');
      }
      throw error;
    }
    return data;
  }

  async function majCategorie(code, champs) {
    const { error } = await sb().from('categories').update(champs).eq('code', code);
    if (error) throw error;
  }

  // On désactive au lieu de supprimer : des produits y sont rattachés.
  async function basculerCategorie(code, actif) {
    return majCategorie(code, { actif: !!actif });
  }

  /* ---------- Catalogue ----------------------------------- */

  // Brouillons compris : c'est la vue de travail de l'équipe.
  async function produitsBoutique(boutiqueId) {
    const { data, error } = await sb().from('produits')
      .select('*, variantes(id, libelle, stock, prix, attributs), ' +
              'medias(id, chemin, ordre, type, mime)')
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
      axes: champs.axes || [],
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

  // Un produit déjà commandé ne se supprime pas : sa variante est protégée
  // par une clé étrangère, pour que l'historique des ventes reste intact.
  // On explique au lieu de laisser passer l'erreur brute de Postgres.
  /* ---------- Révision ------------------------------------
     Le vendeur soumet, l'équipe publie ou refuse avec un motif.
     Un refus sans explication ne fait pas corriger : il fait
     abandonner.                                               */

  async function soumettreProduit(id) {
    const { data: p, error: e1 } = await sb().from('produits')
      .select('id, nom, prix, variantes(stock), medias(id, type)')
      .eq('id', id).single();
    if (e1) throw e1;

    const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
    const photos = (p.medias || []).filter(function (m) { return (m.type || 'image') === 'image'; });
    if (!stock) throw new Error('Ajoutez au moins une variante avec du stock.');
    if (!photos.length) throw new Error('Ajoutez au moins une photo : une fiche sans ' +
      'photo ne se vend pas, et la grille du catalogue affiche des vignettes.');

    const { error } = await sb().from('produits')
      .update({ statut: 'en_revision' }).eq('id', id);
    if (error) throw error;
  }

  async function refuserProduit(id, commentaire) {
    const { error } = await sb().rpc('refuser_produit', {
      p_produit: id, p_commentaire: commentaire
    });
    if (error) throw error;
  }

  // Les produits qui attendent une décision de l'équipe.
  async function aReviser() {
    const { data, error } = await sb().from('produits')
      .select('*, boutique:boutiques(id, nom, commune), ' +
              'variantes(id, libelle, stock, prix, attributs), ' +
              'medias(id, chemin, ordre, type, mime)')
      .eq('statut', 'en_revision')
      .order('soumis_le', { ascending: true });
    if (error) throw error;
    return data;
  }

  async function supprimerProduit(id) {
    const { error } = await sb().from('produits').delete().eq('id', id);
    if (error) {
      if (String(error.message).indexOf('foreign key') !== -1 ||
          String(error.code) === '23503') {
        throw new Error('Cet article a déjà été commandé : il ne peut pas être ' +
          'supprimé sans trouer l’historique des ventes. Retire-le de la vitrine.');
      }
      throw error;
    }
  }

  /* ---------- Variantes ----------------------------------
     Chaque variante porte son propre prix : un cremas 100 ml et
     un 50 ml ne coûtent pas la même chose. Prix vide = celui du
     produit.                                                  */

  /* L'étiquette se fabrique à partir des axes : « M · Rouge ». Elle
     sert d'affichage et de garde-fou contre les doublons, puisque deux
     variantes ne peuvent pas porter le même libellé sur un produit. */
  function libelleDeAttributs(attributs) {
    const cles = Object.keys(attributs || {}).filter(function (k) {
      return String(attributs[k] || '').trim(); });
    if (!cles.length) return '';
    return cles.map(function (k) { return String(attributs[k]).trim(); }).join(' \u00b7 ');
  }

  async function ajouterVariante(produitId, libelle, prix, stock, attributs) {
    const att = attributs || {};
    const etiquette = (libelle || '').trim() || libelleDeAttributs(att) || 'Standard';
    const { data, error } = await sb().from('variantes').insert({
      produit: produitId,
      libelle: etiquette,
      attributs: att,
      prix: prix ? Math.max(1, prix) : null,
      stock: Math.max(0, parseInt(stock, 10) || 0)
    }).select().single();
    if (error) {
      if (String(error.message).indexOf('duplicate') !== -1) {
        throw new Error('Ce produit a déjà une variante portant ce nom.');
      }
      throw error;
    }
    return data;
  }

  /* Crée toutes les combinaisons manquantes d'un coup. Un t-shirt en
     3 tailles et 2 couleurs fait 6 variantes : les saisir une par une
     est le genre de corvée qui fait abandonner un vendeur. */
  async function genererVariantes(produitId) {
    const { data: p, error } = await sb().from('produits')
      .select('id, prix, declinaisons, variantes(id, attributs)')
      .eq('id', produitId).single();
    if (error) throw error;

    const voulues = combinaisons(p.declinaisons || {});
    if (!voulues.length) throw new Error('Déclarez d\u2019abord des déclinaisons et leurs valeurs.');

    const noms = Object.keys(p.declinaisons || {});
    const existantes = (p.variantes || []).map(function (v) { return v.attributs || {}; });
    const aCreer = voulues.filter(function (c) {
      return !existantes.some(function (e) { return memeCombinaison(e, c); });
    });
    if (!aCreer.length) return { crees: 0 };

    const lignes = aCreer.map(function (c) {
      return {
        produit: produitId,
        libelle: etiquette(c, noms),
        attributs: c,
        prix: null,
        stock: 0
      };
    });
    const r = await sb().from('variantes').insert(lignes);
    if (r.error) throw r.error;
    return { crees: aCreer.length };
  }

  async function majDeclinaisons(produitId, declinaisons) {
    const { error } = await sb().from('produits')
      .update({ declinaisons: declinaisons }).eq('id', produitId);
    if (error) throw error;
  }

  async function majVariante(varianteId, champs) {
    const { error } = await sb().from('variantes').update(champs).eq('id', varianteId);
    if (error) throw error;
  }

  async function supprimerVariante(varianteId) {
    const { error } = await sb().from('variantes').delete().eq('id', varianteId);
    if (error) {
      if (String(error.code) === '23503') {
        throw new Error('Cette variante a déjà été vendue : mets son stock à 0 ' +
          'plutôt que de la supprimer.');
      }
      throw error;
    }
  }

  /* ---------- Photos et vidéos ----------------------------
     Le bucket est public en lecture (c'est une vitrine) et
     fermé en écriture à tout le monde sauf l'équipe.
     Les limites sont dans config.js, pas ici.                */

  function typeDe(fichier) {
    return (fichier.type || '').indexOf('video/') === 0 ? 'video' : 'image';
  }

  // Durée d'une vidéo, lue sans l'envoyer : inutile de dépenser la data
  // d'un agent pour téléverser un fichier qu'on va refuser.
  function dureeVideo(fichier) {
    return new Promise(function (ok) {
      try {
        const v = document.createElement('video');
        const url = URL.createObjectURL(fichier);
        let fini = false;
        const terminer = function (d) {
          if (fini) return;
          fini = true;
          URL.revokeObjectURL(url);
          ok(d);
        };
        v.preload = 'metadata';
        v.onloadedmetadata = function () { terminer(v.duration || 0); };
        v.onerror = function () { terminer(0); };
        setTimeout(function () { terminer(0); }, 6000); // lecteur muet : on laisse passer
        v.src = url;
      } catch (e) { ok(0); }
    });
  }

  // Renvoie un message d'erreur, ou null si le fichier passe.
  async function verifierMedia(fichier, dejaImages, dejaVideos) {
    const lim = CONFIG.medias;
    const est = typeDe(fichier);
    const mo = fichier.size / (1024 * 1024);

    if (mo > lim.moMax) {
      return 'Fichier de ' + mo.toFixed(1) + ' Mo : la limite est ' + lim.moMax + ' Mo.';
    }
    if (est === 'image' && dejaImages >= lim.photosMax) {
      return 'Déjà ' + lim.photosMax + ' photos sur cet article.';
    }
    if (est === 'video') {
      if (dejaVideos >= lim.videosMax) {
        return 'Déjà ' + lim.videosMax + ' vidéo(s) sur cet article.';
      }
      const d = await dureeVideo(fichier);
      if (d && d > lim.videoSecondesMax) {
        return 'Vidéo de ' + Math.round(d) + ' s : la limite est ' +
          lim.videoSecondesMax + ' s. Une vidéo longue coûte la data de l’acheteur.';
      }
    }
    return null;
  }

  async function televerserMedia(produitId, fichier, prisParAgent) {
    const est = typeDe(fichier);
    const ext = (fichier.name.split('.').pop() || (est === 'video' ? 'mp4' : 'jpg'))
      .toLowerCase().replace(/[^a-z0-9]/g, '');
    const chemin = produitId + '/' + Date.now().toString(36) + '-' +
      Math.random().toString(36).slice(2, 7) + '.' + ext;

    const up = await sb().storage.from('produits')
      .upload(chemin, fichier, { contentType: fichier.type || undefined, upsert: false });
    if (up.error) throw up.error;

    const { count } = await sb().from('medias')
      .select('id', { count: 'exact', head: true }).eq('produit', produitId);

    const { data, error } = await sb().from('medias').insert({
      produit: produitId, chemin: chemin, type: est,
      mime: fichier.type || null,
      ordre: count || 0, pris_par_agent: !!prisParAgent
    }).select().single();
    if (error) throw error;
    return data;
  }

  /* Plusieurs fichiers, un par un et pas en parallèle : sur un réseau
     faible, quatre envois simultanés échouent plus souvent qu'ils ne
     passent. `avance` est rappelée après chaque fichier pour que
     l'agent voie où en est l'envoi. */
  async function televerserPlusieurs(produitId, fichiers, dejaImages, dejaVideos, avance) {
    const resultats = { envoyes: 0, erreurs: [] };
    let nImg = dejaImages, nVid = dejaVideos;

    for (let i = 0; i < fichiers.length; i++) {
      const f = fichiers[i];
      if (avance) avance(i + 1, fichiers.length, f.name);
      const refus = await verifierMedia(f, nImg, nVid);
      if (refus) { resultats.erreurs.push(f.name + ' : ' + refus); continue; }
      try {
        await televerserMedia(produitId, f, true);
        resultats.envoyes++;
        if (typeDe(f) === 'video') nVid++; else nImg++;
      } catch (e) {
        resultats.erreurs.push(f.name + ' : ' + (e.message || 'envoi impossible'));
      }
    }
    return resultats;
  }

  async function supprimerMedia(media) {
    await sb().storage.from('produits').remove([media.chemin]);
    const { error } = await sb().from('medias').delete().eq('id', media.id);
    if (error) throw error;
  }

  /* ---------- Publication --------------------------------
     Un produit sans photo ni stock ne doit pas partir en
     vitrine : une fiche vide ne se vend pas et abîme la
     confiance dans toute la plateforme.                     */

  async function publier(produitId) {
    const { data: p, error: e1 } = await sb().from('produits')
      .select('id, nom, prix, variantes(stock), medias(id, type)')
      .eq('id', produitId).single();
    if (e1) throw e1;

    const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
    const photos = (p.medias || []).filter(function (m) { return (m.type || 'image') === 'image'; });

    if (!stock) throw new Error('Ajoute au moins une variante avec du stock.');
    // Une vidéo seule ne suffit pas : la grille du catalogue affiche des
    // vignettes, et un article sans photo y apparaîtrait vide.
    if (!photos.length) throw new Error('Ajoute au moins une photo. Une vidéo ' +
      'seule ne suffit pas : la grille du catalogue affiche des vignettes.');

    const { error } = await sb().from('produits')
      .update({ statut: 'publie' }).eq('id', produitId);
    if (error) throw error;
  }

  async function depublier(produitId) {
    const { error } = await sb().from('produits')
      .update({ statut: 'suspendu' }).eq('id', produitId);
    if (error) throw error;
  }

  const CHAMPS = 'id, reference, statut, total, cree_le, confirme_tel_le, arrive_le, numero_suivi, ' +
    'expire_le, retire_le, ' +
    'point:points_retrait(nom, commune), ' +
    'acheteur_id:acheteur, acheteur:profiles(nom, telephone, abandons), ' +
    'lignes:lignes_commande(nom_produit, libelle, quantite, prix_unitaire, ' +
    'boutique:boutiques(id, nom, commune))';

  /* Le travail de l'équipe se fait colis par colis. Un colis porte sa
     ville de départ, son numéro de suivi et son avancement ; la
     commande n'apporte plus que le client, la référence et le point
     de retrait. */
  const CHAMPS_COLIS = 'id, rang, commune_origine, frais, statut, numero_suivi, cree_le, ' +
    'prete_le, embarque_le, arrive_le, expire_le, retire_le, annule_le, motif_annulation, ' +
    'commande:commandes(id, reference, statut, total, cree_le, confirme_tel_le, ' +
      'point:points_retrait(nom, commune), ' +
      'acheteur_id:acheteur, acheteur:profiles(nom, telephone, abandons)), ' +
    'lignes:lignes_commande(id, nom_produit, libelle, quantite, prix_unitaire, prete_le, ' +
      'boutique:boutiques(id, nom, commune))';

  /* ---------- Transfert d'une boutique ---------------------
     Les boutiques naissent au nom de l'agent qui les saisit. Quand
     le vendeur a son propre compte, il faut lui en passer la
     propriété : sans ça il ne verra jamais ses commandes.        */

  /* Lesquels des comptes d'équipe n'ont qu'un code à six chiffres.
     Rend des identifiants, jamais une adresse. */
  async function comptesEquipeFaibles() {
    const { data, error } = await sb().rpc('comptes_equipe_faibles');
    if (error) throw error;
    const set = {};
    (data || []).forEach(function (r) { set[r.profil] = true; });
    return set;
  }

  async function profilsParRole(role) {
    let q = sb().from('profiles').select('id, nom, telephone, role').order('nom');
    if (role) q = q.eq('role', role);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  /* Les pièces justificatives vivent dans leur propre table, lisible
     par le seul propriétaire de la boutique et par l'équipe. Elles
     étaient dans `boutiques`, qui est publique dès qu'une boutique
     est vérifiée : les règles de lecture sont par ligne, pas par
     colonne, donc il n'y avait aucun moyen d'y cacher deux champs. */
  async function documentsBoutique(boutiqueId) {
    const { data, error } = await sb().from('documents_boutique')
      .select('genre, chemin, depose_le')
      .eq('boutique', boutiqueId);
    if (error) throw error;
    const par = {};
    (data || []).forEach(function (d) { par[d.genre] = d; });
    return par;
  }

  // Tous les documents d'un coup, pour la liste des boutiques : une
  // requête au lieu d'une par boutique.
  async function tousDocuments() {
    const { data, error } = await sb().from('documents_boutique')
      .select('boutique, genre, chemin');
    if (error) throw error;
    const par = {};
    (data || []).forEach(function (d) {
      if (!par[d.boutique]) par[d.boutique] = {};
      par[d.boutique][d.genre] = d.chemin;
    });
    return par;
  }

  async function deposerDocument(boutiqueId, genre, chemin) {
    const { error } = await sb().from('documents_boutique')
      .upsert({ boutique: boutiqueId, genre: genre, chemin: chemin,
                depose_le: new Date().toISOString() },
              { onConflict: 'boutique,genre' });
    if (error) throw error;
  }

  /* Les pièces sont dans un bucket privé : il faut une adresse signée,
     valable une heure. On ne les expose jamais en clair. */
  async function lienDocument(chemin) {
    if (!chemin) return null;
    const { data, error } = await sb().storage.from('documents')
      .createSignedUrl(chemin, 3600);
    if (error) return null;
    return data.signedUrl;
  }

  async function transfererBoutique(boutiqueId, profilId) {
    const { error } = await sb().from('boutiques')
      .update({ proprietaire: profilId }).eq('id', boutiqueId);
    if (error) throw error;
  }

  async function definirRole(profilId, role) {
    const { error } = await sb().from('profiles').update({ role: role }).eq('id', profilId);
    if (error) throw error;
  }

  /* ---------- Argent dû aux vendeurs -----------------------
     En phase pilote Flashipping encaisse au comptoir : il DOIT
     donc cet argent au vendeur, commission déduite. C'est la dette
     la plus facile à oublier et la plus rapide à détruire une
     relation de confiance.                                      */

  async function duAuxVendeurs(boutiqueId) {
    let q = sb().from('du_aux_vendeurs').select('*').order('retire_le', { ascending: true });
    if (boutiqueId) q = q.eq('boutique', boutiqueId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  // On règle des COLIS : un vendeur est payé dès que le sien est
  // retiré, sans attendre un colis parti d'une autre ville.
  async function reglerBoutique(boutiqueId, lesColis) {
    const { data, error } = await sb().rpc('regler_colis', {
      p_boutique: boutiqueId, p_colis: lesColis
    });
    if (error) throw error;
    return data;
  }

  async function soldes() {
    const { data, error } = await sb().from('solde_boutique').select('*').order('nom');
    if (error) throw error;
    return data;
  }

  /* ---------- Côté vendeur ---------------------------------
     Les commandes qui contiennent au moins un de ses articles.
     La sécurité par ligne fait le filtre : il ne voit que les
     siennes, sans qu'on ait à le demander ici.                 */

  /* Combien de vendeurs sur chaque colis, combien ont fini. Rien
     d'autre : ni nom, ni article, ni montant. C'est ce qui permet de
     dire « le colis attend encore quelqu'un » sans montrer au vendeur
     ce que vend son voisin. */
  async function avancementColis() {
    const { data, error } = await sb().rpc('mes_colis_avancement');
    if (error) throw error;
    const parId = {};
    (data || []).forEach(function (r) { parId[r.colis] = r; });
    return parId;
  }

  async function colisAPreparer() {
    const { data, error } = await sb().from('colis')
      .select(CHAMPS_COLIS)
      .in('statut', ['confirmee', 'en_preparation', 'prete', 'en_transit'])
      .is('annule_le', null)
      .order('cree_le', { ascending: true });
    if (error) throw error;
    return data;
  }

  /* ---------- Comptoir ------------------------------------ */

  // Les colis qui attendent un geste de l'équipe, les plus vieux
  // d'abord : c'est l'ordre dans lequel un comptoir travaille.
  async function colisOuverts() {
    const { data, error } = await sb().from('colis')
      .select(CHAMPS_COLIS)
      .in('statut', ['recue', 'confirmee', 'en_preparation', 'prete', 'en_transit',
                     'payee', 'fonds_bloques', 'au_point_retrait', 'code_valide'])
      .is('annule_le', null)
      .order('cree_le', { ascending: true });
    if (error) throw error;
    return data;
  }

  // Recherche par référence de commande : elle rend TOUS ses colis,
  // parce qu'au comptoir le client donne sa référence, pas un
  // identifiant de colis.
  async function chercherColis(reference) {
    const ref = (reference || '').trim();
    if (!ref) return [];
    const { data, error } = await sb().from('colis')
      .select(CHAMPS_COLIS)
      .order('rang', { ascending: true });
    if (error) throw error;
    return (data || []).filter(function (k) {
      return k.commande && String(k.commande.reference).toLowerCase() === ref.toLowerCase();
    });
  }

  async function chercherCommande(reference) {
    const { data, error } = await sb().from('commandes')
      .select(CHAMPS).ilike('reference', (reference || '').trim()).maybeSingle();
    if (error) throw error;
    return data;
  }

  /* La chaîne de suivi. Les étapes sont déclarées ici une fois et
     servent partout : boutons de l'agent, libellés, ordre.
     Reculer est impossible, la base le refuse. */
  const ETAPES = [
    { code: 'recue',            nom: 'Commande reçue' },
    { code: 'confirmee',        nom: 'Confirmée par téléphone' },
    { code: 'en_preparation',   nom: 'Le vendeur prépare la commande' },
    { code: 'prete',            nom: 'Le vendeur confirme : commande prête' },
    { code: 'en_transit',       nom: 'Flashipping a récupéré le colis' },
    { code: 'au_point_retrait', nom: 'Colis scanné disponible en succursale' },
    { code: 'code_valide',      nom: 'Payée et retirée' },
    { code: 'cloturee',         nom: 'Terminée — vendeur réglé' }
  ];

  function rangEtape(statut) {
    for (let i = 0; i < ETAPES.length; i++) if (ETAPES[i].code === statut) return i;
    if (statut === 'payee' || statut === 'fonds_bloques') return 4;
    if (statut === 'fonds_liberes') return 6;
    return -1; // litige, remboursée, abandonnée : hors chaîne
  }

  // LA seule étape suivante. Pas de raccourci : chaque étape correspond
  // à une confirmation venue d'une personne différente — le vendeur dit
  // que c'est prêt, le transporteur dit qu'il a embarqué et donne son
  // numéro de suivi, la succursale dit que le colis est scanné. Sauter
  // une étape, c'est affirmer un fait que personne n'a confirmé.
  function etapeSuivante(statut) {
    const r = rangEtape(statut);
    if (r < 0 || r >= ETAPES.length - 1) return null;
    const e = ETAPES[r + 1];
    // "Payée et retirée" se franchit avec le code du client, ailleurs.
    return e.code === 'code_valide' ? null : e;
  }

  /* C'est le COLIS qui avance, pas la commande : celui du Cap peut
     être au comptoir pendant que celui de Hinche roule encore. Seul
     l'appel de confirmation reste au niveau de la commande, parce
     qu'on appelle le client une fois, pas une fois par colis. */
  async function avancerColis(id, statut, numeroSuivi) {
    const { data, error } = await sb().rpc('avancer_colis', {
      p_colis: id, p_statut: statut, p_numero_suivi: numeroSuivi || null
    });
    if (error) throw error;
    return data;
  }

  async function confirmerTelephone(commandeId) {
    const { data, error } = await sb().rpc('confirmer_telephone', { p_commande: commandeId });
    if (error) throw error;
    return data;
  }

  async function marquerArrivee(colisId) { return avancerColis(colisId, 'au_point_retrait'); }

  async function validerRetrait(colisId, code, moyen) {
    const { data, error } = await sb().rpc('valider_retrait_colis', {
      p_colis: colisId, p_code: (code || '').trim(), p_moyen: moyen || 'especes'
    });
    if (error) throw error;
    return data;
  }

  /* Un colis annulé retombe seul : son montant et son frais sortent du
     total, les autres colis continuent. fauteAcheteur distingue le
     client qui ne se présente pas — son compteur d'abandons monte —
     du vendeur défaillant, qui ne doit rien coûter à l'acheteur. */
  async function annulerColis(colisId, motif, fauteAcheteur) {
    const { data, error } = await sb().rpc('annuler_colis', {
      p_colis: colisId, p_motif: motif || null,
      p_faute_acheteur: !!fauteAcheteur
    });
    if (error) throw error;
    return data;
  }

  /* Un vendeur qui ne remet jamais sa part bloquerait le colis pour
     toujours. On retire sa part : son stock lui revient, son montant
     sort du total, l'acheteur est prévenu, et le colis repart avec ce
     qui a été remis. */
  async function retirerPartVendeur(colisId, boutiqueId, motif) {
    const { data, error } = await sb().rpc('retirer_part_vendeur', {
      p_colis: colisId, p_boutique: boutiqueId, p_motif: motif || null
    });
    if (error) throw error;
    return data;
  }

  // Le vendeur déclare SA part prête. Le colis ne passe « prêt » que
  // lorsque tous les vendeurs de la ville ont fini.
  async function maPartEstPrete(colisId) {
    const { data, error } = await sb().rpc('ma_part_est_prete', { p_colis: colisId });
    if (error) throw error;
    return data;
  }

  return {
    connexion: connexion, deconnexion: deconnexion,
    monRole: monRole, estEquipe: estEquipe,
    toutesBoutiques: toutesBoutiques, creerBoutique: creerBoutique,
    majStatutBoutique: majStatutBoutique, majBoutique: majBoutique,
    plans: plans, definirPlan: definirPlan, slugifier: slugifier,
    creerPlan: creerPlan, majPlan: majPlan, boutiquesParPlan: boutiquesParPlan,
    tousPoints: tousPoints, creerPoint: creerPoint, majPoint: majPoint,
    supprimerPoint: supprimerPoint, creerTarif: creerTarif, majTarif: majTarif,
    supprimerTarif: supprimerTarif, communesVendeurs: communesVendeurs,
    ETAPES: ETAPES, rangEtape: rangEtape, etapeSuivante: etapeSuivante,
    avancerColis: avancerColis, maPartEstPrete: maPartEstPrete,
    retirerPartVendeur: retirerPartVendeur,
    toutesCategories: toutesCategories, creerCategorie: creerCategorie,
    majCategorie: majCategorie, basculerCategorie: basculerCategorie,
    produitsBoutique: produitsBoutique, creerProduit: creerProduit,
    soumettreProduit: soumettreProduit, refuserProduit: refuserProduit,
    aReviser: aReviser, libelleDeAttributs: libelleDeAttributs,
    majProduit: majProduit, supprimerProduit: supprimerProduit,
    ajouterVariante: ajouterVariante, majVariante: majVariante,
    genererVariantes: genererVariantes, majDeclinaisons: majDeclinaisons,
    supprimerVariante: supprimerVariante,
    typeDe: typeDe, verifierMedia: verifierMedia,
    televerserMedia: televerserMedia, televerserPlusieurs: televerserPlusieurs,
    supprimerMedia: supprimerMedia,
    publier: publier, depublier: depublier,
    profilsParRole: profilsParRole, transfererBoutique: transfererBoutique,
    lienDocument: lienDocument,
    definirRole: definirRole, duAuxVendeurs: duAuxVendeurs,
    comptesEquipeFaibles: comptesEquipeFaibles,
    documentsBoutique: documentsBoutique, tousDocuments: tousDocuments,
    deposerDocument: deposerDocument,
    reglerBoutique: reglerBoutique, soldes: soldes,
    colisAPreparer: colisAPreparer, avancementColis: avancementColis,
    colisOuverts: colisOuverts, chercherColis: chercherColis,
    chercherCommande: chercherCommande,
    confirmerTelephone: confirmerTelephone, marquerArrivee: marquerArrivee,
    validerRetrait: validerRetrait, annulerColis: annulerColis
  };
})();

window.OPS = OPS;
