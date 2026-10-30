/* ============================================================
   Boutique Lakay — interface

   Aucune requête Supabase ici : tout passe par API (api.js).
   Aucun texte en dur dans les vues : tout passe par t() (T ci-dessous),
   parce que l'app doit tenir en français et en créole.
   ============================================================ */

/* ---------- Libellés -------------------------------------- */

const T = {
  fr: {
    search:'Chercher un article', boost:'Mises en avant', all:'Tous les articles',
    shops:'Boutiques', shopsNote:'Grand Nord. Chaque vendeur est vérifié avant publication.',
    sellHere:'Vendre sur Boutique Lakay',
    cart:'Panier', orders:'Mes commandes',
    ordersNote:'Suivez chaque commande jusqu’au retrait.',
    messages:'Mes messages',
    messagesNote:'Les avis sur vos commandes arrivent ici.',
    noMessages:'Aucun message pour le moment.',
    voirCommande:'Voir la commande →',
    navHome:'Accueil', navShops:'Boutiques', navOrders:'Commandes', navCart:'Panier',
    back:'← Retour', items:'articles', by:'Vendu par', stock:'en stock',
    add:'Mettre au panier', soldout:'Rupture de stock', size:'Choix', verified:'VÉRIFIÉ', pickAll:'Choisissez chaque option',
    emptyCat:'Aucun article publié pour le moment.',
    emptyShops:'Aucune boutique vérifiée pour le moment.',
    emptyCart:'Votre panier est vide.', browse:'Voir les articles',
    noOrders:'Aucune commande pour le moment.',
    sub:'Sous-total', fee:'Retrait', total:'Total', pickT:'Point de retrait',
    order:'Commander', ordering:'Envoi…',
    yourName:'Votre nom', yourPhone:'Téléphone',
    phoneWhy:'Un agent vous appelle pour confirmer avant que le colis ne quitte la boutique.',
    needName:'Indiquez votre nom et votre téléphone.',
    payT:'Vous payez au retrait',
    payB:'Aucun paiement en ligne pendant le pilote. Vous réglez en espèces au comptoir, après avoir vu l’article.',
    soon:'Bientôt',
    prepay:'Prépaiement exigé par le vendeur',
    doneT:'Commande enregistrée', codeT:'Code de retrait',
    codeNote:'À présenter au comptoir avec votre paiement.',
    codeDevice:'Ce code est gardé sur cet appareil. Un agent peut le retrouver si vous le perdez.',
    delay:'Vous avez 72 heures après l’arrivée du colis pour venir le retirer.',
    trackBtn:'Suivre ma commande', backHome:'Retour à l’accueil',
    st1:'Commande reçue', st2:'Confirmée par téléphone',
    st3:'En préparation chez le vendeur', st4:'Prête — en attente du livreur',
    st5:'Embarquée vers le point de retrait', st6:'Arrivée au point de retrait',
    st7:'Payée et retirée', st8:'Terminée',
    pillPrep2:'En préparation', pillTransit:'En route',
    pillAtt:'En préparation', pillReady:'À retirer', pillDone:'Terminée', pillKo:'Annulée',
    orderOf:'Commande du', offline:'Hors ligne — affichage du dernier catalogue connu.',
    stale:'Catalogue peut-être ancien. Reconnectez-vous pour le rafraîchir.',
    loadErr:'Impossible de charger. Vérifiez votre connexion.',
    zone:'Zone de service',
    from:'à partir de', video:'Vidéo de l\u2019article',
    tracking:'Numéro de suivi Flashipping', trackingLink:'Suivre chez Flashipping',
    yourEmail:'Adresse e-mail (facultatif)',
    account:'Votre compte', pin:'Code secret (6 chiffres)',
    myAccount:'Mon compte', createAccount:'Créer mon compte',
    whyAccount:'Un compte vous permet de retrouver vos commandes et votre code de retrait depuis n\u2019importe quel téléphone. Il nous servira aussi à vous proposer ce qui se vend près de chez vous.',
    departement:'Département', commune:'Commune',
    editAccount:'Modifier', chooseDep:'Département de retrait',
    chooseCom:'Commune', noPoint:'Aucun point de retrait dans cette commune.',
    pickPoint:'Choisissez votre point de retrait',
    needPlace:'Choisissez votre département et votre commune.',
    saveProfile:'Enregistrer', saved:'Enregistré.',
    browseFirst:'Vous pouvez parcourir la boutique sans compte. Il n\u2019est demandé qu\u2019au moment de commander.',
    goOrder:'Créer mon compte pour commander',
    pinWhy:'Il vous permet de retrouver vos commandes et votre code de retrait depuis n\u2019importe quel téléphone, même si vous perdez celui-ci.',
    haveAccount:'J\u2019ai déjà un compte', newAccount:'Créer un compte',
    signIn:'Se connecter', signOut:'Se déconnecter',
    needPin:'Choisissez un code secret de 6 chiffres.',
    needTel:'Numéro invalide. Exemple : 3132 4336.',
    connected:'Connecté', guest:'Compte de passage',
    lostCode:'Code perdu ? En demander un nouveau',
    tooMany:'Trop d\u2019essais. Réessayez dans ',
    minutes:'min', seconds:'s',
    attemptsLeft:' essai(s) avant blocage',
    askAgent:'Si vous avez oublié votre code secret, passez à une succursale Flashipping avec votre pièce d\u2019identité : un agent peut vous rouvrir l\u2019accès.',
    newCodeDone:'Nouveau code. L\u2019ancien ne vaut plus rien.',
    emailWhy:'Pour être prévenu dès que votre colis est disponible au comptoir.',
    videoData:'La vidéo ne se télécharge que si vous appuyez sur lecture.'
  },
  ht: {
    search:'Chèche yon atik', boost:'Mete devan', all:'Tout atik yo',
    shops:'Boutik', shopsNote:'Gran Nò. Chak machann verifye anvan nou pibliye.',
    sellHere:'Vann sou Boutique Lakay',
    cart:'Panyen', orders:'Kòmand mwen',
    ordersNote:'Swiv chak kòmand jiska retrè a.',
    messages:'Mesaj mwen',
    messagesNote:'Avi sou kòmand ou yo rive la.',
    noMessages:'Pa gen mesaj pou kounye a.',
    voirCommande:'Gade kòmand lan →',
    navHome:'Akèy', navShops:'Boutik', navOrders:'Kòmand', navCart:'Panyen',
    back:'← Tounen', items:'atik', by:'Machann', stock:'nan stock',
    add:'Mete nan panyen', soldout:'Pa gen ankò', size:'Chwa', verified:'VERIFYE', pickAll:'Chwazi chak opsyon',
    emptyCat:'Pa gen atik pibliye pou kounye a.',
    emptyShops:'Pa gen boutik verifye pou kounye a.',
    emptyCart:'Panyen w vid.', browse:'Gade atik yo',
    noOrders:'Pa gen kòmand pou kounye a.',
    sub:'Sou-total', fee:'Retrè', total:'Total', pickT:'Kote pou pran l',
    order:'Kòmande', ordering:'N ap voye…',
    yourName:'Non w', yourPhone:'Telefòn',
    phoneWhy:'Yon ajan rele w pou konfime anvan kolis la kite boutik la.',
    needName:'Mete non w ak telefòn ou.',
    payT:'Ou peye lè w pran l',
    payB:'Pa gen peman sou entènèt pandan pilòt la. Ou peye kach nan kontwa a, apre ou wè atik la.',
    soon:'Talè',
    prepay:'Machann lan mande pou w peye davans',
    doneT:'Kòmand anrejistre', codeT:'Kòd pou pran l',
    codeNote:'Montre l nan kontwa a ak peman w.',
    codeDevice:'Kòd la rete sou aparèy sa a. Yon ajan ka jwenn li si w pèdi l.',
    delay:'Ou gen 72 è apre kolis la rive pou vin pran l.',
    trackBtn:'Swiv kòmand mwen', backHome:'Tounen nan akèy',
    st1:'Nou resevwa kòmand lan', st2:'Konfime nan telefòn',
    st3:'Machann lan ap prepare l', st4:'Pare — n ap tann livrè a',
    st5:'Sou wout pwen retrè a', st6:'Rive nan pwen retrè a',
    st7:'Peye epi pran', st8:'Fini',
    pillPrep2:'N ap prepare', pillTransit:'Sou wout',
    pillAtt:'N ap prepare', pillReady:'Pou pran', pillDone:'Fini', pillKo:'Anile',
    orderOf:'Kòmand', offline:'Pa gen entènèt — n ap montre dènye katalòg nou te genyen.',
    stale:'Katalòg la ka vye. Konekte pou rafrechi l.',
    loadErr:'Nou pa ka chaje. Tcheke koneksyon w.',
    zone:'Zòn sèvis',
    from:'apati de', video:'Videyo atik la',
    tracking:'Nimewo swivi Flashipping', trackingLink:'Swiv li lakay Flashipping',
    yourEmail:'Adrès imèl (si w vle)',
    account:'Kont ou', pin:'Kòd sekrè (6 chif)',
    myAccount:'Kont mwen', createAccount:'Kreye kont mwen',
    whyAccount:'Yon kont kite w jwenn kòmand ou ak kòd retrè w sou nenpòt telefòn. L ap sèvi tou pou nou pwopoze w sa k ap vann toupre lakay ou.',
    departement:'Depatman', commune:'Komin',
    editAccount:'Chanje', chooseDep:'Depatman pou pran l',
    chooseCom:'Komin', noPoint:'Pa gen pwen retrè nan komin sa a.',
    pickPoint:'Chwazi pwen retrè w',
    needPlace:'Chwazi depatman w ak komin ou.',
    saveProfile:'Anrejistre', saved:'Anrejistre.',
    browseFirst:'Ou ka gade boutik la san kont. Nou mande l sèlman lè w ap kòmande.',
    goOrder:'Kreye kont mwen pou m kòmande',
    pinWhy:'Li kite w jwenn kòmand ou ak kòd retrè w sou nenpòt telefòn, menm si w pèdi sa a.',
    haveAccount:'Mwen gen yon kont deja', newAccount:'Kreye yon kont',
    signIn:'Konekte', signOut:'Dekonekte',
    needPin:'Chwazi yon kòd sekrè 6 chif.',
    needTel:'Nimewo pa bon. Egzanp : 3132 4336.',
    connected:'Konekte', guest:'Kont pasaj',
    lostCode:'Ou pèdi kòd la ? Mande yon lòt',
    tooMany:'Twòp esè. Tanpri tann ',
    minutes:'min', seconds:'s',
    attemptsLeft:' esè anvan nou bloke w',
    askAgent:'Si w bliye kòd sekrè w, pase nan yon sikisal Flashipping ak pyès idantite w : yon ajan ka relouvri aksè a.',
    newCodeDone:'Nouvo kòd. Ansyen an pa vo anyen ankò.',
    emailWhy:'Pou nou avèti w lè kolis ou disponib nan kontwa a.',
    videoData:'Videyo a ap chaje sèlman si w peze bouton lekti a.'
  }
};

