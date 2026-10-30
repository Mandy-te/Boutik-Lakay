/* ============================================================
   Boutique Lakay — écran de gestion

   Trois onglets, dans l'ordre où l'équipe travaille :
   Comptoir  : les commandes qui attendent un geste, aujourd'hui
   Catalogue : saisir un produit, ses variantes, ses photos, publier
   Boutiques : créer un vendeur, le vérifier, fixer son plan

   Rien ici ne décide d'une règle : tout passe par les fonctions
   de la base (admin.js). Un agent ne peut donc pas valider un
   retrait sans le bon code, ni publier une fiche sans photo.
   ============================================================ */

let ongletActif = 'comptoir';
let boutiques = [];
let lesPlans = [];
let categories = [];
let boutiqueOuverte = null;
let produits = [];
let occupe = false;

/* ---------- Petits outils -------------------------------- */

function el(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Les montants circulent en centimes. On n'affiche jamais des centimes bruts.
function htg(c) { return new Intl.NumberFormat('fr-FR').format(Math.round(c / 100)) + ' HTG'; }
function enCentimes(gourdes) { return Math.round(parseFloat(String(gourdes).replace(',', '.')) * 100); }
function quand(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('fr-FR',
      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ''; }
}
function dansCombien(iso) {
  if (!iso) return '';
  const h = Math.round((new Date(iso) - Date.now()) / 3600000);
  if (h < 0) return 'expiré depuis ' + Math.abs(h) + ' h';
  return 'expire dans ' + h + ' h';
}
function msg(zone, texte, type) {
  const e = el(zone);
  if (e) e.innerHTML = texte
    ? '<div class="' + (type === 'ok' ? 'succes' : 'erreur') + '">' + esc(texte) + '</div>'
    : '';
}

// Enveloppe commune : empêche le double-clic, remet le bouton en état,
// et affiche l'erreur de la base telle quelle plutôt qu'un message vague.
async function agir(bouton, zoneMsg, travail, apres) {
  if (occupe) return;
  occupe = true;
  const texte = bouton ? bouton.textContent : '';
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Un instant…'; }
  msg(zoneMsg, '');
  try {
    const r = await travail();
    if (apres) await apres(r);
  } catch (e) {
    msg(zoneMsg, e.message || 'Échec de l’opération.', 'ko');
  } finally {
    occupe = false;
    if (bouton) { bouton.disabled = false; bouton.textContent = texte; }
  }
}

/* ---------- Onglet Comptoir ------------------------------ */

function etatCommande(o) {
  if (o.statut === 'au_point_retrait') return { c: 'ok', mot: 'À retirer' };
  if (o.confirme_tel_le) return { c: 'att', mot: 'Confirmée, à expédier' };
  return { c: 'warn', mot: 'À confirmer par téléphone' };
}

function carteCommande(o) {
  const e = etatCommande(o);
  const articles = (o.lignes || []).map(function (l) {
    return esc(l.nom_produit) + (l.libelle ? ' · ' + esc(l.libelle) : '') +
      ' <span class="num">×' + l.quantite + '</span>';
  }).join('<br>');
  const ab = o.acheteur && o.acheteur.abandons ? o.acheteur.abandons : 0;

  let actions = '';
  if (!o.confirme_tel_le) {
    actions =
      '<p class="note">Appelle le client. Ne laisse pas partir le colis avant sa confirmation : ' +
      'c’est ce qui évite les colis immobilisés pour rien.</p>' +
      '<button class="cta" data-tel="' + esc(o.id) + '">Client confirmé par téléphone</button>' +
      '<button class="ghost" data-abandon="' + esc(o.id) + '">Injoignable — annuler</button>';
  } else if (o.statut !== 'au_point_retrait') {
    actions = '<button class="cta" data-arrivee="' + esc(o.id) + '">Colis arrivé au point de retrait</button>' +
      '<button class="ghost" data-abandon="' + esc(o.id) + '">Annuler la commande</button>';
  } else {
    const retard = o.expire_le && new Date(o.expire_le) < Date.now();
    actions =
      (o.expire_le ? '<div class="' + (retard ? 'retard' : 'note') + '">' +
        esc(dansCombien(o.expire_le)) + '</div>' : '') +
      '<div class="champ"><label for="code-' + esc(o.id) + '">Code de retrait du client</label>' +
        '<input class="codein" id="code-' + esc(o.id) + '" inputmode="numeric" ' +
        'maxlength="6" placeholder="------"></div>' +
      '<button class="cta vert" data-valider="' + esc(o.id) + '">Encaisser ' + htg(o.total) + ' et remettre</button>' +
      '<button class="ghost" data-abandon="' + esc(o.id) + '">Non retiré — annuler</button>';
  }

  return '<div class="bloc">' +
    '<div class="titreligne"><span class="oref num">' + esc(o.reference) + '</span>' +
      '<span class="pill ' + e.c + '">' + esc(e.mot) + '</span>' +
      (ab >= 1 ? '<span class="pill ko">' + ab + ' abandon' + (ab > 1 ? 's' : '') + '</span>' : '') +
    '</div>' +
    '<div class="ligne"><span>Client</span><strong>' +
      esc(o.acheteur ? o.acheteur.nom : '—') + '</strong></div>' +
    (o.acheteur && o.acheteur.telephone
      ? '<div class="ligne"><span>Téléphone</span><span class="tel num">' +
        esc(o.acheteur.telephone) + '</span></div>' : '') +
    '<div class="ligne"><span>Retrait</span><strong>' +
      esc(o.point ? o.point.nom : '—') + '</strong></div>' +
    '<div class="ligne"><span>Commandée</span><span>' + esc(quand(o.cree_le)) + '</span></div>' +
    '<div class="note">' + articles + '</div>' +
    '<div class="ligne"><span>À encaisser</span><strong class="num">' + htg(o.total) + '</strong></div>' +
    '<div id="msg-' + esc(o.id) + '"></div>' +
    actions +
  '</div>';
}

async function rendreComptoir() {
  const p = el('panneau');
  p.innerHTML = '<div class="sechead"><h2>Comptoir</h2></div><p class="empty">…</p>';
  let liste;
  try {
    liste = await ADMIN.commandesOuvertes();
  } catch (e) {
    p.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }
  const aRetirer = liste.filter(function (o) { return o.statut === 'au_point_retrait'; });
  const aPreparer = liste.filter(function (o) { return o.statut !== 'au_point_retrait'; });

  p.innerHTML =
    '<div class="sechead"><h2>Comptoir</h2><span class="eyebrow num">' +
      liste.length + ' en cours</span></div>' +
    (liste.length === 0
      ? '<p class="empty">Rien à traiter. Les commandes apparaîtront ici.</p>'
      : '') +
    (aRetirer.length
      ? '<div class="sechead"><h2 style="font-size:14px">Au comptoir</h2></div>' +
        '<div class="pile">' + aRetirer.map(carteCommande).join('') + '</div>'
      : '') +
    (aPreparer.length
      ? '<div class="sechead"><h2 style="font-size:14px">À préparer</h2></div>' +
        '<div class="pile">' + aPreparer.map(carteCommande).join('') + '</div>'
      : '');
}

/* ---------- Onglet Catalogue ----------------------------- */

function carteProduit(p) {
  const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
  const photos = (p.medias || []).slice()
    .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
  const pub = p.statut === 'publie';

  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill ' + (pub ? 'ok' : (p.statut === 'suspendu' ? 'ko' : 'gris')) + '">' +
      esc(pub ? 'En vitrine' : (p.statut === 'suspendu' ? 'Suspendu' : 'Brouillon')) + '</span>' +
      (p.prepaiement_exige ? '<span class="pill warn">Prépaiement</span>' : '') +
    '</div>' +
    '<div class="ligne"><span>Prix</span><strong class="num">' + htg(p.prix) + '</strong></div>' +
    '<div class="ligne"><span>Stock total</span><strong class="num">' + stock + '</strong></div>' +
    (photos.length
      ? '<div class="vignettes">' + photos.map(function (m) {
          return '<img class="vignette" src="' + esc(API.photoUrl(m.chemin)) + '" alt="">';
        }).join('') + '</div>'
      : '<div class="note">Aucune photo. Une fiche sans photo ne se vend pas.</div>') +

    '<div class="pile" style="padding:0;gap:8px">' +
      (p.variantes || []).map(function (v) {
        return '<div class="duo">' +
          '<div class="champ"><label>' + esc(v.libelle) + '</label>' +
            '<input class="num" type="number" min="0" value="' + (v.stock || 0) +
            '" data-stock="' + esc(v.id) + '"></div></div>';
      }).join('') +
    '</div>' +

    '<div class="duo">' +
      '<div class="champ"><label for="v-lib-' + esc(p.id) + '">Nouvelle variante</label>' +
        '<input id="v-lib-' + esc(p.id) + '" placeholder="M, 42, Brun…"></div>' +
      '<div class="champ"><label for="v-st-' + esc(p.id) + '">Stock</label>' +
        '<input id="v-st-' + esc(p.id) + '" type="number" min="0" value="1"></div>' +
    '</div>' +
    '<button class="mini" data-var="' + esc(p.id) + '">Ajouter la variante</button>' +

    '<div class="champ"><label for="ph-' + esc(p.id) + '">Ajouter une photo</label>' +
      '<input id="ph-' + esc(p.id) + '" type="file" accept="image/jpeg,image/png,image/webp" ' +
      'capture="environment" data-photo="' + esc(p.id) + '"></div>' +

    '<div id="msg-' + esc(p.id) + '"></div>' +
    '<div class="rangee">' +
      (pub
        ? '<button class="ghost" data-depublier="' + esc(p.id) + '">Retirer de la vitrine</button>'
        : '<button class="cta" data-publier="' + esc(p.id) + '">Publier</button>') +
    '</div>' +
  '</div>';
}

async function rendreCatalogue() {
  const p = el('panneau');
  const verifiees = boutiques.filter(function (b) { return b.statut === 'verifiee'; });

  if (!verifiees.length) {
    p.innerHTML = '<div class="sechead"><h2>Catalogue</h2></div>' +
      '<p class="empty">Aucune boutique vérifiée. Crée et vérifie un vendeur ' +
      'dans l’onglet Boutiques avant de saisir des produits.</p>';
    return;
  }
  if (!boutiqueOuverte || !verifiees.filter(function (b) { return b.id === boutiqueOuverte; }).length) {
    boutiqueOuverte = verifiees[0].id;
  }

  p.innerHTML =
    '<div class="sechead"><h2>Catalogue</h2></div>' +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="champ"><label for="selBoutique">Boutique</label><select id="selBoutique">' +
          verifiees.map(function (b) {
            return '<option value="' + esc(b.id) + '"' +
              (b.id === boutiqueOuverte ? ' selected' : '') + '>' +
              esc(b.nom) + ' — ' + esc(b.commune) + '</option>';
          }).join('') + '</select></div>' +
      '</div>' +

      '<div class="bloc">' +
        '<div class="titreligne"><h2>Nouveau produit</h2></div>' +
        '<div class="champ"><label for="pNom">Nom de l’article</label>' +
          '<input id="pNom" placeholder="Chemise en lin, homme"></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="pCat">Catégorie</label><select id="pCat">' +
            categories.map(function (c) {
              return '<option value="' + esc(c.code) + '">' + esc(c.nom_fr) + '</option>';
            }).join('') + '</select></div>' +
          '<div class="champ"><label for="pPrix">Prix en gourdes</label>' +
            '<input id="pPrix" inputmode="decimal" placeholder="2450"></div>' +
        '</div>' +
        '<div class="champ"><label for="pDesc">Description</label>' +
          '<textarea id="pDesc" placeholder="Taille, matière, état…"></textarea></div>' +
        '<label class="coche"><input type="checkbox" id="pPrepaie">' +
          'Prépaiement exigé (gros montant, le vendeur assume)</label>' +
        '<div id="newProdErr"></div>' +
        '<button class="cta" id="creerProduit">Créer en brouillon</button>' +
        '<p class="note">Un produit naît en brouillon. Il ne part en vitrine ' +
          'qu’avec au moins une photo et du stock.</p>' +
      '</div>' +
    '</div>' +
    '<div class="sechead"><h2 style="font-size:14px">Produits de cette boutique</h2>' +
      '<span class="eyebrow num" id="nbProd"></span></div>' +
    '<div class="pile" id="listeProduits"><p class="empty">…</p></div>';

  await rechargerProduits();
}

async function rechargerProduits() {
  const zone = el('listeProduits');
  if (!zone) return;
  try {
    produits = await ADMIN.produitsBoutique(boutiqueOuverte);
    if (el('nbProd')) el('nbProd').textContent = produits.length || '';
    zone.innerHTML = produits.length
      ? produits.map(carteProduit).join('')
      : '<p class="empty">Aucun produit. Crée le premier ci-dessus.</p>';
  } catch (e) {
    zone.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
  }
}

/* ---------- Onglet Boutiques ----------------------------- */

function planActif(b) {
  const a = (b.abonnements || []).filter(function (x) { return !x.fin; })[0];
  return a ? a.plan : null;
}

function carteBoutique(b) {
  const st = b.statut;
  const plan = planActif(b);
  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(b.nom) + '</h2>' +
      '<span class="pill ' + (st === 'verifiee' ? 'ok' : (st === 'suspendue' ? 'ko' : 'warn')) + '">' +
      esc(st === 'verifiee' ? 'Vérifiée' : (st === 'suspendue' ? 'Suspendue' : 'En attente')) +
      '</span></div>' +
    '<div class="ligne"><span>Commune</span><strong>' + esc(b.commune) + '</strong></div>' +
    (b.adresse_repere ? '<div class="ligne"><span>Repère</span><span>' +
      esc(b.adresse_repere) + '</span></div>' : '') +
    '<div class="champ"><label for="plan-' + esc(b.id) + '">Plan</label>' +
      '<select id="plan-' + esc(b.id) + '" data-plan="' + esc(b.id) + '">' +
        '<option value="">— aucun —</option>' +
        lesPlans.map(function (p) {
          return '<option value="' + esc(p.code) + '"' + (plan === p.code ? ' selected' : '') + '>' +
            esc(p.nom) + ' — ' + (p.commission_bps / 100) + ' % de commission</option>';
        }).join('') + '</select></div>' +
    '<div id="msg-' + esc(b.id) + '"></div>' +
    '<div class="rangee">' +
      (st !== 'verifiee'
        ? '<button class="mini" data-verifier="' + esc(b.id) + '">Vérifier</button>' : '') +
      (st === 'verifiee'
        ? '<button class="mini" data-suspendre="' + esc(b.id) + '">Suspendre</button>' : '') +
      (st === 'suspendue'
        ? '<button class="mini" data-verifier="' + esc(b.id) + '">Réactiver</button>' : '') +
    '</div>' +
    (st === 'en_attente'
      ? '<p class="note">Vérifie la patente et la pièce d’identité avant de ' +
        'passer en vitrine. C’est ce qui tient la confiance de la plateforme.</p>' : '') +
  '</div>';
}

async function rendreBoutiques() {
  const p = el('panneau');
  p.innerHTML =
    '<div class="sechead"><h2>Boutiques</h2><span class="eyebrow num">' +
      (boutiques.length || '') + '</span></div>' +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="titreligne"><h2>Nouveau vendeur</h2></div>' +
        '<div class="champ"><label for="bNom">Nom de la boutique</label>' +
          '<input id="bNom" placeholder="Kay Mirèy"></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="bCommune">Commune</label>' +
            '<input id="bCommune" placeholder="Cap-Haïtien"></div>' +
          '<div class="champ"><label for="bRepere">Point de repère</label>' +
            '<input id="bRepere" placeholder="Rue 10 J, près de…"></div>' +
        '</div>' +
        '<div class="champ"><label for="bDesc">Ce que vend ce vendeur</label>' +
          '<textarea id="bDesc"></textarea></div>' +
        '<div id="newShopErr"></div>' +
        '<button class="cta" id="creerBoutique">Créer en attente</button>' +
        '<p class="note">La boutique est créée à ton nom et reste invisible ' +
          'jusqu’à sa vérification.</p>' +
      '</div>' +
    '</div>' +
    '<div class="pile">' +
      (boutiques.length ? boutiques.map(carteBoutique).join('')
        : '<p class="empty">Aucune boutique. Crée la première ci-dessus.</p>') +
    '</div>';
}

/* ---------- Navigation ----------------------------------- */

async function rendre() {
  Array.prototype.forEach.call(document.querySelectorAll('.ong'), function (b) {
    b.setAttribute('aria-selected', b.getAttribute('data-ong') === ongletActif);
  });
  if (ongletActif === 'comptoir') await rendreComptoir();
  if (ongletActif === 'catalogue') await rendreCatalogue();
  if (ongletActif === 'boutiques') await rendreBoutiques();
}

async function rechargerBase() {
  const r = await Promise.all([
    ADMIN.toutesBoutiques().catch(function () { return []; }),
    ADMIN.plans().catch(function () { return []; }),
    API.categories().catch(function () { return { data: [] }; })
  ]);
  boutiques = r[0];
  lesPlans = r[1];
  categories = r[2].data || [];
}

function montrer(vue) {
  ['login', 'refus', 'app'].forEach(function (v) {
    el('vue-' + v).hidden = (v !== vue);
  });
  el('sortir').hidden = (vue !== 'app');
}

/* ---------- Événements ----------------------------------- */

document.addEventListener('click', async function (ev) {
  const c = ev.target;

  if (c.id === 'entrer') {
    await agir(c, 'loginErr', function () {
      return ADMIN.connexion(el('email').value.trim(), el('mdp').value);
    }, demarrerSession);
    return;
  }
  if (c.id === 'sortir' || c.id === 'refusSortir') {
    await ADMIN.deconnexion();
    location.reload();
    return;
  }
  if (c.classList.contains('ong')) {
    ongletActif = c.getAttribute('data-ong');
    await rendre();
    return;
  }

  /* --- Comptoir --- */
  if (c.hasAttribute('data-tel')) {
    const id = c.getAttribute('data-tel');
    await agir(c, 'msg-' + id, function () { return ADMIN.confirmerTelephone(id); }, rendreComptoir);
    return;
  }
  if (c.hasAttribute('data-arrivee')) {
    const id = c.getAttribute('data-arrivee');
    await agir(c, 'msg-' + id, function () { return ADMIN.marquerArrivee(id); }, rendreComptoir);
    return;
  }
  if (c.hasAttribute('data-valider')) {
    const id = c.getAttribute('data-valider');
    const champ = el('code-' + id);
    const code = champ ? champ.value.trim() : '';
    if (code.length !== 6) { msg('msg-' + id, 'Entre les 6 chiffres du code du client.', 'ko'); return; }
    await agir(c, 'msg-' + id, function () { return ADMIN.validerRetrait(id, code); },
      async function (r) {
        msg('msg-' + id, 'Encaissé ' + htg(r.total) +
          (r.en_retard ? ' (retrait en retard)' : '') + '. Colis remis.', 'ok');
        setTimeout(rendreComptoir, 1400);
      });
    return;
  }
  if (c.hasAttribute('data-abandon')) {
    const id = c.getAttribute('data-abandon');
    // Pas de boîte de dialogue : on affiche une confirmation dans la page,
    // parce qu'un abandon remet le stock et compte contre le client.
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer l’annulation';
      msg('msg-' + id, 'Les articles retournent en stock et un abandon est ' +
        'compté au client. Appuie encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return ADMIN.marquerAbandon(id, 'Non retiré'); },
      function (n) {
        msg('msg-' + id, 'Annulée. Ce client totalise ' + n + ' abandon(s).', 'ok');
        setTimeout(rendreComptoir, 1400);
      });
    return;
  }

  /* --- Catalogue --- */
  if (c.id === 'creerProduit') {
    const nom = el('pNom').value.trim();
    const prix = enCentimes(el('pPrix').value);
    if (!nom) { msg('newProdErr', 'Donne un nom à l’article.', 'ko'); return; }
    if (!prix || prix <= 0) { msg('newProdErr', 'Indique un prix en gourdes.', 'ko'); return; }
    await agir(c, 'newProdErr', function () {
      return ADMIN.creerProduit({
        boutique: boutiqueOuverte, categorie: el('pCat').value,
        nom: nom, prix: prix, description: el('pDesc').value.trim(),
        prepaiement_exige: el('pPrepaie').checked
      });
    }, async function () {
      el('pNom').value = ''; el('pPrix').value = ''; el('pDesc').value = '';
      el('pPrepaie').checked = false;
      await rechargerProduits();
    });
    return;
  }
  if (c.hasAttribute('data-var')) {
    const id = c.getAttribute('data-var');
    const lib = el('v-lib-' + id).value.trim();
    const st = el('v-st-' + id).value;
    await agir(c, 'msg-' + id, function () { return ADMIN.ajouterVariante(id, lib, st, 0); },
      rechargerProduits);
    return;
  }
  if (c.hasAttribute('data-publier')) {
    const id = c.getAttribute('data-publier');
    await agir(c, 'msg-' + id, function () { return ADMIN.publier(id); }, rechargerProduits);
    return;
  }
  if (c.hasAttribute('data-depublier')) {
    const id = c.getAttribute('data-depublier');
    await agir(c, 'msg-' + id, function () { return ADMIN.depublier(id); }, rechargerProduits);
    return;
  }

  /* --- Boutiques --- */
  if (c.id === 'creerBoutique') {
    const nom = el('bNom').value.trim();
    const commune = el('bCommune').value.trim();
    if (!nom || !commune) { msg('newShopErr', 'Le nom et la commune sont nécessaires.', 'ko'); return; }
    await agir(c, 'newShopErr', function () {
      return ADMIN.creerBoutique({
        nom: nom, commune: commune,
        adresse_repere: el('bRepere').value.trim(),
        description: el('bDesc').value.trim()
      });
    }, async function () { await rechargerBase(); await rendreBoutiques(); });
    return;
  }
  if (c.hasAttribute('data-verifier')) {
    const id = c.getAttribute('data-verifier');
    await agir(c, 'msg-' + id, function () { return ADMIN.majStatutBoutique(id, 'verifiee'); },
      async function () { await rechargerBase(); await rendreBoutiques(); });
    return;
  }
  if (c.hasAttribute('data-suspendre')) {
    const id = c.getAttribute('data-suspendre');
    await agir(c, 'msg-' + id, function () { return ADMIN.majStatutBoutique(id, 'suspendue'); },
      async function () { await rechargerBase(); await rendreBoutiques(); });
    return;
  }
});

document.addEventListener('change', async function (ev) {
  const c = ev.target;

  if (c.id === 'selBoutique') {
    boutiqueOuverte = c.value;
    await rechargerProduits();
    return;
  }
  if (c.hasAttribute('data-plan')) {
    const id = c.getAttribute('data-plan');
    if (!c.value) return;
    await agir(null, 'msg-' + id, function () { return ADMIN.definirPlan(id, c.value); },
      async function () {
        msg('msg-' + id, 'Plan enregistré.', 'ok');
        await rechargerBase();
      });
    return;
  }
  if (c.hasAttribute('data-stock')) {
    const vid = c.getAttribute('data-stock');
    await agir(null, null, function () { return ADMIN.majStock(vid, c.value); });
    return;
  }
  if (c.hasAttribute('data-photo')) {
    const id = c.getAttribute('data-photo');
    const f = c.files && c.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      msg('msg-' + id, 'Photo trop lourde : 5 Mo maximum.', 'ko');
      c.value = '';
      return;
    }
    msg('msg-' + id, 'Envoi de la photo…', 'ok');
    await agir(null, 'msg-' + id, function () { return ADMIN.televerserPhoto(id, f, true); },
      async function () { c.value = ''; await rechargerProduits(); });
    return;
  }
});

// Entrée dans le champ mot de passe = connexion.
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Enter' && (ev.target.id === 'mdp' || ev.target.id === 'email')) {
    const b = el('entrer');
    if (b) b.click();
  }
});

/* ---------- Démarrage ------------------------------------ */

async function demarrerSession() {
  const role = await ADMIN.monRole();
  if (role !== 'agent' && role !== 'admin') {
    el('refusTxt').textContent = role
      ? 'Ce compte a le rôle « ' + role + ' ». Seuls les rôles agent et admin ' +
        'ouvrent cet écran. Change le rôle dans Supabase, puis reconnecte-toi.'
      : 'Aucun profil trouvé pour ce compte.';
    montrer('refus');
    return;
  }
  montrer('app');
  await rechargerBase();
  await rendre();
}

(async function () {
  if (!API.pret()) {
    msg('loginErr', 'Librairie non chargée. Vérifie ta connexion et recharge.', 'ko');
    montrer('login');
    return;
  }
  // Une session déjà ouverte évite de retaper le mot de passe à chaque fois.
  try {
    const { data } = await API.sb().auth.getSession();
    if (data && data.session && !data.session.user.is_anonymous) {
      await demarrerSession();
      return;
    }
  } catch (e) {}
  montrer('login');
})();
