/* ============================================================
   Boutique Lakay — écran de gestion

   Quatre onglets, dans l'ordre où l'équipe travaille :
   Comptoir   : les commandes qui attendent un geste, aujourd'hui
   Catalogue  : saisir, corriger, photographier, publier
   Boutiques  : créer un vendeur, le vérifier, fixer son plan
   Catégories : ajouter une catégorie sans repasser par le code

   Rien ici ne décide d'une règle : tout passe par les fonctions
   de la base (admin.js). Un agent ne peut donc pas valider un
   retrait sans le bon code, ni publier une fiche sans photo.
   ============================================================ */

let ongletActif = 'comptoir';
let boutiques = [];
let lesPlans = [];
let categories = [];          // toutes, actives et inactives
let boutiqueOuverte = null;
let produits = [];
let produitEnEdition = null;  // id du produit dont le formulaire est ouvert
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
function enCentimes(gourdes) {
  const n = parseFloat(String(gourdes == null ? '' : gourdes).replace(',', '.'));
  return isFinite(n) ? Math.round(n * 100) : 0;
}
function enGourdes(centimes) {
  if (!centimes) return '';
  return (centimes / 100) % 1 === 0 ? String(centimes / 100) : (centimes / 100).toFixed(2);
}
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
  return h < 0 ? 'expiré depuis ' + Math.abs(h) + ' h' : 'expire dans ' + h + ' h';
}
function msg(zone, texte, type) {
  const e = el(zone);
  if (e) e.innerHTML = texte
    ? '<div class="' + (type === 'ok' ? 'succes' : 'erreur') + '">' + esc(texte) + '</div>'
    : '';
}
function val(id) { const e = el(id); return e ? e.value.trim() : ''; }