/* ---------- État ------------------------------------------ */

let lang = CONFIG.langueParDefaut;
try { const l = localStorage.getItem('bl:lang'); if (l === 'fr' || l === 'ht') lang = l; } catch (e) {}

let vue = 'home';
let vuePrec = 'home';
let cat = 'all';
let recherche = '';
let panier = [];
try { panier = JSON.parse(localStorage.getItem('bl:panier') || '[]'); } catch (e) { panier = []; }

let cache = { categories: [], points: [], tarifs: [], produits: [], boutiques: [],
  commandes: [], messages: [] };
let prodCourant = null, boutiqueCourante = null, commandeCourante = null;
let pointChoisi = null;
let depRetrait = null;    // département choisi pour le retrait
let comRetrait = null;    // commune choisie pour le retrait
let derniereCommande = null;
let horsLigne = false, catalogueVieux = false;
let envoiEnCours = false;
let invite = true;        // session de passage tant qu'aucun compte n'est cree
let modeConnexion = false; // le panier montre le formulaire de connexion

/* ---------- Utilitaires ----------------------------------- */

function t(k) { return (T[lang] && T[lang][k]) || T.fr[k] || k; }
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Les montants sont en centimes partout. Une seule fonction les met en forme.
function htg(c) { return new Intl.NumberFormat('fr-FR').format(Math.round(c / 100)) + ' HTG'; }
function usd(c) { return (c / 100 / CONFIG.tauxUsd).toFixed(2) + ' $'; }
function el(id) { return document.getElementById(id); }
function val2(id) { const e = el(id); return e ? e.value.trim() : ''; }
function glyphe(c) { return c === 'bote' ? 'g-bote' : (c === 'elek' ? 'g-elek' : 'g-rad'); }
function teinte(c) { return c === 'bote' ? 't-bote' : (c === 'elek' ? 't-elek' : 't-rad'); }

// Première photo seulement : une vidéo ne fait pas une vignette.
function photo(p) {
  if (!p) return null;
  const img = API.medias(p, 'image');
  return img.length ? API.photoUrl(img[0].chemin) : null;
}
function videoDe(p) {
  const v = API.medias(p, 'video');
  return v.length ? API.photoUrl(v[0].chemin) : null;
}
// Prix réellement payé : celui de la variante s'il existe.
function prixDe(p, v) { return API.prixVariante(p, v); }
function visuel(p, classe) {
  const url = photo(p);
  if (url) return '<img src="' + esc(url) + '" alt="' + esc(p.nom) + '" loading="lazy">';
  return '<svg><use href="#' + glyphe(p.categorie) + '"/></svg>';
}
function stockTotal(p) {
  if (!p.variantes || !p.variantes.length) return 0;
  return p.variantes.reduce(function (n, v) { return n + (v.stock || 0); }, 0);
}
function enAvant(p) {
  return !!(p.mis_en_avant_jusqu_au && new Date(p.mis_en_avant_jusqu_au) > new Date());
}
function sauverPanier() {
  try { localStorage.setItem('bl:panier', JSON.stringify(panier)); } catch (e) {}
}

/* ---------- Essais de connexion ---------------------------

   Ce compteur vit dans l'appareil. Il ne protège donc PAS contre
   quelqu'un qui attaquerait le serveur depuis ailleurs — ça, c'est
   le rôle des limites d'authentification de Supabase, réglables
   dans son tableau de bord.

   Il protège contre la menace réelle ici : un téléphone perdu ou
   volé, entre les mains de quelqu'un qui essaie des codes. Cette
   personne utilise l'app sur CET appareil, donc ce compteur l'arrête.

   Un blocage côté serveur par numéro serait pire : n'importe qui
   connaissant ton numéro pourrait t'enfermer dehors en saisissant
   exprès de faux codes.                                          */

const PALIERS = [
  { echecs: 3,  attente: 30 },      // secondes
  { echecs: 5,  attente: 5 * 60 },
  { echecs: 7,  attente: 30 * 60 },
  { echecs: 10, attente: 60 * 60 }
];

function lireEssais(tel) {
  try {
    const t = JSON.parse(localStorage.getItem('bl:essais') || '{}');
    return t[tel] || { n: 0, jusqu: 0 };
  } catch (e) { return { n: 0, jusqu: 0 }; }
}

function ecrireEssais(tel, v) {
  try {
    const t = JSON.parse(localStorage.getItem('bl:essais') || '{}');
    if (v) t[tel] = v; else delete t[tel];
    localStorage.setItem('bl:essais', JSON.stringify(t));
  } catch (e) {}
}

function blocageRestant(tel) {
  const e = lireEssais(tel);
  const reste = Math.ceil((e.jusqu - Date.now()) / 1000);
  return reste > 0 ? reste : 0;
}

function noterEchec(tel) {
  const e = lireEssais(tel);
  e.n = (e.n || 0) + 1;
  let attente = 0;
  PALIERS.forEach(function (p) { if (e.n >= p.echecs) attente = p.attente; });
  e.jusqu = attente ? Date.now() + attente * 1000 : 0;
  ecrireEssais(tel, e);
  return e;
}

function essaisAvantBlocage(tel) {
  const e = lireEssais(tel);
  const prochain = PALIERS.filter(function (p) { return p.echecs > (e.n || 0); })[0];
  return prochain ? prochain.echecs - (e.n || 0) : 0;
}

function dureeLisible(secondes) {
  if (secondes >= 60) return Math.ceil(secondes / 60) + ' ' + t('minutes');
  return secondes + ' ' + t('seconds');
}

/* ---------- Chargement ------------------------------------ */

async function chargerReferentiels() {
  try {
    const [c, p, t] = await Promise.all([
      API.categories(), API.pointsRetrait(), API.tarifs()
    ]);
    cache.categories = c.data || [];
    cache.points = p.data || [];
    cache.tarifs = t.data || [];
    horsLigne = c.horsLigne || p.horsLigne;
  } catch (e) { horsLigne = true; }
}

