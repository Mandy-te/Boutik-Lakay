/* ============================================================
   Konbit Market — interface

   Aucune requête Supabase ici : tout passe par API (api.js).
   Aucun texte en dur dans les vues : tout passe par t() (T ci-dessous),
   parce que l'app doit tenir en français et en créole.
   ============================================================ */

/* ---------- Libellés -------------------------------------- */

const T = {
  fr: {
    search:'Chercher un article', boost:'Mises en avant', all:'Tous les articles',
    shops:'Boutiques', shopsNote:'Chaque vendeur est vérifié avant publication.',
    searchShop:'Nom de boutique ou ville\u2026',
    allCities:'Toutes', noShopMatch:'Aucune boutique ne correspond.',
    sellHere:'Vendre sur Konbit Market',
    footSell:'Vendre ici',
    footTerms:'Conditions d\u2019utilisation',
    footPrivacy:'Politique de confidentialit\u00e9',
    footNote:'Ha\u00efti \u00b7 Paiement en esp\u00e8ces au comptoir, apr\u00e8s v\u00e9rification de votre colis.',
    acceptPre:'J\u2019accepte les', acceptAnd:'et la',
    termsShort:'conditions d\u2019utilisation', privacyShort:'politique de confidentialit\u00e9',
    acceptNeeded:'Vous devez accepter les conditions pour cr\u00e9er un compte.',
    cart:'Panier', orders:'Mes commandes',
    ordersNote:'Suivez chaque commande jusqu’au retrait.',
    parcel:'Colis', parcelsN:'{n} colis — un par ville de départ',
    shopsGrouped:'{n} vendeurs groupés',
    parcelOf:'Colis {n} sur {sur}',
    roleAutre:'Vous êtes connecté avec un compte {role}, et vous naviguez ici comme client.',
    versEspace:'Aller à mon espace de travail',
    removed:'Retiré — non facturé',
    parcelCancelled:'Colis annulé',
    codeParParcel:'Un code par colis : présentez celui du colis que vous venez chercher.',
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
    yourEmail:'Adresse e-mail',
    loginId:'Num\u00e9ro ou adresse e-mail',
    account:'Votre compte', pin:'Mot de passe',
    pinHint:'Au moins 8 caract\u00e8res, avec des lettres.',
    emailHint:'C\u2019est par l\u00e0 qu\u2019on vous renverra votre mot de passe si vous l\u2019oubliez.',
    forgot:'Mot de passe oubli\u00e9 ?',
    firstName:'Pr\u00e9nom', lastName:'Nom',
    pin2:'R\u00e9p\u00e9tez le mot de passe',
    showPwd:'Voir', hidePwd:'Cacher',
    pwdMismatch:'Les deux mots de passe ne sont pas identiques.',
    needBothNames:'Indiquez votre pr\u00e9nom et votre nom.',
    confirmedOk:'Votre compte est confirm\u00e9.',
    confirmedIn:'Vous \u00eates connect\u00e9. Bonne visite.',
    confirmedOut:'Connectez-vous pour commander.',
    checkInbox:'V\u00e9rifiez votre bo\u00eete mail',
    checkInboxWhy:'Nous venons d\u2019envoyer un lien \u00e0 cette adresse. Ouvrez-le pour activer votre compte \u2014 sans \u00e7a, vous ne pourrez pas commander.',
    checkInboxSpam:'Rien au bout de deux minutes ? Regardez dans vos ind\u00e9sirables. Et v\u00e9rifiez que l\u2019adresse est la bonne.',
    resendBtn:'Renvoyer le lien',
    resendDone:'C\u2019est reparti. Si un compte attend sur cette adresse, le lien vient d\u2019y \u00eatre renvoy\u00e9.',
    doneConfirm:'J\u2019ai confirm\u00e9, me connecter',
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
    needPin:'Le mot de passe doit avoir au moins 8 caract\u00e8res.',
    needEmail:'Indiquez une adresse e-mail valide.',
    needTel:'Numéro invalide. Exemple : 3132 4336.',
    connected:'Connecté', guest:'Compte de passage',
    lostCode:'Code perdu ? En demander un nouveau',
    tooMany:'Trop d\u2019essais. Réessayez dans ',
    minutes:'min', seconds:'s',
    attemptsLeft:' essai(s) avant blocage',
    askAgent:'Mot de passe oublié ? Demandez un lien par e-mail depuis la page de connexion. Si vous n\u2019avez plus accès à votre boîte, passez à une succursale Flashipping avec votre pièce d\u2019identité : un agent peut vous rouvrir l\u2019accès.',
    newCodeDone:'Nouveau code. L\u2019ancien ne vaut plus rien.',
    emailWhy:'Pour être prévenu dès que votre colis est disponible au comptoir.',
    videoData:'La vidéo ne se télécharge que si vous appuyez sur lecture.'
  },
  ht: {
    search:'Chèche yon atik', boost:'Mete devan', all:'Tout atik yo',
    shops:'Boutik', shopsNote:'Chak machann verifye anvan nou pibliye.',
    searchShop:'Non boutik oswa vil\u2026',
    allCities:'Tout', noShopMatch:'Nou pa jwenn okenn boutik.',
    sellHere:'Vann sou Konbit Market',
    footSell:'Vann isit',
    footTerms:'Kondisyon itilizasyon',
    footPrivacy:'Politik konfidansyalite',
    footNote:'Ayiti \u00b7 Ou peye an kach nan kontwa a, apre w fin tcheke kolis ou.',
    acceptPre:'Mwen aksepte', acceptAnd:'ak',
    termsShort:'kondisyon itilizasyon yo', privacyShort:'politik konfidansyalite a',
    acceptNeeded:'Ou dwe aksepte kondisyon yo pou w kreye yon kont.',
    cart:'Panyen', orders:'Kòmand mwen',
    ordersNote:'Swiv chak kòmand jiska retrè a.',
    parcel:'Pake', parcelsN:'{n} pake — yon sèl pou chak vil',
    shopsGrouped:'{n} machann ansanm',
    parcelOf:'Pake {n} sou {sur}',
    roleAutre:'Ou konekte ak yon kont {role}, epi w ap navige la tankou kliyan.',
    versEspace:'Ale nan espas travay mwen',
    removed:'Retire — nou pa fakti l',
    parcelCancelled:'Pake anile',
    codeParParcel:'Yon kòd pou chak pake : montre kòd pake w ap chèche a.',
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
    yourEmail:'Adr\u00e8s im\u00e8l',
    loginId:'Nim\u00e8wo oswa adr\u00e8s im\u00e8l',
    account:'Kont ou', pin:'Mo de pas',
    pinHint:'Omwen 8 karakt\u00e8, ak l\u00e8t ladan l.',
    emailHint:'Se la n ap voye mo de pas ou si w bliye l.',
    forgot:'Ou bliye mo de pas ou ?',
    firstName:'Non', lastName:'Siyati',
    pin2:'Repete mo de pas la',
    showPwd:'Montre', hidePwd:'Kache',
    pwdMismatch:'De mo de pas yo pa menm.',
    needBothNames:'Mete non ak siyati ou.',
    confirmedOk:'Kont ou konfime.',
    confirmedIn:'Ou konekte. Bon vizit.',
    confirmedOut:'Konekte pou w ka komande.',
    checkInbox:'Al gade bwat im\u00e8l ou',
    checkInboxWhy:'Nou fenk voye yon lyen nan adr\u00e8s sa a. Louvri l pou aktive kont ou \u2014 san sa, ou p ap ka komande.',
    checkInboxSpam:'Anyen apre de minit ? Gade nan sa yo rele endezirab yo. Epi tcheke si adr\u00e8s la bon.',
    resendBtn:'Voye lyen an ank\u00f2',
    resendDone:'Li pati. Si yon kont ap tann sou adr\u00e8s sa a, lyen an fenk voye.',
    doneConfirm:'Mwen konfime, kite m konekte',
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
    needPin:'Mo de pas la dwe gen omwen 8 karakt\u00e8.',
    needEmail:'Mete yon adr\u00e8s im\u00e8l ki bon.',
    needTel:'Nimewo pa bon. Egzanp : 3132 4336.',
    connected:'Konekte', guest:'Kont pasaj',
    lostCode:'Ou pèdi kòd la ? Mande yon lòt',
    tooMany:'Twòp esè. Tanpri tann ',
    minutes:'min', seconds:'s',
    attemptsLeft:' esè anvan nou bloke w',
    askAgent:'Ou bliye mo de pas ou ? Mande yon lyen pa imèl sou paj koneksyon an. Si w pa gen aksè ak bwat imèl ou ankò, pase nan yon sikisal Flashipping ak pyès idantite w : yon ajan ka relouvri aksè a.',
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
let roleCourant = null;   // 'acheteur', 'vendeur', 'agent' ou 'admin'
let attenteConfirmation = null;   // adresse en attente de confirmation
let venantDeConfirmer = false;    // on arrive d'un lien de confirmation

/* Retour d'un lien envoyé par courriel.

   Supabase renvoie avec les jetons dans le #, et un « type » qui dit
   pourquoi : signup pour une adresse confirmée, recovery pour un mot de
   passe. Il faut le lire AVANT que supabase-js consomme le # à sa
   première initialisation, sinon il n'y a plus rien à lire.

   Pourquoi lire ça sur l'accueil alors qu'une page dédiée existe : quand
   l'adresse de retour demandée n'est pas dans la liste blanche de
   Supabase, il abandonne le chemin et renvoie à la racine du Site URL.
   La personne atterrit alors sur l'accueil sans aucune explication, en
   croyant que rien n'a marché. Mieux vaut savoir l'accueillir que
   dépendre d'un réglage qu'un domaine oublié suffit à mettre en défaut. */
function typeRetourCourriel() {
  const h = String(location.hash || '');
  if (h.indexOf('type=recovery') !== -1) return 'recovery';
  if (h.indexOf('type=signup') !== -1) return 'signup';
  if (h.indexOf('type=email_change') !== -1) return 'signup';
  return null;
}
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
  } else if (roleCourant && roleCourant !== 'acheteur') {
    /* Un compte d'équipe ou de vendeur qui fait ses courses ici : on
       le dit. L'ambiguïté est le vrai danger — quelqu'un qui croit
       être dans son espace de travail et qui commande, ou l'inverse.
       Le dire coûte une ligne et lève le doute. */
    txt.innerHTML = esc(t('roleAutre').replace('{role}', roleCourant)) +
      ' <a href="gestion.html">' + esc(t('versEspace')) + '</a>';
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

/* Recherche de boutiques.

   Elle n'apparaît qu'à partir d'un certain nombre : avec trois boutiques,
   un champ de recherche au-dessus de trois lignes est une insulte polie.
   Au-delà, faire défiler devient une corvée. Le seuil est ici, change-le
   si tu veux le voir plus tôt. */
const SEUIL_RECHERCHE = 7;
let filtreB = { q: '', commune: 'toutes' };

// Même règle de comparaison que pour les lieux : accents, casse et espaces
// ignorés, pour qu'on trouve « Mandy Store » en tapant « mandy st ».
function contientTexte(champ, q) {
  const k = cleLieu(q);
  return k === '' || cleLieu(champ).indexOf(k) !== -1;
}

function boutiquesFiltrees() {
  return cache.boutiques.filter(function (s) {
    if (filtreB.commune !== 'toutes' && !memeLieu(s.commune, filtreB.commune)) {
      return false;
    }
    return contientTexte(s.nom, filtreB.q) || contientTexte(s.commune, filtreB.q);
  });
}

function listeBoutiquesHtml() {
  const b = boutiquesFiltrees();
  if (!b.length) {
    return '<p class="empty">' +
      esc(cache.boutiques.length ? t('noShopMatch') : t('emptyShops')) + '</p>';
  }
  return b.map(function (s) {
    return '<button class="shop" data-shop="' + esc(s.id) + '">' +
      '<span class="avatar t-rad">' + esc((s.nom || '?').charAt(0)) + '</span>' +
      '<span class="shopmeta">' +
        '<span class="shopname">' + esc(s.nom) +
          ' <span class="badge ok">' + esc(t('verified')) + '</span></span>' +
        '<span class="shopsub">' + esc(s.commune) + '</span>' +
      '</span></button>';
  }).join('');
}

/* Les villes proposées sont celles qui ont vraiment une boutique, comptées
   depuis les données. Pas de liste figée des dix départements : on ne
   propose jamais un filtre qui ne rendrait rien. */
function villesDesBoutiques() {
  const vues = {};
  cache.boutiques.forEach(function (s) {
    const k = cleLieu(s.commune);
    if (!k) return;
    if (!vues[k]) vues[k] = { nom: s.commune, n: 0 };
    vues[k].n++;
  });
  return Object.keys(vues).map(function (k) { return vues[k]; })
    .sort(function (a, b) { return b.n - a.n || a.nom.localeCompare(b.nom); });
}

function barreBoutiques() {
  if (cache.boutiques.length < SEUIL_RECHERCHE) return '';
  const villes = villesDesBoutiques();
  const chips = villes.length > 1
    ? '<div class="chips">' +
        [{ nom: t('allCities'), code: 'toutes', n: cache.boutiques.length }]
          .concat(villes.map(function (v) {
            return { nom: v.nom, code: v.nom, n: v.n };
          }))
          .map(function (g) {
            return '<button class="chip" data-ville="' + esc(g.code) + '" ' +
              'aria-pressed="' + (memeLieu(filtreB.commune, g.code) ||
                 filtreB.commune === g.code) + '">' +
              esc(g.nom) + '<span class="chipnum">' + g.n + '</span></button>';
          }).join('') +
      '</div>'
    : '';
  return '<div class="filtres">' +
    '<input class="recherche" id="qBoutiques" type="search" ' +
      'placeholder="' + esc(t('searchShop')) + '" value="' + esc(filtreB.q) + '">' +
    chips +
  '</div>';
}

// Ne réécrit QUE la liste : le champ de recherche garde son contenu, son
// curseur et le clavier ouvert. Tout re-rendre le fermerait à chaque lettre.
function rafraichirBoutiques() {
  const z = el('shopList');
  if (z) z.innerHTML = listeBoutiquesHtml();
}

async function rendreBoutiques() {
  el('shopsTitle').textContent = t('shops');
  el('shopsNote').textContent = t('shopsNote');
  if (!cache.boutiques.length) {
    try { const r = await API.boutiques(); cache.boutiques = r.data || []; } catch (e) {}
  }
  const lienVendre = '<a class="ghost" href="devenir-vendeur.html" ' +
    'style="display:block;text-align:center;text-decoration:none;margin-top:6px">' +
    esc(t('sellHere')) + '</a>';
  el('shopBarre').innerHTML = barreBoutiques();
  el('shopList').innerHTML = listeBoutiquesHtml();
  el('shopVendre').innerHTML = lienVendre;
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
  // Un colis par ville d'origine, donc un frais par ville — même si
  // trois vendeurs du Cap sont dans le même panier.
  const origines = [];
  panier.forEach(function (l) {
    sous += l.prix * l.quantite;
    // On compte les boutiques par leur identifiant, pas par leur nom :
    // deux boutiques peuvent porter le même nom.
    if (!origines.some(function (o) { return o.boutique === l.boutiqueId; })) {
      origines.push({ boutique: l.boutiqueId, commune: l.boutiqueCommune });
    }
  });
  const pt = (cache.points || []).filter(function (p) { return p.id === pointChoisi; })[0];
  const colis = API.colisDuPanier(pt, origines, cache.tarifs);
  const frais = colis.reduce(function (s, c) { return s + c.frais; }, 0);
  return { sous: sous, frais: frais, total: sous + frais, colis: colis };
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

  /* Le détail des colis n'apparaît que s'il y en a plusieurs. Avec un
     seul, la ligne « Retrait » suffit ; avec trois, l'acheteur doit
     voir d'où vient chaque frais, sinon il croit qu'on le surfacture. */
  const detailColis = (tt.colis.length > 1)
    ? '<div class="colisbloc">' +
      '<div class="colistitre">' + esc(t('parcelsN').replace('{n}', tt.colis.length)) + '</div>' +
      tt.colis.map(function (c, i) {
        return '<div class="trow"><span>' +
          esc(t('parcel') + ' ' + (i + 1) + ' · ' + c.commune) +
          (c.boutiques.length > 1
            ? '<em class="colisnote">' +
              esc(t('shopsGrouped').replace('{n}', c.boutiques.length)) + '</em>'
            : '') +
          '</span><span class="num">' + htg(c.frais) + '</span></div>';
      }).join('') +
      '</div>'
    : '';

  h += '<div style="height:14px"></div><div class="totals">' +
    '<div class="trow"><span>' + esc(t('sub')) + '</span><span class="num">' + htg(tt.sous) + '</span></div>' +
    detailColis +
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
  /* Un code par colis. Avec un seul, rien ne change à l'écran ; avec
     plusieurs, chacun porte sa ville, sinon l'acheteur se présente au
     comptoir avec le mauvais code. */
  const lesCodes = (c.codes && c.codes.length) ? c.codes
    : [{ rang: 1, commune: '', code: c.code }];

  el('done').innerHTML =
    '<div class="sechead"><h2>' + esc(t('doneT')) + '</h2></div>' +
    (lesCodes.length > 1
      ? '<p class="note" style="padding:0">' +
        esc(t('parcelsN').replace('{n}', lesCodes.length)) + '</p>' : '') +
    lesCodes.map(function (k) {
      return '<div class="code"><div class="eyebrow">' + esc(t('codeT')) +
        (lesCodes.length > 1
          ? ' · ' + esc(t('parcel') + ' ' + k.rang + ' · ' + k.commune) : '') +
        '</div><div class="codenum num">' + esc(k.code) + '</div></div>';
    }).join('') +
    '<p class="note" style="padding:0">' + esc(t('codeNote')) + '</p>' +
    (lesCodes.length > 1
      ? '<p class="note" style="padding:0">' + esc(t('codeParParcel')) + '</p>' : '') +
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

/* Un champ de mot de passe avec son bouton « Voir ».

   Sur un téléphone, taper huit caractères à l'aveugle avec un doigt qui
   dérape est la première cause d'abandon d'une inscription — et la
   deuxième, c'est de croire qu'on s'est trompé alors que non. Pouvoir
   relire ce qu'on tape vaut mieux, ici, que la protection contre un
   voisin qui regarde par-dessus l'épaule : le champ reste masqué par
   défaut, et c'est la personne qui décide.

   Un seul gestionnaire sert tous les champs, repéré par data-voir. */
function champMdp(id, etiquette, aide, autoc) {
  return '<div class="champ"><label for="' + id + '">' + esc(etiquette) + '</label>' +
    '<div class="mdpbloc">' +
      '<input id="' + id + '" type="password" autocomplete="' + autoc + '">' +
      '<button type="button" class="voirmdp" data-voir="' + id + '" ' +
        'aria-label="' + esc(t('showPwd')) + '">' + esc(t('showPwd')) + '</button>' +
    '</div>' +
    (aide ? '<span class="aide">' + esc(aide) + '</span>' : '') +
  '</div>';
}

async function rendreCompte() {
  invite = await API.estInvite().catch(function () { return true; });
  const prof = invite ? null : await API.profil().catch(function () { return null; });
  el('compteTitre').textContent = t('myAccount');
  const z = el('compteCorps');

  /* Le compte existe, le profil aussi, mais l'adresse n'est pas encore
     prouvée. On ne renvoie donc pas la personne au formulaire : elle
     croirait que son inscription a échoué et recommencerait, pour se
     heurter à « cette adresse a déjà un compte ». */
  if (venantDeConfirmer) {
    const dedans = !invite;
    z.innerHTML =
      '<div class="bloc">' +
        '<h3 style="margin:0 0 6px">' + esc(t('confirmedOk')) + '</h3>' +
        '<p class="note" style="padding:0">' +
          esc(t(dedans ? 'confirmedIn' : 'confirmedOut')) + '</p>' +
      '</div>' +
      (dedans
        ? '<button class="cta" id="versAccueil">' + esc(t('shops')) + '</button>'
        : '<button class="cta" id="versConnexion">' + esc(t('signIn')) + '</button>');
    return;
  }

  if (attenteConfirmation) {
    z.innerHTML =
      '<div class="bloc">' +
        '<h3 style="margin:0 0 8px">' + esc(t('checkInbox')) + '</h3>' +
        '<p class="note" style="padding:0"><b>' + esc(attenteConfirmation) + '</b></p>' +
        '<p class="note" style="padding:0">' + esc(t('checkInboxWhy')) + '</p>' +
        '<p class="note" style="padding:0">' + esc(t('checkInboxSpam')) + '</p>' +
      '</div>' +
      '<div id="compteErr"></div>' +
      '<button class="cta" id="renvoyerLien">' + esc(t('resendBtn')) + '</button>' +
      '<button class="ghost" id="versConnexion">' + esc(t('doneConfirm')) + '</button>';
    return;
  }

  if (invite && modeConnexion) {
    z.innerHTML =
      '<div class="shoplist">' +
        '<div class="champ"><label for="lTel">' + esc(t('loginId')) + '</label>' +
          '<input id="lTel" type="text" autocomplete="username"></div>' +
        champMdp('lPin', t('pin'), '', 'current-password') +
      '</div>' +
      '<div id="compteErr"></div>' +
      '<button class="cta" id="seConnecter">' + esc(t('signIn')) + '</button>' +
      '<p class="note" style="text-align:center">' +
        '<a href="mot-de-passe-oublie.html">' + esc(t('forgot')) + '</a></p>' +
      '<button class="ghost" id="versInscription">' + esc(t('newAccount')) + '</button>';
    return;
  }

  if (invite) {
    z.innerHTML =
      '<p class="note" style="padding-top:0">' + esc(t('whyAccount')) + '</p>' +
      '<div class="shoplist">' +
        '<div class="champ"><label for="cPrenom">' + esc(t('firstName')) + '</label>' +
          '<input id="cPrenom" autocomplete="given-name"></div>' +
        '<div class="champ"><label for="cNom">' + esc(t('lastName')) + '</label>' +
          '<input id="cNom" autocomplete="family-name"></div>' +
        '<div class="champ"><label for="cTel">' + esc(t('yourPhone')) + '</label>' +
          '<input id="cTel" type="tel" inputmode="tel" autocomplete="username"></div>' +
        '<div class="champ"><label for="cMail">' + esc(t('yourEmail')) + '</label>' +
          '<input id="cMail" type="email" inputmode="email" autocomplete="email">' +
          '<span class="aide">' + esc(t('emailHint')) + '</span></div>' +
        champMdp('cPin', t('pin'), t('pinHint'), 'new-password') +
        champMdp('cPin2', t('pin2'), '', 'new-password') +
        champsLieu(null, null, 'c') +
      '</div>' +
      '<label class="accord"><input type="checkbox" id="cAccord"><span>' +
        esc(t('acceptPre')) +
        ' <a href="conditions.html" target="_blank" rel="noopener">' +
          esc(t('termsShort')) + '</a> ' + esc(t('acceptAnd')) +
        ' <a href="confidentialite.html" target="_blank" rel="noopener">' +
          esc(t('privacyShort')) + '</a>.</span></label>' +
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
  const codes = API.codeLocal(o.reference) || {};

  /* Chaque colis vit sa vie : il a son numéro de suivi, son
     avancement et son code. Celui du Cap peut être au comptoir
     pendant que celui de Hinche roule encore, donc on ne peut plus
     afficher un seul état pour toute la commande. */
  const colis = (o.colis || []).slice().sort(function (a, b) { return a.rang - b.rang; });
  const vivants = colis.filter(function (k) { return !k.annule_le; });

  zone.innerHTML =
    '<div class="prow"><h1 class="pname">' + esc(o.reference) + '</h1>' +
      '<span class="pill ' + pl.c + '">' + esc(t(pl.k)) + '</span></div>' +
    '<p class="note" style="padding:0">' + esc(t('orderOf')) + ' ' + esc(jour(o.cree_le)) + '</p>' +
    (o.point ? '<div class="totals"><div class="trow"><span>' + esc(t('pickT')) + '</span>' +
      '<span style="text-align:right">' + esc(o.point.nom) + '<br>' +
      '<span class="cshop">' + esc(o.point.repere) + '</span></span></div></div>' : '') +

    colis.map(function (k) {
      const kpl = pastille(k.statut);
      const annule = !!k.annule_le;
      const fini = k.statut === 'code_valide' || k.statut === 'fonds_liberes'
        || k.statut === 'cloturee';
      const code = codes[k.id] || (colis.length === 1 ? codes.ancien : null);
      const lignes = (o.lignes || []).filter(function (l) { return l.colis === k.id; });

      return '<div class="colisfiche' + (annule ? ' mort' : '') + '">' +
        '<div class="prow" style="margin:0 0 6px">' +
          '<strong class="colisnom">' +
            // Le dénominateur compte TOUS les colis, annulés compris :
            // le rang vient de cet ensemble, sinon on afficherait un
            // « colis 3 sur 2 » dès qu'un colis est annulé.
            esc(t('parcelOf').replace('{n}', k.rang).replace('{sur}', colis.length)) +
            ' · ' + esc(k.commune_origine) + '</strong>' +
          '<span class="pill ' + kpl.c + '">' + esc(t(kpl.k)) + '</span></div>' +

        (annule
          ? '<p class="note" style="padding:0">' + esc(t('parcelCancelled')) +
            (k.motif_annulation ? ' — ' + esc(k.motif_annulation) : '') + '</p>'
          : (fini ? '' :
              (code
                ? '<div class="code"><div class="eyebrow">' + esc(t('codeT')) + '</div>' +
                  '<div class="codenum num">' + esc(code) + '</div></div>'
                : '') +
              // Téléphone perdu : le code n'est gardé que haché, personne
              // ne peut le relire. Avec un compte, on en redemande un et
              // l'ancien meurt.
              '<div id="codeMsg-' + esc(k.id) + '"></div>' +
              '<button class="ghost" data-recode="' + esc(k.id) + '" ' +
                'data-ref="' + esc(o.reference) + '">' + esc(t('lostCode')) + '</button>'
            ) +
            // Dès l'embarquement, le colis est dans le réseau du
            // transporteur : c'est ce numéro qui le suit.
            (k.numero_suivi
              ? '<div class="totals"><div class="trow"><span>' + esc(t('tracking')) + '</span>' +
                '<strong class="num">' + esc(k.numero_suivi) + '</strong></div>' +
                (CONFIG.flashipping && CONFIG.flashipping.suiviUrl
                  ? '<div class="trow"><span></span><a href="' +
                    esc(CONFIG.flashipping.suiviUrl.replace('{numero}',
                      encodeURIComponent(k.numero_suivi))) +
                    '" target="_blank" rel="noopener">' + esc(t('trackingLink')) + '</a></div>'
                  : '') +
                '</div>'
              : '') +
            blocEtapes(k.statut)
        ) +

        '<div class="shoplist">' + lignes.map(function (l) {
          // Un article retiré reste visible, barré, avec son motif :
          // sans ça le total baisse sans explication.
          return '<div class="line' + (l.annule_le ? ' retire' : '') + '">' +
            '<span class="lthumb t-rad"><svg><use href="#g-rad"/></svg></span>' +
            '<span class="lmeta"><span class="cname">' + esc(l.nom_produit) +
              (l.libelle ? ' · ' + esc(l.libelle) : '') + '</span>' +
            (l.annule_le
              ? '<span class="cshop">' + esc(t('removed')) +
                (l.motif_annulation ? ' · ' + esc(l.motif_annulation) : '') + '</span>'
              : '<span class="cshop num">×' + l.quantite + '</span>') +
            '<span class="cprice num">' + htg(l.prix_unitaire * l.quantite) + '</span>' +
            '</span></div>';
        }).join('') + '</div>' +
        (annule ? '' : '<div class="totals"><div class="trow"><span>' + esc(t('fee')) +
          '</span><span class="num">' + htg(k.frais) + '</span></div></div>') +
      '</div>';
    }).join('') +

    (vivants.some(function (k) { return k.statut === 'au_point_retrait'; })
      ? '<div class="warnbox">' + esc(t('delay')) + '</div>' : '') +
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
  /* Tout element porteur de data-lib prend son texte du dictionnaire.
     Le pied de page s'en sert, et n'importe quel libelle statique
     ajoute plus tard suivra la langue sans ligne de code en plus. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-lib]'), function (n) {
    n.textContent = t(n.getAttribute('data-lib'));
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

document.addEventListener('input', function (ev) {
  if (!ev.target || ev.target.id !== 'qBoutiques') return;
  filtreB.q = ev.target.value || '';
  rafraichirBoutiques();
});

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

  if (cible.id === 'versConnexion') {
    attenteConfirmation = null; venantDeConfirmer = false;
    modeConnexion = true; rendreCompte(); return;
  }

  const oeil = cible.closest ? cible.closest('[data-voir]') : null;
  if (oeil) {
    const champ = el(oeil.getAttribute('data-voir'));
    if (champ) {
      const cache = champ.type === 'password';
      champ.type = cache ? 'text' : 'password';
      oeil.textContent = t(cache ? 'hidePwd' : 'showPwd');
      oeil.setAttribute('aria-label', t(cache ? 'hidePwd' : 'showPwd'));
      champ.focus();
    }
    return;
  }

  if (cible.id === 'versAccueil') {
    venantDeConfirmer = false; aller('shops'); return;
  }

  if (cible.id === 'renvoyerLien') {
    const z = el('compteErr');
    cible.disabled = true;
    API.renvoyerConfirmation(attenteConfirmation)
      .then(function () {
        z.innerHTML = '<div class="warnbox">' + esc(t('resendDone')) + '</div>';
      })
      .catch(function (e) {
        z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
      })
      .then(function () { cible.disabled = false; });
    return;
  }
  if (cible.id === 'versInscription') { modeConnexion = false; rendreCompte(); return; }

  const puce = cible.closest ? cible.closest('[data-ville]') : null;
  if (puce) {
    filtreB.commune = puce.getAttribute('data-ville');
    // La barre se re-rend aussi : les pastilles doivent changer d'état.
    const zb = el('shopBarre');
    if (zb) zb.innerHTML = barreBoutiques();
    rafraichirBoutiques();
    return;
  }

  if (cible.id === 'compteBtn') { aller('compte'); return; }
  if (cible.id === 'clocheBtn') { aller('messages'); return; }

  if (cible.id === 'creerCompte') {
    const prenom = val2('cPrenom'), famille = val2('cNom');
    // Un seul champ en base : « Prénom Nom », tel qu'on appelle les gens.
    const nom = (prenom + ' ' + famille).trim().replace(/\s+/g, ' ');
    const tel = val2('cTel'), pin = val2('cPin'), pin2 = val2('cPin2');
    const dep = val2('cDep'), com = val2('cCom'), mail = val2('cMail');
    const z = el('compteErr');
    if (!prenom || !famille) {
      z.innerHTML = '<div class="erreur">' + esc(t('needBothNames')) + '</div>';
      return;
    }
    if (!API.telValide(tel)) {
      z.innerHTML = '<div class="erreur">' + esc(t('needTel')) + '</div>';
      return;
    }
    if (pin !== pin2) {
      z.innerHTML = '<div class="erreur">' + esc(t('pwdMismatch')) + '</div>';
      return;
    }
    if (!API.emailValide(mail)) {
      z.innerHTML = '<div class="erreur">' + esc(t('needEmail')) + '</div>'; return;
    }
    const souciMdp = API.forceMotDePasse(pin, tel);
    if (souciMdp) {
      z.innerHTML = '<div class="erreur">' + esc(souciMdp) + '</div>'; return;
    }
    if (!dep || !com) { z.innerHTML = '<div class="erreur">' + esc(t('needPlace')) + '</div>'; return; }
    if (!el('cAccord') || !el('cAccord').checked) {
      z.innerHTML = '<div class="erreur">' + esc(t('acceptNeeded')) + '</div>';
      return;
    }
    cible.disabled = true;
    API.creerCompte({ tel: tel, pin: pin, nom: nom, email: mail, langue: lang,
                      departement: dep, commune: com, conditions: true })
      .then(function (r) {
        // Le lieu part maintenant dans les métadonnées : plus de majProfil
        // ici, qui échouerait faute de session quand la confirmation
        // d'adresse est active.
        if (r && r.confirmation) {
          attenteConfirmation = API.normaliserEmail(mail);
          rendreCompte();
          return;
        }
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
    /* Le champ accepte un num\u00e9ro OU une adresse : on ne le normalise
       donc plus comme un t\u00e9l\u00e9phone, ce qui d\u00e9truirait l'adresse. La
       cl\u00e9 du compteur d'essais suit la m\u00eame logique, sinon « +509 31
       32 43 36 » et « 50931324336 » auraient deux compteurs s\u00e9par\u00e9s
       et le blocage se contournerait en changeant l'espacement. */
    const brut = (el('lTel').value || '').trim();
    const tel = brut.indexOf('@') !== -1
      ? brut.toLowerCase() : API.normaliserTel(brut);
    const pin = el('lPin').value || '';
    const z = el('compteErr');

    const reste = blocageRestant(tel);
    if (reste) {
      z.innerHTML = '<div class="erreur">' + esc(t('tooMany') + dureeLisible(reste)) +
        '</div><p class="note">' + esc(t('askAgent')) + '</p>';
      return;
    }

    cible.disabled = true;
    API.connecter(tel, pin).then(async function () {
      ecrireEssais(tel, null);       // compteur remis à zéro
      modeConnexion = false;
      invite = false;
      roleCourant = null;
      cache.commandes = [];
      cache.messages = [];

      /* Chacun chez soi. Un vendeur ou un agent qui se connecte ici
         atterrissait dans la boutique, alors que son travail est
         ailleurs. On l'envoie à sa porte d'entrée, qui le dirigera
         vers son écran.

         On ne REFUSE pas la connexion pour autant : un agent, un
         vendeur, ce sont des gens du Cap qui achèteront aussi sur
         Konbit Market. Leur fermer la boutique les pousserait à se
         créer un second compte avec un autre numéro, et on perdrait
         le lien entre les deux — historique, abandons, tout. La
         séparation qui compte est ailleurs : la base refuse déjà
         qu'on traite sa propre commande. */
      const role = await API.monRole().catch(function () { return null; });
      if (role && role !== 'acheteur') {
        location.href = 'gestion.html';
        return;
      }

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
    // Un code par colis : c'est celui de CE colis qu'on refait, les
    // autres ne bougent pas.
    const idColis = n.getAttribute('data-recode');
    const ref = n.getAttribute('data-ref');
    const z = el('codeMsg-' + idColis);
    n.disabled = true;
    API.regenererCodeColis(idColis, ref).then(function () {
      if (z) z.innerHTML = '<div class="warnbox">' + esc(t('newCodeDone')) + '</div>';
      cache.commandes = [];     // le colis a changé, on relit
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
  // Avant tout le reste : supabase-js vide le # dès qu'il s'initialise.
  const retour = typeRetourCourriel();
  if (retour === 'recovery') {
    // Le choix d'un nouveau mot de passe a sa propre page ; on lui passe
    // le # tel quel, c'est lui qui porte le jeton.
    location.replace('nouveau-mot-de-passe.html' + location.hash);
    return;
  }

  majCompteur();
  appliquerLangue();

  const libOk = await assurerLib();
  if (!libOk) horsLigne = true;

  try {
    await API.session();
    invite = await API.estInvite();
    roleCourant = invite ? null : await API.monRole().catch(function () { return null; });
    majEtatCompte();
  } catch (e) { /* hors ligne : on affiche le cache */ }
  await chargerReferentiels();
  await chargerCatalogue();
  appliquerLangue();
  compterNonLus();

  if (retour === 'signup') {
    venantDeConfirmer = true;
    // Le # a fait son travail : on le retire pour qu'un rechargement ne
    // rejoue pas le message, et pour ne pas laisser traîner un jeton
    // dans la barre d'adresse.
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    aller('compte');
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
