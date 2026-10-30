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
      .select('*, variantes(id, libelle, stock, prix), medias(id, chemin, ordre, type, mime)')
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

  // Un produit déjà commandé ne se supprime pas : sa variante est protégée
  // par une clé étrangère, pour que l'historique des ventes reste intact.
  // On explique au lieu de laisser passer l'erreur brute de Postgres.
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

  async function ajouterVariante(produitId, libelle, prix, stock) {
    const { data, error } = await sb().from('variantes').insert({
      produit: produitId,
      libelle: (libelle || '').trim() || 'Standard',
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
    toutesCategories: toutesCategories, creerCategorie: creerCategorie,
    majCategorie: majCategorie, basculerCategorie: basculerCategorie,
    produitsBoutique: produitsBoutique, creerProduit: creerProduit,
    majProduit: majProduit, supprimerProduit: supprimerProduit,
    ajouterVariante: ajouterVariante, majVariante: majVariante,
    supprimerVariante: supprimerVariante,
    typeDe: typeDe, verifierMedia: verifierMedia,
    televerserMedia: televerserMedia, televerserPlusieurs: televerserPlusieurs,
    supprimerMedia: supprimerMedia,
    publier: publier, depublier: depublier,
    commandesOuvertes: commandesOuvertes, chercherCommande: chercherCommande,
    confirmerTelephone: confirmerTelephone, marquerArrivee: marquerArrivee,
    validerRetrait: validerRetrait, marquerAbandon: marquerAbandon
  };
})();

window.ADMIN = ADMIN;