async function chargerCatalogue() {
  try {
    const r = await API.produits({ categorie: cat });
    cache.produits = r.data || [];
    horsLigne = !!r.horsLigne;
    catalogueVieux = !!r.perime;
  } catch (e) {
    cache.produits = [];
    horsLigne = true;
  }
}

/* ---------- Bandeau --------------------------------------- */

function majBandeau() {
  const b = el('bandeau'), txt = el('bandTxt');
  b.classList.remove('offline');
  if (horsLigne) {
    txt.textContent = t('offline');
    b.classList.add('offline');
    b.hidden = false;
  } else if (catalogueVieux) {
    txt.textContent = t('stale');
    b.classList.add('offline');
    b.hidden = false;
  } else if (CONFIG.phase === 'pilote') {
    txt.textContent = t('payT') + ' · ' + t('zone') + ' : ' + CONFIG.zone;
    b.hidden = false;
  } else {
    b.hidden = true;
  }
}

/* ---------- Rendu : catalogue ----------------------------- */

function carte(p) {
  const rupture = stockTotal(p) <= 0;
  const f = API.fourchette(p);
  // Variantes à prix différents : « à partir de », plutôt qu'un prix
  // affiché ici qui changerait sur la fiche.
  const prix = f.min === f.max ? htg(f.min) : t('from') + ' ' + htg(f.min);
  return '<button class="card" data-prod="' + esc(p.id) + '">' +
    '<span class="tile ' + teinte(p.categorie) + '">' +
      (enAvant(p) ? '<span class="boost">' + esc(t('boost')) + '</span>' : '') +
      visuel(p) + '</span>' +
    '<span class="cbody">' +
      '<span class="cname">' + esc(p.nom) + '</span>' +
      '<span class="cshop">' + esc(p.boutique ? p.boutique.nom : '') + '</span>' +
      '<span class="cprice num">' + prix + '</span>' +
      '<span class="cusd num">' + usd(f.min) +
        (rupture ? ' · ' + esc(t('soldout')) : '') + '</span>' +
    '</span></button>';
}

function rendreRail() {
  let h = '<button class="chip" data-cat="all" aria-pressed="' + (cat === 'all') + '">' +
          esc(lang === 'fr' ? 'Tout' : 'Tout') + '</button>';
  cache.categories.forEach(function (c) {
    h += '<button class="chip" data-cat="' + esc(c.code) + '" aria-pressed="' + (cat === c.code) + '">' +
         esc(lang === 'fr' ? c.nom_fr : c.nom_ht) + '</button>';
  });
  el('rail').innerHTML = h;
}

function filtres() {
  const q = recherche.trim().toLowerCase();
  return cache.produits.filter(function (p) {
    if (!q) return true;
    const nom = (p.nom + ' ' + (p.boutique ? p.boutique.nom : '')).toLowerCase();
    return nom.indexOf(q) !== -1;
  });
}

function rendreAccueil() {
  rendreRail();
  const liste = filtres();
  const vedettes = liste.filter(enAvant);

  el('boostWrap').hidden = vedettes.length === 0;
  el('boostTitle').textContent = t('boost');
  el('boostGrid').innerHTML = vedettes.map(carte).join('');

  el('allTitle').textContent = t('all');
  el('count').textContent = liste.length ? liste.length + ' ' + t('items') : '';
  el('grid').innerHTML = liste.length
    ? liste.map(carte).join('')
    : '<p class="empty">' + esc(horsLigne ? t('loadErr') : t('emptyCat')) + '</p>';
}

/* ---------- Rendu : boutiques ----------------------------- */

async function rendreBoutiques() {
  el('shopsTitle').textContent = t('shops');
  el('shopsNote').textContent = t('shopsNote');
  if (!cache.boutiques.length) {
    try { const r = await API.boutiques(); cache.boutiques = r.data || []; } catch (e) {}
  }
  const b = cache.boutiques;
  const lienVendre = '<a class="ghost" href="devenir-vendeur.html" ' +
    'style="display:block;text-align:center;text-decoration:none;margin-top:6px">' +
    esc(t('sellHere')) + '</a>';
  el('shopList').innerHTML = (b.length ? b.map(function (s) {
    return '<button class="shop" data-shop="' + esc(s.id) + '">' +
      '<span class="avatar t-rad">' + esc((s.nom || '?').charAt(0)) + '</span>' +
      '<span class="shopmeta">' +
        '<span class="shopname">' + esc(s.nom) +
          ' <span class="badge ok">' + esc(t('verified')) + '</span></span>' +
        '<span class="shopsub">' + esc(s.commune) + '</span>' +
      '</span></button>';
  }).join('') : '<p class="empty">' + esc(t('emptyShops')) + '</p>') + lienVendre;
}

async function rendreBoutique() {
  const s = cache.boutiques.filter(function (x) { return x.id === boutiqueCourante; })[0];
  if (!s) return;
  el('shopBack').textContent = t('back');
  el('shopHead').innerHTML =
    '<div class="sechead"><h2>' + esc(s.nom) + '</h2></div>' +
    '<p class="note">' + esc(s.commune) + ' · ' + esc(t('verified')) + '</p>';
  el('shopGrid').innerHTML = '<p class="empty">…</p>';
  try {
    const r = await API.produits({ boutique: s.id });
    const liste = r.data || [];
    el('shopGrid').innerHTML = liste.length
      ? liste.map(carte).join('')
      : '<p class="empty">' + esc(t('emptyCat')) + '</p>';
  } catch (e) {
    el('shopGrid').innerHTML = '<p class="empty">' + esc(t('loadErr')) + '</p>';
  }
}

/* ---------- Rendu : produit ------------------------------- */

function blocPaiement() {
  const futurs = moyensAVenir();
  let h = '<div class="trust"><svg><use href="#i-lock"/></svg><p>' +
    '<strong>' + esc(t('payT')) + '</strong>' + esc(t('payB')) + '</p></div>';
  if (futurs.length) {
    h += '<p class="note" style="padding:0">' + esc(t('soon')) + ' : ' +
      futurs.map(function (m) { return esc(m.nom[lang] || m.nom.fr); }).join(' · ') + '</p>';
  }
  return h;
}

// Variante actuellement choisie sur la fiche ouverte, et le choix
// axe par axe quand le produit se décline sur plusieurs dimensions.
let varianteChoisie = null;
let choixAxes = {};

// Retrouve la variante qui correspond au choix complet. Tant qu'un axe
// n'est pas choisi, il n'y a pas de variante : on le dit plutôt que
// d'en prendre une au hasard.
function varianteSelonAxes(p) {
  const vars = (p.variantes || []).filter(function (v) { return v.stock > 0; });
  const axes = Object.keys(choixAxes);
  if (!axes.length) return null;
  return vars.filter(function (v) {
    return axes.every(function (a) { return (v.attributs || {})[a] === choixAxes[a]; });
  })[0] || null;
}

function majPrixAffiche() {
  const p = prodCourant;
  if (!p) return;
  const vars = (p.variantes || []).filter(function (v) { return v.stock > 0; });
  const v = varianteSelonAxes(p) ||
    vars.filter(function (x) { return x.id === varianteChoisie; })[0] || vars[0] || null;
  if (v) varianteChoisie = v.id;
  const prix = prixDe(p, v);
  const zp = el('zonePrix'), zu = el('zoneUsd'), zs = el('zoneStock');
  if (zp) zp.textContent = htg(prix);
  if (zu) zu.textContent = usd(prix);
  if (zs) zs.textContent = v ? String(v.stock) : '0';
}