// Enveloppe commune : empêche le double-clic, remet le bouton en état,
// et affiche l'erreur de la base telle quelle plutôt qu'un message vague.
async function agir(bouton, zoneMsg, travail, apres) {
  if (occupe) return;
  occupe = true;
  const texte = bouton ? bouton.textContent : '';
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Un instant…'; }
  if (zoneMsg) msg(zoneMsg, '');
  try {
    const r = await travail();
    if (apres) await apres(r);
  } catch (e) {
    if (zoneMsg) msg(zoneMsg, e.message || 'Échec de l’opération.', 'ko');
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
      '<p class="note">Appelle le client. Ne laisse pas partir le colis avant sa ' +
      'confirmation : c’est ce qui évite les colis immobilisés pour rien.</p>' +
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
      '<button class="cta vert" data-valider="' + esc(o.id) + '">Encaisser ' +
        htg(o.total) + ' et remettre</button>' +
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
    (liste.length === 0 ? '<p class="empty">Rien à traiter. Les commandes apparaîtront ici.</p>' : '') +
    (aRetirer.length
      ? '<div class="sechead"><h2 style="font-size:14px">Au comptoir</h2></div>' +
        '<div class="pile">' + aRetirer.map(carteCommande).join('') + '</div>' : '') +
    (aPreparer.length
      ? '<div class="sechead"><h2 style="font-size:14px">À préparer</h2></div>' +
        '<div class="pile">' + aPreparer.map(carteCommande).join('') + '</div>' : '');
}

/* ---------- Onglet Catalogue ----------------------------- */

function optionsCategories(choisie) {
  return categories.filter(function (c) { return c.actif || c.code === choisie; })
    .map(function (c) {
      return '<option value="' + esc(c.code) + '"' +
        (c.code === choisie ? ' selected' : '') + '>' + esc(c.nom_fr) +
        (c.actif ? '' : ' (désactivée)') + '</option>';
    }).join('');
}

function blocMedias(p) {
  const med = (p.medias || []).slice()
    .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
  if (!med.length) {
    return '<div class="note">Aucun média. Une fiche sans photo ne se vend pas.</div>';
  }
  return '<div class="vignettes">' + med.map(function (m) {
    const url = API.photoUrl(m.chemin);
    const vid = (m.type || 'image') === 'video';
    return '<div class="media">' +
      (vid
        ? '<video class="vignette" src="' + esc(url) + '" muted playsinline preload="metadata"></video>' +
          '<span class="vid">VIDÉO</span>'
        : '<img class="vignette" src="' + esc(url) + '" alt="" loading="lazy">') +
      '<button class="sup" data-supmedia="' + esc(m.id) + '" data-prod="' + esc(p.id) +
        '" aria-label="Supprimer ce média" title="Supprimer">×</button>' +
    '</div>';
  }).join('') + '</div>';
}

function blocVariantes(p) {
  const vs = (p.variantes || []).slice()
    .sort(function (a, b) { return (a.libelle || '').localeCompare(b.libelle || ''); });

  const lignes = vs.map(function (v) {
    return '<div class="vrow">' +
      '<div class="champ lib"><label>Variante</label>' +
        '<input value="' + esc(v.libelle) + '" data-vlib="' + esc(v.id) + '"></div>' +
      '<div class="champ"><label>Prix (HTG)</label>' +
        '<input inputmode="decimal" value="' + esc(enGourdes(v.prix)) +
        '" placeholder="' + esc(enGourdes(p.prix)) + '" data-vprix="' + esc(v.id) + '"></div>' +
      '<div class="champ"><label>Stock</label>' +
        '<input class="num" type="number" min="0" value="' + (v.stock || 0) +
        '" data-vstock="' + esc(v.id) + '"></div>' +
      '<button class="sup" data-supvar="' + esc(v.id) + '" data-prod="' + esc(p.id) +
        '" aria-label="Supprimer la variante">×</button>' +
    '</div>';
  }).join('');

  return lignes +
    '<div class="vrow">' +
      '<div class="champ lib"><label>Nouvelle variante</label>' +
        '<input id="nv-lib-' + esc(p.id) + '" placeholder="100 ml, M, 42…"></div>' +
      '<div class="champ"><label>Prix (HTG)</label>' +
        '<input id="nv-prix-' + esc(p.id) + '" inputmode="decimal" placeholder="' +
        esc(enGourdes(p.prix)) + '"></div>' +
      '<div class="champ"><label>Stock</label>' +
        '<input id="nv-stock-' + esc(p.id) + '" class="num" type="number" min="0" value="1"></div>' +
    '</div>' +
    '<button class="mini" data-ajvar="' + esc(p.id) + '">Ajouter cette variante</button>' +
    '<p class="note">Prix laissé vide = celui du produit. Un cremas 100 ml et ' +
      'un 50 ml mettent chacun leur propre prix.</p>';
}

function formEdition(p) {
  return '<div class="edit">' +
    '<div class="champ"><label for="e-nom-' + esc(p.id) + '">Nom de l’article</label>' +
      '<input id="e-nom-' + esc(p.id) + '" value="' + esc(p.nom) + '"></div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="e-cat-' + esc(p.id) + '">Catégorie</label>' +
        '<select id="e-cat-' + esc(p.id) + '">' + optionsCategories(p.categorie) + '</select></div>' +
      '<div class="champ"><label for="e-prix-' + esc(p.id) + '">Prix de base (HTG)</label>' +
        '<input id="e-prix-' + esc(p.id) + '" inputmode="decimal" value="' +
        esc(enGourdes(p.prix)) + '"></div>' +
    '</div>' +
    '<div class="champ"><label for="e-desc-' + esc(p.id) + '">Description complète</label>' +
      '<textarea id="e-desc-' + esc(p.id) + '" rows="7">' + esc(p.description || '') + '</textarea></div>' +
    '<label class="coche"><input type="checkbox" id="e-pre-' + esc(p.id) + '"' +
      (p.prepaiement_exige ? ' checked' : '') + '>Prépaiement exigé</label>' +
    '<button class="cta" data-enregistrer="' + esc(p.id) + '">Enregistrer les corrections</button>' +
    '<button class="ghost" data-annuler="' + esc(p.id) + '">Annuler</button>' +
  '</div>';
}

function carteProduit(p) {
  const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
  const pub = p.statut === 'publie';
  const cat = categories.filter(function (c) { return c.code === p.categorie; })[0];
  const enEdition = produitEnEdition === p.id;
  const prix = API.fourchette({ prix: p.prix, variantes: p.variantes });

  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill ' + (pub ? 'ok' : (p.statut === 'suspendu' ? 'ko' : 'gris')) + '">' +
      esc(pub ? 'En vitrine' : (p.statut === 'suspendu' ? 'Suspendu' : 'Brouillon')) + '</span>' +
      (p.prepaiement_exige ? '<span class="pill warn">Prépaiement</span>' : '') +
    '</div>' +

    (enEdition ? formEdition(p) :
      '<div class="ligne"><span>Catégorie</span><strong>' +
        esc(cat ? cat.nom_fr : p.categorie) + '</strong></div>' +
      '<div class="ligne"><span>Prix</span><strong class="num">' +
        (prix.min === prix.max ? htg(prix.min) : htg(prix.min) + ' à ' + htg(prix.max)) +
        '</strong></div>' +
      '<div class="ligne"><span>Stock total</span><strong class="num">' + stock + '</strong></div>' +
      (p.description
        ? '<div class="note">' + esc(p.description) + '</div>'
        : '<div class="note">Pas de description. L’acheteur ne peut pas toucher ' +
          'l’article : le texte est tout ce qu’il a.</div>') +
      '<button class="mini" data-editer="' + esc(p.id) + '">Modifier l’article</button>'
    ) +

    blocMedias(p) +
    '<div class="champ"><label for="ph-' + esc(p.id) + '">Ajouter des photos ou une vidéo</label>' +
      '<input id="ph-' + esc(p.id) + '" type="file" multiple ' +
      'accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" ' +
      'data-photo="' + esc(p.id) + '"></div>' +
    '<div class="progres" id="prog-' + esc(p.id) + '"></div>' +

    blocVariantes(p) +

    '<div id="msg-' + esc(p.id) + '"></div>' +
    '<div class="rangee">' +
      (pub
        ? '<button class="ghost" data-depublier="' + esc(p.id) + '">Retirer de la vitrine</button>'
        : '<button class="cta" data-publier="' + esc(p.id) + '">Publier</button>') +
    '</div>' +
    '<div class="danger"><button class="ghost" data-supprod="' + esc(p.id) + '">' +
      'Supprimer cet article</button></div>' +
  '</div>';
}

async function rendreCatalogue() {
  const p = el('panneau');
  const verifiees = boutiques.filter(function (b) { return b.statut === 'verifiee'; });
  const actives = categories.filter(function (c) { return c.actif; });

  if (!verifiees.length) {
    p.innerHTML = '<div class="sechead"><h2>Catalogue</h2></div>' +
      '<p class="empty">Aucune boutique vérifiée. Crée et vérifie un vendeur ' +
      'dans l’onglet Boutiques avant de saisir des produits.</p>';
    return;
  }
  if (!actives.length) {
    p.innerHTML = '<div class="sechead"><h2>Catalogue</h2></div>' +
      '<p class="empty">Aucune catégorie active. Ajoute-en une dans l’onglet Catégories.</p>';
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
        '<div class="titreligne"><h2>Nouvel article</h2></div>' +
        '<div class="champ"><label for="pNom">Nom de l’article</label>' +
          '<input id="pNom" placeholder="Cremas maison"></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="pCat">Catégorie</label><select id="pCat">' +
            optionsCategories(null) + '</select></div>' +
          '<div class="champ"><label for="pPrix">Prix de base (HTG)</label>' +
            '<input id="pPrix" inputmode="decimal" placeholder="750"></div>' +
        '</div>' +
        '<div class="champ"><label for="pDesc">Description complète</label>' +
          '<textarea id="pDesc" rows="7" placeholder="Tout ce que l’acheteur ne peut pas voir : ' +
            'contenance, ingrédients, matière, taille réelle, état, durée de conservation, ' +
            'ce qui est inclus…"></textarea></div>' +
        '<label class="coche"><input type="checkbox" id="pPrepaie">' +
          'Prépaiement exigé (gros montant, le vendeur assume)</label>' +
        '<div id="newProdErr"></div>' +
        '<button class="cta" id="creerProduit">Créer en brouillon</button>' +
        '<p class="note">L’article naît en brouillon. Tu ajoutes ensuite ses variantes, ' +
          'ses photos, et tu publies quand c’est prêt. Tout reste modifiable.</p>' +
      '</div>' +
    '</div>' +
    '<div class="sechead"><h2 style="font-size:14px">Articles de cette boutique</h2>' +
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
      : '<p class="empty">Aucun article. Crée le premier ci-dessus.</p>';
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
      (st !== 'verifiee' ? '<button class="mini" data-verifier="' + esc(b.id) + '">' +
        (st === 'suspendue' ? 'Réactiver' : 'Vérifier') + '</button>' : '') +
      (st === 'verifiee' ? '<button class="mini" data-suspendre="' + esc(b.id) + '">Suspendre</button>' : '') +
    '</div>' +
    (st === 'en_attente'
      ? '<p class="note">Vérifie la patente et la pièce d’identité avant de ' +
        'passer en vitrine. C’est ce qui tient la confiance de la plateforme.</p>' : '') +
  '</div>';
}

async function rendreBoutiques() {
  el('panneau').innerHTML =
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
          '<textarea id="bDesc" rows="4"></textarea></div>' +
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

/* ---------- Onglet Catégories ---------------------------- */

function carteCategorie(c) {
  const n = produits.filter(function (p) { return p.categorie === c.code; }).length;
  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(c.nom_fr) + '</h2>' +
      '<span class="pill ' + (c.actif ? 'ok' : 'gris') + '">' +
      esc(c.actif ? 'Active' : 'Désactivée') + '</span></div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="c-fr-' + esc(c.code) + '">Nom en français</label>' +
        '<input id="c-fr-' + esc(c.code) + '" value="' + esc(c.nom_fr) + '"></div>' +
      '<div class="champ"><label for="c-ht-' + esc(c.code) + '">Nom en créole</label>' +
        '<input id="c-ht-' + esc(c.code) + '" value="' + esc(c.nom_ht) + '"></div>' +
      '<div class="champ"><label for="c-ord-' + esc(c.code) + '">Ordre</label>' +
        '<input id="c-ord-' + esc(c.code) + '" class="num" type="number" value="' +
        (c.ordre || 0) + '"></div>' +
    '</div>' +
    '<div class="ligne"><span>Code interne</span><span class="num">' + esc(c.code) + '</span></div>' +
    '<div id="msg-cat-' + esc(c.code) + '"></div>' +
    '<div class="rangee">' +
      '<button class="mini" data-majcat="' + esc(c.code) + '">Enregistrer</button>' +
      '<button class="mini" data-basculecat="' + esc(c.code) + '" data-actif="' +
        (c.actif ? '0' : '1') + '">' + (c.actif ? 'Désactiver' : 'Réactiver') + '</button>' +
    '</div>' +
  '</div>';
}

async function rendreCategories() {
  el('panneau').innerHTML =
    '<div class="sechead"><h2>Catégories</h2><span class="eyebrow num">' +
      (categories.length || '') + '</span></div>' +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="titreligne"><h2>Nouvelle catégorie</h2></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="cNomFr">Nom en français</label>' +
            '<input id="cNomFr" placeholder="Agroalimentaire"></div>' +
          '<div class="champ"><label for="cNomHt">Nom en créole</label>' +
            '<input id="cNomHt" placeholder="Manje"></div>' +
        '</div>' +
        '<div class="champ"><label for="cOrdre">Ordre d’affichage</label>' +
          '<input id="cOrdre" class="num" type="number" value="9"></div>' +
        '<div id="newCatErr"></div>' +
        '<button class="cta" id="creerCategorie">Ajouter la catégorie</button>' +
        '<p class="note">Elle apparaît aussitôt dans l’app des acheteurs, sans ' +
          'rien toucher au code. Laisse le créole vide si tu ne l’as pas encore : ' +
          'le nom français sera repris.</p>' +
      '</div>' +
    '</div>' +
    '<div class="pile">' +
      (categories.length ? categories.map(carteCategorie).join('')
        : '<p class="empty">Aucune catégorie.</p>') +
    '</div>' +
    '<p class="note">Une catégorie ne se supprime pas : des articles y sont ' +
      'rattachés et leur historique de vente aussi. La désactiver la retire de ' +
      'l’app sans rien casser.</p>';
}

/* ---------- Navigation ----------------------------------- */

async function rendre() {
  Array.prototype.forEach.call(document.querySelectorAll('.ong'), function (b) {
    b.setAttribute('aria-selected', b.getAttribute('data-ong') === ongletActif);
  });
  if (ongletActif === 'comptoir') await rendreComptoir();
  if (ongletActif === 'catalogue') await rendreCatalogue();
  if (ongletActif === 'boutiques') await rendreBoutiques();
  if (ongletActif === 'categories') await rendreCategories();
}

async function rechargerBase() {
  const r = await Promise.all([
    ADMIN.toutesBoutiques().catch(function () { return []; }),
    ADMIN.plans().catch(function () { return []; }),
    ADMIN.toutesCategories().catch(function () { return []; })
  ]);
  boutiques = r[0];
  lesPlans = r[1];
  categories = r[2];
}

function montrer(vue) {
  ['login', 'refus', 'app'].forEach(function (v) { el('vue-' + v).hidden = (v !== vue); });
  el('sortir').hidden = (vue !== 'app');
}

/* ---------- Événements : clics ---------------------------- */

document.addEventListener('click', async function (ev) {
  const c = ev.target.closest ? ev.target.closest('button') : null;
  const t = ev.target;

  if (t.id === 'entrer') {
    await agir(t, 'loginErr', function () {
      return ADMIN.connexion(val('email'), el('mdp').value);
    }, demarrerSession);
    return;
  }
  if (t.id === 'sortir' || t.id === 'refusSortir') {
    await ADMIN.deconnexion();
    location.reload();
    return;
  }
  if (!c) return;

  if (c.classList.contains('ong')) {
    ongletActif = c.getAttribute('data-ong');
    produitEnEdition = null;
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
      function (r) {
        msg('msg-' + id, 'Encaissé ' + htg(r.total) +
          (r.en_retard ? ' (retrait en retard)' : '') + '. Colis remis.', 'ok');
        setTimeout(rendreComptoir, 1400);
      });
    return;
  }
  if (c.hasAttribute('data-abandon')) {
    const id = c.getAttribute('data-abandon');
    // Deux appuis : l'abandon remet le stock et compte contre le client.
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer l’annulation';
      msg('msg-' + id, 'Les articles retournent en stock et un abandon est compté ' +
        'au client. Appuie encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return ADMIN.marquerAbandon(id, 'Non retiré'); },
      function (n) {
        msg('msg-' + id, 'Annulée. Ce client totalise ' + n + ' abandon(s).', 'ok');
        setTimeout(rendreComptoir, 1400);
      });
    return;
  }

  /* --- Catalogue : création --- */
  if (c.id === 'creerProduit') {
    const nom = val('pNom');
    const prix = enCentimes(val('pPrix'));
    if (!nom) { msg('newProdErr', 'Donne un nom à l’article.', 'ko'); return; }
    if (prix <= 0) { msg('newProdErr', 'Indique un prix de base en gourdes.', 'ko'); return; }
    await agir(c, 'newProdErr', function () {
      return ADMIN.creerProduit({
        boutique: boutiqueOuverte, categorie: el('pCat').value,
        nom: nom, prix: prix, description: val('pDesc'),
        prepaiement_exige: el('pPrepaie').checked
      });
    }, async function () {
      el('pNom').value = ''; el('pPrix').value = ''; el('pDesc').value = '';
      el('pPrepaie').checked = false;
      await rechargerProduits();
    });
    return;
  }

  /* --- Catalogue : modification --- */
  if (c.hasAttribute('data-editer')) {
    produitEnEdition = c.getAttribute('data-editer');
    await rechargerProduits();
    return;
  }
  if (c.hasAttribute('data-annuler')) {
    produitEnEdition = null;
    await rechargerProduits();
    return;
  }
  if (c.hasAttribute('data-enregistrer')) {
    const id = c.getAttribute('data-enregistrer');
    const nom = val('e-nom-' + id);
    const prix = enCentimes(val('e-prix-' + id));
    if (!nom) { msg('msg-' + id, 'Le nom ne peut pas être vide.', 'ko'); return; }
    if (prix <= 0) { msg('msg-' + id, 'Le prix de base doit être supérieur à zéro.', 'ko'); return; }
    await agir(c, 'msg-' + id, function () {
      return ADMIN.majProduit(id, {
        nom: nom, prix: prix,
        categorie: el('e-cat-' + id).value,
        description: val('e-desc-' + id) || null,
        prepaiement_exige: el('e-pre-' + id).checked
      });
    }, async function () { produitEnEdition = null; await rechargerProduits(); });
    return;
  }

  /* --- Catalogue : variantes --- */
  if (c.hasAttribute('data-ajvar')) {
    const id = c.getAttribute('data-ajvar');
    const lib = val('nv-lib-' + id);
    const prix = enCentimes(val('nv-prix-' + id));
    const st = val('nv-stock-' + id);
    await agir(c, 'msg-' + id, function () {
      return ADMIN.ajouterVariante(id, lib, prix, st);
    }, rechargerProduits);
    return;
  }
  if (c.hasAttribute('data-supvar')) {
    const vid = c.getAttribute('data-supvar');
    const pid = c.getAttribute('data-prod');
    await agir(c, 'msg-' + pid, function () { return ADMIN.supprimerVariante(vid); },
      rechargerProduits);
    return;
  }

  /* --- Catalogue : médias --- */
  if (c.hasAttribute('data-supmedia')) {
    const mid = c.getAttribute('data-supmedia');
    const pid = c.getAttribute('data-prod');
    const prod = produits.filter(function (p) { return p.id === pid; })[0];
    const m = prod && (prod.medias || []).filter(function (x) { return x.id === mid; })[0];
    if (!m) return;
    await agir(c, 'msg-' + pid, function () { return ADMIN.supprimerMedia(m); },
      rechargerProduits);
    return;
  }

  /* --- Catalogue : publication et suppression --- */
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
  if (c.hasAttribute('data-supprod')) {
    const id = c.getAttribute('data-supprod');
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer la suppression';
      msg('msg-' + id, 'L’article, ses variantes et ses médias seront supprimés. ' +
        'Appuie encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return ADMIN.supprimerProduit(id); },
      async function () { produitEnEdition = null; await rechargerProduits(); });
    return;
  }

  /* --- Boutiques --- */
  if (c.id === 'creerBoutique') {
    const nom = val('bNom');
    const commune = val('bCommune');
    if (!nom || !commune) { msg('newShopErr', 'Le nom et la commune sont nécessaires.', 'ko'); return; }
    await agir(c, 'newShopErr', function () {
      return ADMIN.creerBoutique({
        nom: nom, commune: commune,
        adresse_repere: val('bRepere'), description: val('bDesc')
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

  /* --- Catégories --- */
  if (c.id === 'creerCategorie') {
    const fr = val('cNomFr');
    if (!fr) { msg('newCatErr', 'Donne un nom à la catégorie.', 'ko'); return; }
    await agir(c, 'newCatErr', function () {
      return ADMIN.creerCategorie({ nom_fr: fr, nom_ht: val('cNomHt'), ordre: val('cOrdre') });
    }, async function () {
      el('cNomFr').value = ''; el('cNomHt').value = '';
      await rechargerBase();
      await rendreCategories();
    });
    return;
  }
  if (c.hasAttribute('data-majcat')) {
    const code = c.getAttribute('data-majcat');
    const fr = val('c-fr-' + code);
    if (!fr) { msg('msg-cat-' + code, 'Le nom français ne peut pas être vide.', 'ko'); return; }
    await agir(c, 'msg-cat-' + code, function () {
      return ADMIN.majCategorie(code, {
        nom_fr: fr,
        nom_ht: val('c-ht-' + code) || fr,
        ordre: parseInt(val('c-ord-' + code), 10) || 0
      });
    }, async function () {
      msg('msg-cat-' + code, 'Enregistré.', 'ok');
      await rechargerBase();
    });
    return;
  }
  if (c.hasAttribute('data-basculecat')) {
    const code = c.getAttribute('data-basculecat');
    const actif = c.getAttribute('data-actif') === '1';
    await agir(c, 'msg-cat-' + code, function () { return ADMIN.basculerCategorie(code, actif); },
      async function () { await rechargerBase(); await rendreCategories(); });
    return;
  }
});

/* ---------- Événements : champs --------------------------- */

document.addEventListener('change', async function (ev) {
  const c = ev.target;

  if (c.id === 'selBoutique') {
    boutiqueOuverte = c.value;
    produitEnEdition = null;
    await rechargerProduits();
    return;
  }
  if (c.hasAttribute('data-plan')) {
    const id = c.getAttribute('data-plan');
    if (!c.value) return;
    await agir(null, 'msg-' + id, function () { return ADMIN.definirPlan(id, c.value); },
      async function () { msg('msg-' + id, 'Plan enregistré.', 'ok'); await rechargerBase(); });
    return;
  }

  // Variantes : on enregistre au fil de la saisie, sans bouton.
  if (c.hasAttribute('data-vstock')) {
    await agir(null, null, function () {
      return ADMIN.majVariante(c.getAttribute('data-vstock'),
        { stock: Math.max(0, parseInt(c.value, 10) || 0) });
    });
    return;
  }
  if (c.hasAttribute('data-vlib')) {
    const lib = c.value.trim();
    if (!lib) return;
    await agir(null, null, function () {
      return ADMIN.majVariante(c.getAttribute('data-vlib'), { libelle: lib });
    });
    return;
  }
  if (c.hasAttribute('data-vprix')) {
    const cts = enCentimes(c.value);
    await agir(null, null, function () {
      return ADMIN.majVariante(c.getAttribute('data-vprix'), { prix: cts > 0 ? cts : null });
    });
    return;
  }

  /* --- Médias : plusieurs fichiers, un par un --- */
  if (c.hasAttribute('data-photo')) {
    const id = c.getAttribute('data-photo');
    const fichiers = Array.prototype.slice.call(c.files || []);
    if (!fichiers.length) return;

    const prod = produits.filter(function (p) { return p.id === id; })[0] || { medias: [] };
    const dejaImg = (prod.medias || []).filter(function (m) { return (m.type || 'image') === 'image'; }).length;
    const dejaVid = (prod.medias || []).filter(function (m) { return m.type === 'video'; }).length;
    const prog = el('prog-' + id);

    msg('msg-' + id, '');
    await agir(null, 'msg-' + id, function () {
      return ADMIN.televerserPlusieurs(id, fichiers, dejaImg, dejaVid,
        function (i, total, nom) {
          if (prog) prog.textContent = 'Envoi ' + i + ' sur ' + total + ' — ' + nom;
        });
    }, async function (r) {
      if (prog) prog.textContent = '';
      c.value = '';
      if (r.erreurs.length) {
        msg('msg-' + id, (r.envoyes ? r.envoyes + ' envoyé(s). ' : '') +
          r.erreurs.join(' · '), 'ko');
      } else {
        msg('msg-' + id, r.envoyes + ' média(s) ajouté(s).', 'ok');
      }
      await rechargerProduits();
    });
    return;
  }
});

// Entrée dans les champs de connexion = se connecter.
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
  try {
    const { data } = await API.sb().auth.getSession();
    if (data && data.session && !data.session.user.is_anonymous) {
      await demarrerSession();
      return;
    }
  } catch (e) {}
  montrer('login');
})();
