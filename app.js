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
    cart:'Panier', orders:'Mes commandes',
    ordersNote:'Suivez chaque commande jusqu’au retrait.',
    navHome:'Accueil', navShops:'Boutiques', navOrders:'Commandes', navCart:'Panier',
    back:'← Retour', items:'articles', by:'Vendu par', stock:'en stock',
    add:'Mettre au panier', soldout:'Rupture de stock', size:'Choix', verified:'VÉRIFIÉ',
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
    st1:'Commande reçue', st2:'Confirmée par téléphone', st3:'Colis au point de retrait',
    st4:'Payé et retiré', st5:'Terminée',
    pillAtt:'En préparation', pillReady:'À retirer', pillDone:'Terminée', pillKo:'Annulée',
    orderOf:'Commande du', offline:'Hors ligne — affichage du dernier catalogue connu.',
    stale:'Catalogue peut-être ancien. Reconnectez-vous pour le rafraîchir.',
    loadErr:'Impossible de charger. Vérifiez votre connexion.',
    zone:'Zone de service',
    from:'à partir de', video:'Vidéo de l\u2019article',
    videoData:'La vidéo ne se télécharge que si vous appuyez sur lecture.'
  },
  ht: {
    search:'Chèche yon atik', boost:'Mete devan', all:'Tout atik yo',
    shops:'Boutik', shopsNote:'Gran Nò. Chak machann verifye anvan nou pibliye.',
    cart:'Panyen', orders:'Kòmand mwen',
    ordersNote:'Swiv chak kòmand jiska retrè a.',
    navHome:'Akèy', navShops:'Boutik', navOrders:'Kòmand', navCart:'Panyen',
    back:'← Tounen', items:'atik', by:'Machann', stock:'nan stock',
    add:'Mete nan panyen', soldout:'Pa gen ankò', size:'Chwa', verified:'VERIFYE',
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
    st1:'Nou resevwa kòmand lan', st2:'Konfime nan telefòn', st3:'Kolis la nan pwen retrè a',
    st4:'Peye epi pran', st5:'Fini',
    pillAtt:'N ap prepare', pillReady:'Pou pran', pillDone:'Fini', pillKo:'Anile',
    orderOf:'Kòmand', offline:'Pa gen entènèt — n ap montre dènye katalòg nou te genyen.',
    stale:'Katalòg la ka vye. Konekte pou rafrechi l.',
    loadErr:'Nou pa ka chaje. Tcheke koneksyon w.',
    zone:'Zòn sèvis',
    from:'apati de', video:'Videyo atik la',
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

let cache = { categories: [], points: [], produits: [], boutiques: [], commandes: [] };
let prodCourant = null, boutiqueCourante = null, commandeCourante = null;
let pointChoisi = null;
let derniereCommande = null;
let horsLigne = false, catalogueVieux = false;
let envoiEnCours = false;

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

/* ---------- Chargement ------------------------------------ */

async function chargerReferentiels() {
  try {
    const [c, p] = await Promise.all([API.categories(), API.pointsRetrait()]);
    cache.categories = c.data || [];
    cache.points = p.data || [];
    if (!pointChoisi && cache.points.length) pointChoisi = cache.points[0].id;
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
  el('shopList').innerHTML = b.length ? b.map(function (s) {
    return '<button class="shop" data-shop="' + esc(s.id) + '">' +
      '<span class="avatar t-rad">' + esc((s.nom || '?').charAt(0)) + '</span>' +
      '<span class="shopmeta">' +
        '<span class="shopname">' + esc(s.nom) +
          ' <span class="badge ok">' + esc(t('verified')) + '</span></span>' +
        '<span class="shopsub">' + esc(s.commune) + '</span>' +
      '</span></button>';
  }).join('') : '<p class="empty">' + esc(t('emptyShops')) + '</p>';
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

// Variante actuellement choisie sur la fiche ouverte.
let varianteChoisie = null;

function majPrixAffiche() {
  const p = prodCourant;
  if (!p) return;
  const vars = (p.variantes || []).filter(function (v) { return v.stock > 0; });
  const v = vars.filter(function (x) { return x.id === varianteChoisie; })[0] || vars[0] || null;
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

function totaux() {
  let sous = 0;
  const shops = {};
  panier.forEach(function (l) {
    sous += l.prix * l.quantite;
    shops[l.boutiqueId] = 1;
  });
  const frais = Object.keys(shops).length * 25000; // 250,00 HTG par boutique
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

  // Coordonnées : l'appel de confirmation avant expédition en dépend.
  const prof = await API.profil().catch(function () { return null; });
  h += '<div class="sechead"><h2 style="font-size:15px">' + esc(t('yourName')) + '</h2></div>' +
    '<div class="shoplist">' +
      '<div class="champ"><label for="fNom">' + esc(t('yourName')) + '</label>' +
        '<input id="fNom" value="' + esc(prof && prof.nom !== 'Nouveau client' ? prof.nom : '') + '"></div>' +
      '<div class="champ"><label for="fTel">' + esc(t('yourPhone')) + '</label>' +
        '<input id="fTel" type="tel" inputmode="tel" value="' + esc(prof ? prof.telephone : '') + '"></div>' +
    '</div>' +
    '<p class="note">' + esc(t('phoneWhy')) + '</p>';

  h += '<div class="sechead"><h2 style="font-size:15px">' + esc(t('pickT')) + '</h2></div><div class="picker">' +
    cache.points.map(function (pt) {
      return '<button class="pick" data-pick="' + esc(pt.id) + '" aria-pressed="' + (pointChoisi === pt.id) + '">' +
        '<span class="dot"></span><span class="shopmeta">' +
        '<span class="shopname">' + esc(pt.nom) + '</span>' +
        '<span class="shopsub">' + esc(pt.repere) + ' · ' + esc(pt.commune) + '</span>' +
        '</span></button>';
    }).join('') + '</div>';

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
  h += '<button class="cta" id="orderBtn">' + esc(t('order')) + ' · ' + htg(tt.total) + '</button>';
  h += '<div style="height:20px"></div>';
  zone.innerHTML = h;
}

/* ---------- Rendu : confirmation -------------------------- */

function etapes(statut) {
  const ordre = ['recue', 'payee', 'fonds_bloques', 'au_point_retrait', 'code_valide', 'fonds_liberes'];
  let i = 0;
  if (statut === 'recue') i = 0;
  else if (statut === 'au_point_retrait') i = 2;
  else if (statut === 'code_valide') i = 3;
  else if (statut === 'fonds_liberes') i = 4;
  else if (statut === 'remboursee' || statut === 'abandonnee') i = -1;
  else i = 1;
  return i;
}

function blocEtapes(statut) {
  const cles = ['st1', 'st2', 'st3', 'st4', 'st5'];
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
  const zone = el('orderList');
  zone.innerHTML = '<p class="empty">…</p>';
  try {
    cache.commandes = await API.mesCommandes();
  } catch (e) {
    zone.innerHTML = '<p class="empty">' + esc(t('loadErr')) + '</p>';
    return;
  }
  const liste = cache.commandes || [];
  zone.innerHTML = liste.length ? liste.map(function (o) {
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
      '<button class="ghost" data-go="home">' + esc(t('browse')) + '</button>';
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
    (code && !fini
      ? '<div class="code"><div class="eyebrow">' + esc(t('codeT')) + '</div>' +
        '<div class="codenum num">' + esc(code) + '</div></div>' +
        '<p class="note" style="padding:0">' + esc(t('codeNote')) + '</p>'
      : '') +
    (o.point ? '<div class="totals"><div class="trow"><span>' + esc(t('pickT')) + '</span>' +
      '<span style="text-align:right">' + esc(o.point.nom) + '<br>' +
      '<span class="cshop">' + esc(o.point.repere) + '</span></span></div></div>' : '') +
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

const VUES = ['home', 'shops', 'shop', 'product', 'cart', 'done', 'orders', 'order'];

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
  majBandeau();
  window.scrollTo(0, 0);
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
  const nom = (el('fNom').value || '').trim();
  const tel = (el('fTel').value || '').trim();

  if (!nom || tel.length < 8) {
    err.innerHTML = '<div class="erreur">' + esc(t('needName')) + '</div>';
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
    await API.majProfil({ nom: nom, telephone: tel, langue: lang });
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
  const cible = ev.target;

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

  if (cible.id === 'addBtn') {
    const p = prodCourant;
    if (!p) return;
    const dispo = (p.variantes || []).filter(function (v) { return v.stock > 0; });
    const vid = varianteChoisie || (dispo[0] && dispo[0].id);
    if (!vid) return;
    const v = dispo.filter(function (x) { return x.id === vid; })[0] || dispo[0];

    const existante = panier.filter(function (l) { return l.variante === v.id; })[0];
    if (existante) {
      if (existante.quantite < v.stock) existante.quantite++;
    } else {
      panier.push({
        variante: v.id, quantite: 1, libelle: v.libelle,
        prix: prixDe(p, v), nom: p.nom, categorie: p.categorie,
        boutique: p.boutique ? p.boutique.nom : '', boutiqueId: p.boutique ? p.boutique.id : '',
        photo: photo(p), stock: v.stock
      });
    }
    sauverPanier();
    majCompteur();
    aller('cart');
    return;
  }

  const n = cible.closest ? cible.closest('[data-prod],[data-shop],[data-cat],[data-go],[data-pick],[data-var],[data-inc],[data-dec],[data-order]') : null;
  if (!n) return;

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

  try { await API.session(); } catch (e) { /* hors ligne : on affiche le cache */ }
  await chargerReferentiels();
  await chargerCatalogue();
  appliquerLangue();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