function rendreProduit() {
  const p = prodCourant;
  if (!p) return;
  el('prodBack').textContent = t('back');
  const vars = (p.variantes || []).filter(function (v) { return v.stock > 0; });
  const rupture = stockTotal(p) <= 0;
  varianteChoisie = vars.length ? vars[0].id : null;
  // Au premier affichage, on présélectionne la combinaison de la
  // première variante disponible : l'acheteur voit un prix, pas un vide.
  choixAxes = {};
  if (vars.length) {
    Object.keys(vars[0].attributs || {}).forEach(function (k) {
      choixAxes[k] = vars[0].attributs[k];
    });
  }
  const vidUrl = videoDe(p);

  // Le libellé montre le prix quand les variantes n'ont pas le même :
  // « 100 ml » et « 50 ml » n'ont de sens qu'avec leur prix à côté.
  const prixDifferents = vars.length > 1 &&
    vars.some(function (v) { return prixDe(p, v) !== prixDe(p, vars[0]); });

  let vh = '';
  if (vars.length) {
    vh = '<div><div class="vlabel">' + esc(t('size')) + '</div><div class="variants">' +
      vars.map(function (v, i) {
        return '<button class="chip" data-var="' + esc(v.id) + '" aria-pressed="' + (i === 0) + '">' +
          esc(v.libelle) +
          (prixDifferents ? ' · ' + htg(prixDe(p, v)) : '') + '</button>';
      }).join('') + '</div></div>';
  }

  el('prod').innerHTML =
    '<div class="phero ' + teinte(p.categorie) + '">' + visuel(p) + '</div>' +
    '<h1 class="pname">' + esc(p.nom) + '</h1>' +
    '<div class="prow"><span class="pprice num" id="zonePrix">' +
      htg(prixDe(p, vars[0])) + '</span>' +
      '<span class="cusd num" id="zoneUsd">' + usd(prixDe(p, vars[0])) + '</span></div>' +
    '<p class="note" style="padding:0">' + esc(t('by')) + ' <strong>' +
      esc(p.boutique ? p.boutique.nom : '') + '</strong>' +
      (p.boutique ? ' · ' + esc(p.boutique.commune) : '') +
      ' · <span class="num" id="zoneStock">' +
      (vars[0] ? vars[0].stock : 0) + '</span> ' + esc(t('stock')) + '</p>' +
    (p.description
      ? '<p class="desc">' + esc(p.description) + '</p>' : '') +
    vh +
    // preload="metadata" : la vidéo ne se télécharge pas toute seule.
    // Sur un forfait haïtien, un téléchargement non demandé est un vol.
    (vidUrl
      ? '<div><div class="vlabel">' + esc(t('video')) + '</div>' +
        '<video class="pvideo" src="' + esc(vidUrl) + '" controls playsinline ' +
        'preload="metadata"' + (photo(p) ? ' poster="' + esc(photo(p)) + '"' : '') + '></video>' +
        '<p class="note" style="padding:4px 0 0">' + esc(t('videoData')) + '</p></div>'
      : '') +
    (p.prepaiement_exige
      ? '<div class="warnbox">' + esc(t('prepay')) + '</div>'
      : blocPaiement()) +
    '<button class="cta" id="addBtn"' + (rupture ? ' disabled' : '') + '>' +
      esc(rupture ? t('soldout') : t('add')) + '</button>';
}

/* ---------- Rendu : panier ------------------------------- */

/* Le panier affiche EXACTEMENT ce que la base facturera : même règle,
   même tarifs. Un total qui change au moment de valider est la
   meilleure façon de perdre un acheteur. */
function totaux() {
  let sous = 0;
  // Un frais par boutique, comme en base : chacune remet son colis.
  const origines = [];
  panier.forEach(function (l) {
    sous += l.prix * l.quantite;
    if (!origines.some(function (o) { return o.id === l.boutiqueId; })) {
      origines.push({ id: l.boutiqueId, commune: l.boutiqueCommune });
    }
  });
  const pt = (cache.points || []).filter(function (p) { return p.id === pointChoisi; })[0];
  const frais = pt ? API.calculerFrais(pt, origines, cache.tarifs) : 0;
  return { sous: sous, frais: frais, total: sous + frais };
}

async function rendrePanier() {
  el('cartTitle').textContent = t('cart');
  const zone = el('cartBody');

  if (!panier.length) {
    zone.innerHTML = '<p class="empty">' + esc(t('emptyCart')) + '</p>' +
      '<button class="ghost" data-go="home">' + esc(t('browse')) + '</button>';
    return;
  }

  let h = '<div class="shoplist">' + panier.map(function (l, i) {
    return '<div class="line">' +
      '<span class="lthumb ' + teinte(l.categorie) + '">' +
        (l.photo ? '<img src="' + esc(l.photo) + '" alt="">' :
          '<svg><use href="#' + glyphe(l.categorie) + '"/></svg>') + '</span>' +
      '<span class="lmeta">' +
        '<span class="cname">' + esc(l.nom) + (l.libelle ? ' · ' + esc(l.libelle) : '') + '</span>' +
        '<span class="cshop">' + esc(l.boutique) + '</span>' +
        '<span class="cprice num">' + htg(l.prix * l.quantite) + '</span>' +
      '</span>' +
      '<span class="qty"><button data-dec="' + i + '" aria-label="moins">−</button>' +
        '<span class="num" style="min-width:18px;text-align:center">' + l.quantite + '</span>' +
        '<button data-inc="' + i + '" aria-label="plus">+</button></span>' +
    '</div>';
  }).join('') + '</div>';

  // Un compte est exigé pour commander. Pas pour naviguer : le mur à
  // l'entrée fait fuir un premier acheteur qui ne connaît pas encore la
  // plateforme. Mais sans compte, une commande ne vit que dans ce
  // téléphone — perdu le téléphone, perdus l'historique et le code.
  const prof = await API.profil().catch(function () { return null; });
  invite = await API.estInvite().catch(function () { return true; });

  if (invite) {
    // Le compte se crée dans son propre espace, pas au milieu du panier :
    // un formulaire d'inscription glissé entre les articles et le total
    // fait abandonner. On explique et on y envoie.
    h += '<div class="sechead"><h2 style="font-size:15px">' + esc(t('account')) + '</h2></div>' +
      '<p class="note">' + esc(t('whyAccount')) + '</p>' +
      '<button class="cta" data-go="compte">' + esc(t('goOrder')) + '</button>' +
      '<div style="height:16px"></div>';
  } else {
    // Déjà connecté : on rappelle qui commande, on ne redemande rien.
    // Ces informations sont dans son compte, il les y corrige.
    h += '<div class="sechead"><h2 style="font-size:15px">' + esc(t('account')) + '</h2>' +
        '<span class="pill done">' + esc(t('connected')) + '</span></div>' +
      '<div class="totals">' +
        '<div class="trow"><span>' + esc(t('yourName')) + '</span><strong>' +
          esc(prof && prof.nom !== 'Nouveau client' ? prof.nom : '\u2014') + '</strong></div>' +
        '<div class="trow"><span>' + esc(t('yourPhone')) + '</span>' +
          '<strong class="num">' + esc(prof ? prof.telephone : '\u2014') + '</strong></div>' +
        '<div class="trow"><span></span>' +
          '<button class="lienCompte" data-go="compte">' + esc(t('editAccount')) + '</button></div>' +
      '</div>' +
      '<p class="note">' + esc(t('phoneWhy')) + '</p>' +
      '<div id="compteErr"></div>';
  }

  /* Le point de retrait se choisit en descendant : département, puis
     commune, puis le point. Avec des points dans tout le pays, une
     liste plate deviendrait inutilisable — et l'acheteur cherche de
     toute façon « près de chez moi », pas « dans la liste ». */
  const pts = (cache.points || []).filter(function (p) { return p.actif !== false; });
  const deps = [];
  pts.forEach(function (p) {
    const d = p.departement || departementDe(p.commune);
    if (d && deps.indexOf(d) === -1) deps.push(d);
  });
  deps.sort();

  // Par défaut, là où habite l'acheteur : c'est presque toujours le bon.
  // La comparaison ignore accents et casse, sinon un point saisi
  // « Cap-Haitien » ne serait jamais reconnu comme la ville de
  // l'acheteur, qui a choisi « Cap-Haïtien » dans la liste.
  const memeTexte = function (a, b) {
    return (typeof memeLieu === 'function') ? memeLieu(a, b) : a === b;
  };
  const dedans = function (liste, x) {
    return liste.filter(function (v) { return memeTexte(v, x); })[0] || null;
  };

  if (!depRetrait) {
    const sien = (prof && prof.departement) || departementDe(prof && prof.commune);
    depRetrait = dedans(deps, sien) || deps[0] || null;
    comRetrait = null;
  }

  const dansDep = pts.filter(function (p) {
    return memeTexte(p.departement || departementDe(p.commune), depRetrait);
  });
  const coms = [];
  dansDep.forEach(function (p) { if (!dedans(coms, p.commune)) coms.push(p.commune); });
  coms.sort();

  if (!comRetrait || !dedans(coms, comRetrait)) {
    comRetrait = dedans(coms, prof && prof.commune) || coms[0] || null;
  }

  const dansCom = dansDep.filter(function (p) { return memeTexte(p.commune, comRetrait); });
  if (!dansCom.some(function (p) { return p.id === pointChoisi; })) {
    pointChoisi = dansCom.length ? dansCom[0].id : null;
  }

  h += '<div class="sechead"><h2 style="font-size:15px">' + esc(t('pickT')) + '</h2></div>' +
    '<div class="shoplist">' +
      '<div class="champ"><label for="rDep">' + esc(t('chooseDep')) + '</label>' +
        '<select id="rDep">' + deps.map(function (d) {
          return '<option value="' + esc(d) + '"' + (memeTexte(d, depRetrait) ? ' selected' : '') +
            '>' + esc(d) + '</option>';
        }).join('') + '</select></div>' +
      '<div class="champ"><label for="rCom">' + esc(t('chooseCom')) + '</label>' +
        '<select id="rCom">' + coms.map(function (c) {
          return '<option value="' + esc(c) + '"' + (memeTexte(c, comRetrait) ? ' selected' : '') +
            '>' + esc(c) + '</option>';
        }).join('') + '</select></div>' +
    '</div>' +
    (dansCom.length
      ? '<p class="note">' + esc(t('pickPoint')) + '</p><div class="picker">' +
        dansCom.map(function (pt) {
          return '<button class="pick" data-pick="' + esc(pt.id) + '" aria-pressed="' +
            (pointChoisi === pt.id) + '">' +
            '<span class="dot"></span><span class="shopmeta">' +
            '<span class="shopname">' + esc(pt.nom) + '</span>' +
            '<span class="shopsub">' + esc(pt.repere) + '</span>' +
            '</span></button>';
        }).join('') + '</div>'
      : '<p class="note" style="color:var(--hot)">' + esc(t('noPoint')) + '</p>');

  const tt = totaux();
  h += '<div style="height:14px"></div><div class="totals">' +
    '<div class="trow"><span>' + esc(t('sub')) + '</span><span class="num">' + htg(tt.sous) + '</span></div>' +
    '<div class="trow"><span>' + esc(t('fee')) + '</span><span class="num">' + htg(tt.frais) + '</span></div>' +
    '<div class="trow big"><span>' + esc(t('total')) + '</span><span class="num">' + htg(tt.total) + '</span></div>' +
    '<div class="trow"><span></span><span class="num">' + usd(tt.total) + '</span></div>' +
    '</div>';

  h += blocPaiement();
  h += '<div class="warnbox">' + esc(t('delay')) + '</div>';
  h += '<div id="cartErr"></div>';
  // Sans compte, le bouton mène à l'inscription plutôt que d'échouer.
  h += invite
    ? '<button class="cta" data-go="compte">' + esc(t('goOrder')) + '</button>'
    : '<button class="cta" id="orderBtn">' + esc(t('order')) + ' · ' + htg(tt.total) + '</button>';
  h += '<div style="height:20px"></div>';
  zone.innerHTML = h;
}

/* ---------- Rendu : confirmation -------------------------- */

// Rang d'une etape dans la chaine. Doit rester aligne sur rang_statut()
// cote base : c'est la meme chaine, vue des deux bouts.
const CHAINE = ['recue', 'confirmee', 'en_preparation', 'prete',
                'en_transit', 'au_point_retrait', 'code_valide', 'cloturee'];

function etapes(statut) {
  const i = CHAINE.indexOf(statut);
  if (i >= 0) return i;
  if (statut === 'payee' || statut === 'fonds_bloques') return 4;
  if (statut === 'fonds_liberes') return 6;
  return -1;   // litige, remboursee, abandonnee : hors chaine
}

function blocEtapes(statut) {
  const cles = ['st1', 'st2', 'st3', 'st4', 'st5', 'st6', 'st7', 'st8'];
  const pos = etapes(statut);
  return '<div class="steps">' + cles.map(function (k, j) {
    let c = '';
    if (pos < 0) c = j === 0 ? 'done' : '';
    else if (j < pos) c = 'done';
    else if (j === pos) c = 'now';
    return '<div class="step ' + c + '"><span class="sdot"></span>' +
      '<span class="stext">' + esc(t(k)) + '</span></div>';
  }).join('') + '</div>';
}

function rendreConfirmation() {
  const c = derniereCommande;
  if (!c) { aller('orders'); return; }
  const pt = cache.points.filter(function (p) { return p.id === pointChoisi; })[0];
  el('done').innerHTML =
    '<div class="sechead"><h2>' + esc(t('doneT')) + '</h2></div>' +
    '<div class="code"><div class="eyebrow">' + esc(t('codeT')) + '</div>' +
      '<div class="codenum num">' + esc(c.code) + '</div></div>' +
    '<p class="note" style="padding:0">' + esc(t('codeNote')) + '</p>' +
    '<p class="note" style="padding:0">' + esc(t('codeDevice')) + '</p>' +
    (pt ? '<div class="totals"><div class="trow"><span>' + esc(t('pickT')) + '</span>' +
      '<span style="text-align:right">' + esc(pt.nom) + '<br>' +
      '<span class="cshop">' + esc(pt.repere) + '</span></span></div></div>' : '') +
    '<div class="totals"><div class="trow big"><span>' + esc(t('total')) + '</span>' +
      '<span class="num">' + htg(c.total) + '</span></div></div>' +
    blocEtapes('recue') +
    '<div class="warnbox">' + esc(t('phoneWhy')) + '</div>' +
    '<button class="cta" data-go="orders">' + esc(t('trackBtn')) + '</button>' +
    '<button class="ghost" data-go="home">' + esc(t('backHome')) + '</button>';
}

/* ---------- Rendu : compte -------------------------------

   Accessible depuis l'accueil, sans passer par le panier. Un
   visiteur peut créer son compte ou se connecter quand il veut :
   l'inscription n'est obligatoire qu'au moment de commander.    */

function champsLieu(dep, com, prefixe) {
  return '<div class="champ"><label for="' + prefixe + 'Dep">' + esc(t('departement')) +
      '</label><select id="' + prefixe + 'Dep">' + optionsDepartements(dep) + '</select></div>' +
    '<div class="champ"><label for="' + prefixe + 'Com">' + esc(t('commune')) +
      '</label><select id="' + prefixe + 'Com">' + optionsCommunes(dep, com) + '</select></div>';
}

async function rendreCompte() {
  invite = await API.estInvite().catch(function () { return true; });
  const prof = invite ? null : await API.profil().catch(function () { return null; });
  el('compteTitre').textContent = t('myAccount');
  const z = el('compteCorps');

  if (invite && modeConnexion) {
    z.innerHTML =
      '<div class="shoplist">' +
        '<div class="champ"><label for="lTel">' + esc(t('yourPhone')) + '</label>' +
          '<input id="lTel" type="tel" inputmode="tel" autocomplete="username"></div>' +
        '<div class="champ"><label for="lPin">' + esc(t('pin')) + '</label>' +
          '<input id="lPin" type="password" inputmode="numeric" maxlength="6" ' +
          'autocomplete="current-password"></div>' +
      '</div>' +
      '<div id="compteErr"></div>' +
      '<button class="cta" id="seConnecter">' + esc(t('signIn')) + '</button>' +
      '<button class="ghost" id="versInscription">' + esc(t('newAccount')) + '</button>';
    return;
  }

  if (invite) {
    z.innerHTML =
      '<p class="note" style="padding-top:0">' + esc(t('whyAccount')) + '</p>' +
      '<div class="shoplist">' +
        '<div class="champ"><label for="cNom">' + esc(t('yourName')) + '</label>' +
          '<input id="cNom" autocomplete="name"></div>' +
        '<div class="champ"><label for="cTel">' + esc(t('yourPhone')) + '</label>' +
          '<input id="cTel" type="tel" inputmode="tel" autocomplete="username"></div>' +
        '<div class="champ"><label for="cPin">' + esc(t('pin')) + '</label>' +
          '<input id="cPin" type="password" inputmode="numeric" maxlength="6" ' +
          'autocomplete="new-password"></div>' +
        champsLieu(null, null, 'c') +
        '<div class="champ"><label for="cMail">' + esc(t('yourEmail')) + '</label>' +
          '<input id="cMail" type="email" inputmode="email" autocomplete="email"></div>' +
      '</div>' +
      '<div id="compteErr"></div>' +
      '<button class="cta" id="creerCompte">' + esc(t('createAccount')) + '</button>' +
      '<button class="ghost" id="versConnexion">' + esc(t('haveAccount')) + '</button>' +
      '<p class="note">' + esc(t('browseFirst')) + '</p>';
    lierDepartementCommune('cDep', 'cCom');
    return;
  }

  const dep = (prof && prof.departement) || departementDe(prof && prof.commune);
  z.innerHTML =
    '<div class="shoplist">' +
      '<div class="champ"><label for="cNom">' + esc(t('yourName')) + '</label>' +
        '<input id="cNom" value="' + esc(prof && prof.nom !== 'Nouveau client' ? prof.nom : '') + '"></div>' +
      '<div class="champ"><label for="cTel">' + esc(t('yourPhone')) + '</label>' +
        '<input id="cTel" type="tel" inputmode="tel" value="' +
        esc(prof ? prof.telephone : '') + '"></div>' +
      champsLieu(dep, prof ? prof.commune : null, 'c') +
      '<div class="champ"><label for="cMail">' + esc(t('yourEmail')) + '</label>' +
        '<input id="cMail" type="email" inputmode="email" value="' +
        esc(prof && prof.email_contact ? prof.email_contact : '') + '"></div>' +
    '</div>' +
    '<div id="compteErr"></div>' +
    '<button class="cta" id="majProfil">' + esc(t('saveProfile')) + '</button>' +
    '<button class="ghost" data-go="orders">' + esc(t('orders')) + '</button>' +
    '<button class="ghost" id="seDeconnecter">' + esc(t('signOut')) + '</button>';
  lierDepartementCommune('cDep', 'cCom');
}

/* ---------- Rendu : commandes ----------------------------- */

function pastille(statut) {
  if (statut === 'remboursee' || statut === 'abandonnee') return { c: 'ko', k: 'pillKo' };
  if (statut === 'fonds_liberes' || statut === 'code_valide') return { c: 'done', k: 'pillDone' };
  if (statut === 'au_point_retrait') return { c: 'ready', k: 'pillReady' };
  return { c: 'att', k: 'pillAtt' };
}

function jour(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(lang === 'ht' ? 'fr-FR' : 'fr-FR',
      { day: 'numeric', month: 'short' });
  } catch (e) { return ''; }
}

async function rendreCommandes() {
  el('ordersTitle').textContent = t('orders');
  el('ordersNote').textContent = t('ordersNote');
  invite = await API.estInvite().catch(function () { return true; });
  const zone = el('orderList');
  zone.innerHTML = '<p class="empty">…</p>';
  try {
    cache.commandes = await API.mesCommandes();
  } catch (e) {
    zone.innerHTML = '<p class="empty">' + esc(t('loadErr')) + '</p>';
    return;
  }
  const liste = cache.commandes || [];
  const pied = invite
    ? ''
    : '<button class="ghost" id="seDeconnecter">' + esc(t('signOut')) + '</button>';
  zone.innerHTML = (liste.length ? liste.map(function (o) {
    const pl = pastille(o.statut);
    const l0 = (o.lignes && o.lignes[0]) || { nom_produit: '' };
    const n = (o.lignes || []).reduce(function (s, l) { return s + l.quantite; }, 0);
    return '<button class="orow" data-order="' + esc(o.id) + '">' +
      '<span class="lthumb t-rad"><svg><use href="#g-rad"/></svg></span>' +
      '<span class="lmeta">' +
        '<span class="oref num">' + esc(o.reference) + ' · ' + esc(jour(o.cree_le)) + '</span>' +
        '<span class="cname">' + esc(l0.nom_produit) +
          (n > 1 ? ' <span class="cshop num">+' + (n - 1) + '</span>' : '') + '</span>' +
        '<span class="cprice num">' + htg(o.total) + '</span>' +
      '</span>' +
      '<span class="pill ' + pl.c + '">' + esc(t(pl.k)) + '</span>' +
    '</button>';
  }).join('') : '<p class="empty">' + esc(t('noOrders')) + '</p>' +
      '<button class="ghost" data-go="home">' + esc(t('browse')) + '</button>') + pied;
}

async function rendreCommande() {
  el('orderBack').textContent = t('back');
  const zone = el('order');
  let o = (cache.commandes || []).filter(function (x) { return x.id === commandeCourante; })[0];
  if (!o) {
    try { o = await API.commande(commandeCourante); } catch (e) {
      zone.innerHTML = '<p class="empty">' + esc(t('loadErr')) + '</p>';
      return;
    }
  }
  const pl = pastille(o.statut);
  const code = API.codeLocal(o.reference);
  const fini = o.statut === 'code_valide' || o.statut === 'fonds_liberes';

  zone.innerHTML =
    '<div class="prow"><h1 class="pname">' + esc(o.reference) + '</h1>' +
      '<span class="pill ' + pl.c + '">' + esc(t(pl.k)) + '</span></div>' +
    '<p class="note" style="padding:0">' + esc(t('orderOf')) + ' ' + esc(jour(o.cree_le)) + '</p>' +
    (fini ? '' :
      (code
        ? '<div class="code"><div class="eyebrow">' + esc(t('codeT')) + '</div>' +
          '<div class="codenum num">' + esc(code) + '</div></div>' +
          '<p class="note" style="padding:0">' + esc(t('codeNote')) + '</p>'
        : '') +
      // Téléphone perdu : le code n'est gardé que haché, personne ne peut
      // le relire. Avec un compte, on en redemande un et l'ancien meurt.
      '<div id="codeMsg"></div>' +
      '<button class="ghost" data-recode="' + esc(o.id) + '">' +
        esc(t('lostCode')) + '</button>'
    ) +
    (o.point ? '<div class="totals"><div class="trow"><span>' + esc(t('pickT')) + '</span>' +
      '<span style="text-align:right">' + esc(o.point.nom) + '<br>' +
      '<span class="cshop">' + esc(o.point.repere) + '</span></span></div></div>' : '') +
    // Dès l'embarquement, le colis est dans le réseau du transporteur :
    // c'est ce numéro qui le suit, et l'acheteur doit l'avoir sous la main.
    (o.numero_suivi
      ? '<div class="totals"><div class="trow"><span>' + esc(t('tracking')) + '</span>' +
        '<strong class="num">' + esc(o.numero_suivi) + '</strong></div>' +
        (CONFIG.flashipping && CONFIG.flashipping.suiviUrl
          ? '<div class="trow"><span></span><a href="' +
            esc(CONFIG.flashipping.suiviUrl.replace('{numero}', encodeURIComponent(o.numero_suivi))) +
            '" target="_blank" rel="noopener">' + esc(t('trackingLink')) + '</a></div>'
          : '') +
        '</div>'
      : '') +
    blocEtapes(o.statut) +
    (fini ? '' : '<div class="warnbox">' + esc(t('delay')) + '</div>') +
    '<div class="shoplist">' + (o.lignes || []).map(function (l) {
      return '<div class="line">' +
        '<span class="lthumb t-rad"><svg><use href="#g-rad"/></svg></span>' +
        '<span class="lmeta"><span class="cname">' + esc(l.nom_produit) +
          (l.libelle ? ' · ' + esc(l.libelle) : '') + '</span>' +
        '<span class="cshop num">×' + l.quantite + '</span>' +
        '<span class="cprice num">' + htg(l.prix_unitaire * l.quantite) + '</span>' +
        '</span></div>';
    }).join('') + '</div>' +
    '<div class="totals">' +
      '<div class="trow"><span>' + esc(t('sub')) + '</span><span class="num">' + htg(o.sous_total) + '</span></div>' +
      '<div class="trow"><span>' + esc(t('fee')) + '</span><span class="num">' + htg(o.frais_retrait) + '</span></div>' +
      '<div class="trow big"><span>' + esc(t('total')) + '</span><span class="num">' + htg(o.total) + '</span></div>' +
    '</div>';
}

/* ---------- Navigation ------------------------------------ */

const VUES = ['home', 'shops', 'shop', 'product', 'cart', 'done', 'orders', 'order',
  'compte', 'messages'];

function aller(v) {
  if (v === 'product' || v === 'shop' || v === 'order') vuePrec = vue;
  vue = v;
  VUES.forEach(function (id) { el('view-' + id).hidden = (id !== v); });
  Array.prototype.forEach.call(document.querySelectorAll('.nitem'), function (b) {
    if (b.getAttribute('data-go') === v) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (v === 'home') rendreAccueil();
  if (v === 'shops') rendreBoutiques();
  if (v === 'shop') rendreBoutique();
  if (v === 'product') rendreProduit();
  if (v === 'cart') rendrePanier();
  if (v === 'done') rendreConfirmation();
  if (v === 'orders') rendreCommandes();
  if (v === 'order') rendreCommande();
  if (v === 'compte') rendreCompte();
  if (v === 'messages') rendreMessages();
  majBandeau();
  majEtatCompte();
  window.scrollTo(0, 0);
}

function majEtatCompte() {
  const s = el('compteEtat');
  if (s) s.textContent = invite ? '' : t('connected');
  const b = el('clocheBtn');
  // Pas de cloche pour une session de passage : il n'y a rien à y voir.
  if (b) b.hidden = invite;
  if (invite) majPastille(0);
}

function majPastille(n) {
  const p = el('nonLus');
  if (!p) return;
  p.textContent = n > 9 ? '9+' : String(n);
  p.hidden = !n;
}

/* Combien de messages non lus, sans afficher la liste : c'est ce qui
   fait que l'acheteur pense à venir voir. Silencieux en cas d'échec —
   un compteur absent ne doit pas casser l'accueil. */
async function compterNonLus() {
  if (invite) { majPastille(0); return; }
  try {
    const liste = await API.mesMessages('acheteur');
    cache.messages = liste;
    majPastille(liste.filter(function (m) { return !m.lu_le; }).length);
  } catch (e) { majPastille(0); }
}

async function rendreMessages() {
  el('msgTitre').textContent = t('messages');
  el('msgNote').textContent = t('messagesNote');
  const zone = el('msgListe');
  zone.innerHTML = '<p class="empty">…</p>';

  let liste;
  try {
    liste = await API.mesMessages('acheteur');
  } catch (e) {
    zone.innerHTML = '<p class="empty">' + esc(t('loadErr')) + '</p>';
    return;
  }
  cache.messages = liste;

  zone.innerHTML = liste.length ? liste.map(function (m) {
    return '<div class="msg' + (m.lu_le ? '' : ' neuf') + '">' +
      '<div class="msgtop">' +
        '<span class="msgsujet">' + esc(m.sujet || '') + '</span>' +
        '<span class="msgquand">' + esc(quandCourt(m.cree_le)) + '</span>' +
      '</div>' +
      '<div class="msgcorps">' + esc(m.corps || '') + '</div>' +
      (m.commande
        ? '<button class="msgsuite" data-order="' + esc(m.commande) + '">' +
          esc(t('voirCommande')) + '</button>'
        : '') +
    '</div>';
  }).join('') : '<p class="empty">' + esc(t('noMessages')) + '</p>';

  // Vus, donc lus. La pastille tombe tout de suite, sans attendre le
  // serveur : si l'appel échoue, le prochain passage la remettra.
  if (liste.some(function (m) { return !m.lu_le; })) {
    majPastille(0);
    API.marquerMessagesLus('acheteur').catch(function () {});
  }
}

// « il y a 2 h », « hier », « le 12/10 » : plus parlant qu'une date
// complète pour un message qui vient d'arriver.
function quandCourt(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 2) return lang === 'ht' ? 'kounye a' : 'à l’instant';
  if (min < 60) return (lang === 'ht' ? 'gen ' : 'il y a ') + min + ' min';
  const h = Math.round(min / 60);
  if (h < 24) return (lang === 'ht' ? 'gen ' : 'il y a ') + h + ' h';
  if (h < 48) return lang === 'ht' ? 'yè' : 'hier';
  return d.toLocaleDateString(lang === 'ht' ? 'fr-HT' : 'fr-FR',
    { day: '2-digit', month: '2-digit' });
}

function majCompteur() {
  const n = panier.reduce(function (s, l) { return s + l.quantite; }, 0);
  const c = el('cc');
  c.textContent = n;
  c.hidden = n === 0;
}

function appliquerLangue() {
  document.documentElement.lang = lang === 'ht' ? 'ht' : 'fr';
  el('lgFr').setAttribute('aria-pressed', lang === 'fr');
  el('lgHt').setAttribute('aria-pressed', lang === 'ht');
  el('q').placeholder = t('search');
  el('q').setAttribute('aria-label', t('search'));
  const map = { home: 'navHome', shops: 'navShops', orders: 'navOrders', cart: 'navCart' };
  Object.keys(map).forEach(function (k) {
    const s = document.querySelector('[data-nav="' + k + '"]');
    if (s) s.textContent = t(map[k]);
  });
  aller(vue);
}

/* ---------- Commande ------------------------------------- */

async function envoyerCommande() {
  if (envoiEnCours) return;
  const btn = el('orderBtn'), err = el('cartErr');
  // Le nom et le téléphone viennent du compte : on ne les redemande pas.
  const prof = await API.profil().catch(function () { return null; });
  if (!prof || !prof.nom || prof.nom === 'Nouveau client' || !API.telValide(prof.telephone)) {
    err.innerHTML = '<div class="erreur">' + esc(t('needName')) + '</div>';
    aller('compte');
    return;
  }
  if (!pointChoisi) {
    err.innerHTML = '<div class="erreur">' + esc(t('pickT')) + '</div>';
    return;
  }

  envoiEnCours = true;
  err.innerHTML = '';
  btn.disabled = true;
  btn.textContent = t('ordering');

  try {
    const res = await API.creerCommande(
      panier.map(function (l) { return { variante: l.variante, quantite: l.quantite }; }),
      pointChoisi
    );
    derniereCommande = res;
    panier = [];
    sauverPanier();
    majCompteur();
    cache.commandes = [];
    await chargerCatalogue();   // le stock a bougé
    aller('done');
  } catch (e) {
    err.innerHTML = '<div class="erreur">' + esc(e.message || t('loadErr')) + '</div>';
    btn.textContent = t('order');
  } finally {
    envoiEnCours = false;
    btn.disabled = false;
  }
}

/* ---------- Événements ----------------------------------- */

document.addEventListener('click', function (ev) {
  // Un clic atterrit souvent sur l'icône ou le texte À L'INTÉRIEUR du
  // bouton, pas sur le bouton : on remonte au bouton avant de comparer
  // les identifiants, sinon les boutons à icône ne répondent jamais.
  const bouton = ev.target.closest ? ev.target.closest('button') : null;
  const cible = (bouton && bouton.id) ? bouton : ev.target;

  if (cible.id === 'lgFr' || cible.id === 'lgHt') {
    lang = cible.id === 'lgFr' ? 'fr' : 'ht';
    try { localStorage.setItem('bl:lang', lang); } catch (e) {}
    appliquerLangue();
    return;
  }
  if (cible.id === 'markBtn') { aller('home'); return; }
  if (cible.id === 'shopBack' || cible.id === 'prodBack') { aller(vuePrec); return; }
  if (cible.id === 'orderBack') { aller('orders'); return; }
  if (cible.id === 'orderBtn') { envoyerCommande(); return; }

  if (cible.id === 'versConnexion') { modeConnexion = true; rendreCompte(); return; }
  if (cible.id === 'versInscription') { modeConnexion = false; rendreCompte(); return; }

  if (cible.id === 'compteBtn') { aller('compte'); return; }
  if (cible.id === 'clocheBtn') { aller('messages'); return; }

  if (cible.id === 'creerCompte') {
    const nom = val2('cNom'), tel = val2('cTel'), pin = val2('cPin');
    const dep = val2('cDep'), com = val2('cCom'), mail = val2('cMail');
    const z = el('compteErr');
    if (!nom || !API.telValide(tel)) {
      z.innerHTML = '<div class="erreur">' + esc(API.telValide(tel) ? t('needName') : t('needTel')) + '</div>';
      return;
    }
    if (pin.length !== 6) { z.innerHTML = '<div class="erreur">' + esc(t('needPin')) + '</div>'; return; }
    if (!dep || !com) { z.innerHTML = '<div class="erreur">' + esc(t('needPlace')) + '</div>'; return; }
    cible.disabled = true;
    API.creerCompte({ tel: tel, pin: pin, nom: nom, email: mail, langue: lang })
      .then(function () { return API.majProfil({ departement: dep, commune: com }); })
      .then(function () {
        invite = false;
        ecrireEssais(API.normaliserTel(tel), null);
        aller(panier.length ? 'cart' : 'home');
      })
      .catch(function (e) { z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>'; })
      .then(function () { cible.disabled = false; });
    return;
  }

  if (cible.id === 'majProfil') {
    const z = el('compteErr');
    cible.disabled = true;
    API.majProfil({
      nom: val2('cNom'), telephone: API.normaliserTel(val2('cTel')),
      departement: val2('cDep') || null, commune: val2('cCom') || null,
      email_contact: val2('cMail') || null, langue: lang
    }).then(function () {
      z.innerHTML = '<div class="warnbox">' + esc(t('saved')) + '</div>';
    }).catch(function (e) {
      z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    }).then(function () { cible.disabled = false; });
    return;
  }

  if (cible.id === 'seConnecter') {
    const tel = API.normaliserTel((el('lTel').value || '').trim());
    const pin = (el('lPin').value || '').trim();
    const z = el('compteErr');

    const reste = blocageRestant(tel);
    if (reste) {
      z.innerHTML = '<div class="erreur">' + esc(t('tooMany') + dureeLisible(reste)) +
        '</div><p class="note">' + esc(t('askAgent')) + '</p>';
      return;
    }

    cible.disabled = true;
    API.connecter(tel, pin).then(function () {
      ecrireEssais(tel, null);       // compteur remis à zéro
      modeConnexion = false;
      invite = false;
      cache.commandes = [];
      cache.messages = [];
      aller(panier.length ? 'cart' : 'compte');
      compterNonLus();
    }).catch(function (e) {
      const apres = noterEchec(tel);
      const bloque = blocageRestant(tel);
      const avant = essaisAvantBlocage(tel);
      z.innerHTML = '<div class="erreur">' + esc(e.message) +
        (bloque ? ' ' + esc(t('tooMany') + dureeLisible(bloque))
                : (avant ? ' \u00b7 ' + avant + esc(t('attemptsLeft')) : '')) + '</div>' +
        (apres.n >= 3 ? '<p class="note">' + esc(t('askAgent')) + '</p>' : '');
    }).then(function () { cible.disabled = false; });
    return;
  }

  if (cible.id === 'seDeconnecter') {
    API.deconnecter().then(function () { location.reload(); });
    return;
  }

  if (cible.id === 'addBtn') {
    const p = prodCourant;
    if (!p) return;
    const dispo = (p.variantes || []).filter(function (v) { return v.stock > 0; });
    const v = varianteSelonAxes(p) ||
      dispo.filter(function (x) { return x.id === varianteChoisie; })[0] || dispo[0];
    if (!v) return;

    const existante = panier.filter(function (l) { return l.variante === v.id; })[0];
    if (existante) {
      if (existante.quantite < v.stock) existante.quantite++;
    } else {
      panier.push({
        variante: v.id, quantite: 1, libelle: v.libelle,
        prix: prixDe(p, v), nom: p.nom, categorie: p.categorie,
        boutique: p.boutique ? p.boutique.nom : '', boutiqueId: p.boutique ? p.boutique.id : '',
        boutiqueCommune: p.boutique ? p.boutique.commune : '',
        photo: photo(p), stock: v.stock
      });
    }
    sauverPanier();
    majCompteur();
    aller('cart');
    return;
  }

  const n = cible.closest ? cible.closest('[data-prod],[data-shop],[data-cat],[data-go],[data-pick],[data-var],[data-inc],[data-dec],[data-order],[data-recode]') : null;
  if (!n) return;

  if (n.hasAttribute('data-recode')) {
    const id = n.getAttribute('data-recode');
    const z = el('codeMsg');
    n.disabled = true;
    API.regenererCode(id).then(function (r) {
      // On le range localement comme à la commande, pour qu'il survive
      // à un rechargement de la page.
      try {
        const codes = JSON.parse(localStorage.getItem('bl:codes') || '{}');
        const o = (cache.commandes || []).filter(function (x) { return x.id === id; })[0];
        if (o) { codes[o.reference] = r.code; localStorage.setItem('bl:codes', JSON.stringify(codes)); }
      } catch (e) {}
      if (z) z.innerHTML = '<div class="warnbox">' + esc(t('newCodeDone')) + '</div>';
      rendreCommande();
    }).catch(function (e) {
      if (z) z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    }).then(function () { n.disabled = false; });
    return;
  }
  if (n.hasAttribute('data-order')) { commandeCourante = n.getAttribute('data-order'); aller('order'); return; }
  if (n.hasAttribute('data-prod')) {
    const id = n.getAttribute('data-prod');
    prodCourant = cache.produits.filter(function (p) { return p.id === id; })[0] || null;
    if (!prodCourant) {
      API.produit(id).then(function (p) { prodCourant = p; aller('product'); }).catch(function () {});
      return;
    }
    aller('product');
    return;
  }
  if (n.hasAttribute('data-shop')) { boutiqueCourante = n.getAttribute('data-shop'); aller('shop'); return; }
  if (n.hasAttribute('data-go')) { aller(n.getAttribute('data-go')); return; }
  if (n.hasAttribute('data-cat')) {
    cat = n.getAttribute('data-cat');
    rendreRail();
    chargerCatalogue().then(function () { rendreAccueil(); majBandeau(); });
    return;
  }
  if (n.hasAttribute('data-pick')) { pointChoisi = n.getAttribute('data-pick'); rendrePanier(); return; }
  if (n.hasAttribute('data-axe')) {
    const axe = n.getAttribute('data-axe');
    choixAxes[axe] = n.getAttribute('data-val');
    Array.prototype.forEach.call(document.querySelectorAll('[data-axe="' + axe + '"]'),
      function (b) { b.setAttribute('aria-pressed', b === n); });
    const v = varianteSelonAxes(prodCourant);
    const btn = el('addBtn');
    if (btn) {
      btn.disabled = !v;
      btn.textContent = v ? t('add') : t('pickAll');
    }
    majPrixAffiche();
    return;
  }
  if (n.hasAttribute('data-var')) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-var]'), function (b) {
      b.setAttribute('aria-pressed', b === n);
    });
    varianteChoisie = n.getAttribute('data-var');
    majPrixAffiche();   // le prix suit la variante choisie
    return;
  }
  if (n.hasAttribute('data-inc')) {
    const l = panier[+n.getAttribute('data-inc')];
    if (l && l.quantite < l.stock) { l.quantite++; sauverPanier(); majCompteur(); rendrePanier(); }
    return;
  }
  if (n.hasAttribute('data-dec')) {
    const i = +n.getAttribute('data-dec');
    panier[i].quantite--;
    if (panier[i].quantite <= 0) panier.splice(i, 1);
    sauverPanier();
    majCompteur();
    rendrePanier();
    return;
  }
});

document.addEventListener('change', function (ev) {
  const c = ev.target;
  if (c.id === 'rDep') { depRetrait = c.value; comRetrait = null; pointChoisi = null; rendrePanier(); return; }
  if (c.id === 'rCom') { comRetrait = c.value; pointChoisi = null; rendrePanier(); return; }
});

el('q').addEventListener('input', function (ev) {
  recherche = ev.target.value;
  rendreAccueil();
});

window.addEventListener('online', function () {
  horsLigne = false;
  chargerCatalogue().then(function () { if (vue === 'home') rendreAccueil(); majBandeau(); });
});
window.addEventListener('offline', function () { horsLigne = true; majBandeau(); });

/* ---------- Démarrage ------------------------------------ */

/* La librairie Supabase vient d'un CDN. Sur un réseau qui coupe au
   mauvais moment, elle peut ne jamais arriver — et sans elle l'app
   ne sert à rien. On essaie les miroirs avant d'abandonner. */

const MIROIRS = [
  'https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'
];

function chargerScript(src) {
  return new Promise(function (ok, ko) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = function () { ko(new Error('miroir injoignable')); };
    document.head.appendChild(s);
  });
}

async function assurerLib() {
  if (API.pret()) return true;
  for (let i = 0; i < MIROIRS.length; i++) {
    try {
      await chargerScript(MIROIRS[i]);
      if (API.pret()) return true;
    } catch (e) { /* on tente le suivant */ }
  }
  return false;
}

(async function demarrer() {
  majCompteur();
  appliquerLangue();

  const libOk = await assurerLib();
  if (!libOk) horsLigne = true;

  try {
    await API.session();
    invite = await API.estInvite();
    majEtatCompte();
  } catch (e) { /* hors ligne : on affiche le cache */ }
  await chargerReferentiels();
  await chargerCatalogue();
  appliquerLangue();
  compterNonLus();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
