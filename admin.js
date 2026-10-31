/* ============================================================
   Boutique Lakay — administration

   L'accès complet : boutiques, catalogue, catégories, livraison,
   règlements, comptes. C'est ici que se décident les choses qui
   engagent de l'argent ou la confiance — un tarif, une commission,
   un règlement de vendeur, un rôle.

   Le comptoir a son propre écran (agent.html) et le vendeur le
   sien (vendeur.html). Un administrateur peut les ouvrir aussi,
   pour voir ce qu'ils voient quand il les aide au téléphone.
   ============================================================ */

let ongletActif = 'tableau';
let boutiques = [];
let lesPlans = [];
let categories = [];          // toutes, actives et inactives
let boutiqueOuverte = null;
let produits = [];
let produitEnEdition = null;
let boutiqueEnEdition = null;
let ficheBoutique = null;     // boutique ouverte en fiche détaillée
let points = [];
let communes = [];
let aRegler = [];
let lesSoldes = [];
let comptes = [];
let aRevisers = [];

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
  const noms = Object.keys(p.declinaisons || {});
  const vs = (p.variantes || []).slice().sort(function (a, b) {
    return (a.libelle || '').localeCompare(b.libelle || '');
  });

  const lignes = vs.map(function (v) {
    const att = v.attributs || {};
    const titre = noms.length
      ? noms.map(function (k) { return esc(att[k] || '\u2014'); }).join(' \u00b7 ')
      : esc(v.libelle);
    return '<div class="vrow">' +
      '<div class="champ lib"><label>' + titre + '</label>' +
        '<input class="num" type="number" min="0" value="' + (v.stock || 0) +
        '" data-vstock="' + esc(v.id) + '"></div>' +
      '<div class="champ"><label>Prix (HTG)</label>' +
        '<input inputmode="decimal" value="' + esc(enGourdes(v.prix)) +
        '" placeholder="' + esc(enGourdes(p.prix)) + '" data-vprix="' + esc(v.id) + '"></div>' +
      '<button class="sup" data-supvar="' + esc(v.id) + '" data-prod="' + esc(p.id) +
        '" aria-label="Supprimer">\u00d7</button>' +
    '</div>';
  }).join('');

  // L'administration garde la main même sur une fiche publiée : c'est
  // elle qui corrige une variante mal saisie par un vendeur.
  return blocDeclinaisons(p, {}) +
    (vs.length
      ? '<div class="sechead"><h2 style="font-size:13px">Stock par variante</h2></div>' + lignes
      : '<p class="note">Aucune variante.</p>') +
    (noms.length ? '' :
      '<div class="vrow">' +
        '<div class="champ lib"><label for="nv-stock-' + esc(p.id) + '">' +
          (vs.length ? 'Ajouter une autre variante' : 'Quantité en stock') + '</label>' +
          '<input id="nv-stock-' + esc(p.id) + '" class="num" type="number" min="0" value="1"></div>' +
        '<button class="mini" data-ajsimple="' + esc(p.id) + '">Enregistrer</button>' +
      '</div>');
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
    champFichier('ph-' + p.id, 'Ajouter des photos ou une vidéo', {
      accept: 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm',
      multiple: true, bouton: 'Choisir', vide: 'Photos ou vidéo',
      data: 'data-photo="' + esc(p.id) + '"'
    }) +
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
    produits = await OPS.produitsBoutique(boutiqueOuverte);
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

function formBoutique(b) {
  return '<div class="edit">' +
    '<div class="champ"><label for="b-nom-' + esc(b.id) + '">Nom de la boutique</label>' +
      '<input id="b-nom-' + esc(b.id) + '" value="' + esc(b.nom) + '"></div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="b-com-' + esc(b.id) + '">Commune</label>' +
        '<input id="b-com-' + esc(b.id) + '" value="' + esc(b.commune) + '"></div>' +
      '<div class="champ"><label for="b-rep-' + esc(b.id) + '">Point de repère</label>' +
        '<input id="b-rep-' + esc(b.id) + '" value="' + esc(b.adresse_repere || '') + '"></div>' +
    '</div>' +
    '<div class="champ"><label for="b-desc-' + esc(b.id) + '">Description</label>' +
      '<textarea id="b-desc-' + esc(b.id) + '" rows="5">' + esc(b.description || '') + '</textarea></div>' +
    '<p class="note">La commune n\u2019est pas qu\u2019une indication : c\u2019est elle qui ' +
      'décide du tarif de livraison depuis cette boutique.</p>' +
    '<button class="cta" data-bsave="' + esc(b.id) + '">Enregistrer</button>' +
    '<button class="ghost" data-bannuler="' + esc(b.id) + '">Annuler</button>' +
  '</div>';
}

function carteBoutique(b) {
  const st = b.statut;
  const plan = planActif(b);
  const enEdition = boutiqueEnEdition === b.id;
  return '<div class="bloc">' +
    '<div class="titreligne">' +
      (ficheBoutique === b.id
        ? '<h2>' + esc(b.nom) + '</h2>'
        : '<button class="titrelien" data-fiche="' + esc(b.id) + '">' + esc(b.nom) + ' →</button>') +
      '<span class="pill ' + (st === 'verifiee' ? 'ok' : (st === 'suspendue' ? 'ko' : 'warn')) + '">' +
      esc(st === 'verifiee' ? 'Vérifiée' : (st === 'suspendue' ? 'Suspendue' : 'En attente')) +
      '</span></div>' +
    (enEdition ? formBoutique(b) :
      '<div class="ligne"><span>Commune</span><strong>' + esc(b.commune) + '</strong></div>' +
      (b.adresse_repere ? '<div class="ligne"><span>Repère</span><span>' +
        esc(b.adresse_repere) + '</span></div>' : '') +
      (b.description ? '<div class="note">' + esc(b.description) + '</div>' : '') +
      '<button class="mini" data-bediter="' + esc(b.id) + '">Modifier la boutique</button>'
    ) +
    '<div class="champ"><label for="plan-' + esc(b.id) + '">Plan</label>' +
      '<select id="plan-' + esc(b.id) + '" data-plan="' + esc(b.id) + '">' +
        '<option value="">— aucun —</option>' +
        lesPlans.map(function (p) {
          return '<option value="' + esc(p.code) + '"' + (plan === p.code ? ' selected' : '') + '>' +
            esc(p.nom) + ' — ' + (p.commission_bps / 100) + ' % de commission</option>';
        }).join('') + '</select></div>' +
    // Sans plan, c'est le tarif du plan gratuit qui s'applique en silence.
    // Mieux vaut le dire que de le laisser découvrir au premier règlement.
    (!plan
      ? '<p class="note" style="color:var(--warn)">Aucun plan : la commission du ' +
        'plan gratuit s’appliquera (' + (tauxGratuit() / 100) + ' %).</p>' : '') +

    '<div class="pieces">' +
      (b.piece_identite_url
        ? '<button class="mini" data-doc="' + esc(b.piece_identite_url) + '">' +
          'Voir la pièce d’identité</button>'
        : '<span class="pill gris">Pièce d’identité manquante</span>') +
      (b.patente_url
        ? '<button class="mini" data-doc="' + esc(b.patente_url) + '">Voir la patente</button>'
        : '<span class="pill gris">Patente manquante</span>') +
    '</div>' +

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

function tauxGratuit() {
  const g = lesPlans.filter(function (p) { return p.code === 'gratuit'; })[0];
  return g ? g.commission_bps : 1200;
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


/* ---------- Onglet Livraison -----------------------------
   Points de retrait et tarifs. Le tarif dépend du couple
   (commune du vendeur, point de retrait) : un achat au Cap
   livré au Cap ne coûte pas ce que coûte un colis venu de
   Ouanaminthe. Sans ça, soit tu surfactures le local, soit
   tu perds de l'argent sur les longues distances.          */

function cartePoint(p) {
  const tarifs = (p.tarifs || []).slice()
    .sort(function (a, b) { return a.commune_origine.localeCompare(b.commune_origine); });
  const dejaFixees = tarifs.map(function (t) { return t.commune_origine.toLowerCase(); });
  const restantes = communes.filter(function (c) {
    return dejaFixees.indexOf(c.toLowerCase()) === -1;
  });

  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill ' + (p.actif ? 'ok' : 'gris') + '">' +
      esc(p.actif ? 'Actif' : 'Désactivé') + '</span></div>' +

    '<div class="champ"><label for="p-nom-' + esc(p.id) + '">Nom</label>' +
      '<input id="p-nom-' + esc(p.id) + '" value="' + esc(p.nom) + '"></div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="p-dep-' + esc(p.id) + '">Département</label>' +
        '<select id="p-dep-' + esc(p.id) + '">' +
        optionsDepartements(p.departement || departementDe(p.commune)) + '</select></div>' +
      '<div class="champ"><label for="p-com-' + esc(p.id) + '">Commune</label>' +
        '<select id="p-com-' + esc(p.id) + '">' +
        optionsCommunes(p.departement || departementDe(p.commune), p.commune) + '</select></div>' +
    '</div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="p-rep-' + esc(p.id) + '">Point de repère</label>' +
        '<input id="p-rep-' + esc(p.id) + '" value="' + esc(p.repere) + '"></div>' +
      '<div class="champ"><label for="p-tel-' + esc(p.id) + '">Téléphone</label>' +
        '<input id="p-tel-' + esc(p.id) + '" type="tel" value="' + esc(p.telephone || '') + '"></div>' +
    '</div>' +
    '<div class="champ"><label for="p-frais-' + esc(p.id) + '">Tarif de base (HTG)</label>' +
      '<input id="p-frais-' + esc(p.id) + '" inputmode="decimal" value="' +
      esc(enGourdes(p.frais)) + '"></div>' +
    '<p class="note">Appliqué à toute commune sans tarif particulier ci-dessous.</p>' +

    '<div class="sechead"><h2 style="font-size:13px">Tarifs par commune d\u2019origine</h2></div>' +
    (tarifs.length ? tarifs.map(function (t) {
      return '<div class="vrow">' +
        '<div class="champ lib"><label>Depuis</label>' +
          '<input value="' + esc(t.commune_origine) + '" data-tcom="' + esc(t.id) + '"></div>' +
        '<div class="champ"><label>Tarif (HTG)</label>' +
          '<input inputmode="decimal" value="' + esc(enGourdes(t.frais)) +
          '" data-tfrais="' + esc(t.id) + '"></div>' +
        '<button class="sup" data-tsup="' + esc(t.id) + '" aria-label="Supprimer ce tarif">\u00d7</button>' +
      '</div>';
    }).join('') : '<p class="note">Aucun tarif particulier : tout part au tarif de base.</p>') +

    '<div class="vrow">' +
      '<div class="champ lib"><label>Nouvelle commune d\u2019origine</label>' +
        (restantes.length
          ? '<select id="nt-com-' + esc(p.id) + '">' +
            restantes.map(function (c) {
              return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
            }).join('') + '</select>'
          : '<input id="nt-com-' + esc(p.id) + '" placeholder="Nom de la commune">') +
      '</div>' +
      '<div class="champ"><label>Tarif (HTG)</label>' +
        '<input id="nt-frais-' + esc(p.id) + '" inputmode="decimal" placeholder="' +
        esc(enGourdes(p.frais)) + '"></div>' +
    '</div>' +
    '<button class="mini" data-tajout="' + esc(p.id) + '">Ajouter ce tarif</button>' +

    '<div id="msg-pt-' + esc(p.id) + '"></div>' +
    '<div class="rangee">' +
      '<button class="mini" data-psave="' + esc(p.id) + '">Enregistrer le point</button>' +
      '<button class="mini" data-pbascule="' + esc(p.id) + '" data-actif="' +
        (p.actif ? '0' : '1') + '">' + (p.actif ? 'Désactiver' : 'Réactiver') + '</button>' +
    '</div>' +
    '<div class="danger"><button class="ghost" data-psup="' + esc(p.id) + '">' +
      'Supprimer ce point</button></div>' +
  '</div>';
}

async function rendreLivraison() {
  el('panneau').innerHTML =
    '<div class="sechead"><h2>Livraison</h2><span class="eyebrow num">' +
      (points.length || '') + '</span></div>' +
    '<p class="note">Le tarif facturé à l\u2019acheteur dépend de la commune du vendeur ' +
      'et du point de retrait choisi. Une commande à plusieurs boutiques paie un ' +
      'trajet par boutique : chacune part d\u2019un endroit différent.</p>' +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="titreligne"><h2>Nouveau point de retrait</h2></div>' +
        '<div class="champ"><label for="ptNom">Nom</label>' +
          '<input id="ptNom" placeholder="Flashipping Limbé"></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="ptDep">Département</label>' +
            '<select id="ptDep">' + optionsDepartements(null) + '</select></div>' +
          '<div class="champ"><label for="ptCommune">Commune</label>' +
            '<select id="ptCommune">' + optionsCommunes(null, null) + '</select></div>' +
        '</div>' +
        '<div class="champ"><label for="ptFrais">Tarif de base (HTG)</label>' +
          '<input id="ptFrais" inputmode="decimal" placeholder="250"></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="ptRepere">Point de repère</label>' +
            '<input id="ptRepere" placeholder="Place publique"></div>' +
          '<div class="champ"><label for="ptTel">Téléphone</label>' +
            '<input id="ptTel" type="tel"></div>' +
        '</div>' +
        '<div id="newPtErr"></div>' +
        '<button class="cta" id="creerPoint">Ajouter le point</button>' +
      '</div>' +
    '</div>' +
    '<div class="pile">' +
      (points.length ? points.map(cartePoint).join('')
        : '<p class="empty">Aucun point de retrait.</p>') +
    '</div>';

  // Les listes département/commune se répondent, ici comme ailleurs.
  lierDepartementCommune('ptDep', 'ptCommune');
  points.forEach(function (p) {
    lierDepartementCommune('p-dep-' + p.id, 'p-com-' + p.id);
  });
}

/* ---------- Événements : clics ---------------------------- */

document.addEventListener('click', async function (ev) {
  const c = ev.target.closest ? ev.target.closest('button') : null;
  if (!c) return;

  /* --- Catalogue : création --- */
  if (c.id === 'creerProduit') {
    const nom = val('pNom');
    const prix = enCentimes(val('pPrix'));
    if (!nom) { msg('newProdErr', 'Donne un nom à l’article.', 'ko'); return; }
    if (prix <= 0) { msg('newProdErr', 'Indique un prix de base en gourdes.', 'ko'); return; }
    await agir(c, 'newProdErr', function () {
      return OPS.creerProduit({
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
      return OPS.majProduit(id, {
        nom: nom, prix: prix,
        categorie: el('e-cat-' + id).value,
        description: val('e-desc-' + id) || null,
        prepaiement_exige: el('e-pre-' + id).checked
      });
    }, async function () { produitEnEdition = null; await rechargerProduits(); });
    return;
  }

  /* --- Catalogue : variantes --- */
  if (c.hasAttribute('data-ajsimple')) {
    const id = c.getAttribute('data-ajsimple');
    const p = produits.filter(function (x) { return x.id === id; })[0] ||
              aRevisers.filter(function (x) { return x.id === id; })[0];
    const n = ((p && p.variantes) || []).length;
    const nom = n ? 'Lot ' + (n + 1) : 'Standard';
    await agir(c, 'msg-' + id, function () {
      return OPS.ajouterVariante(id, nom, 0, val('nv-stock-' + id), {});
    }, async function () {
      if (ongletActif === 'revision') await rendreRevision();
      else await rechargerProduits();
    });
    return;
  }
  if (c.hasAttribute('data-supvar')) {
    const vid = c.getAttribute('data-supvar');
    const pid = c.getAttribute('data-prod');
    await agir(c, 'msg-' + pid, function () { return OPS.supprimerVariante(vid); },
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
    await agir(c, 'msg-' + pid, function () { return OPS.supprimerMedia(m); },
      rechargerProduits);
    return;
  }

  /* --- Catalogue : publication et suppression --- */
  if (c.hasAttribute('data-publier')) {
    const id = c.getAttribute('data-publier');
    await agir(c, 'msg-' + id, function () { return OPS.publier(id); }, rechargerProduits);
    return;
  }
  if (c.hasAttribute('data-depublier')) {
    const id = c.getAttribute('data-depublier');
    await agir(c, 'msg-' + id, function () { return OPS.depublier(id); }, rechargerProduits);
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
    await agir(c, 'msg-' + id, function () { return OPS.supprimerProduit(id); },
      async function () { produitEnEdition = null; await rechargerProduits(); });
    return;
  }


  /* --- Boutiques : correction --- */
  if (c.hasAttribute('data-bediter')) {
    boutiqueEnEdition = c.getAttribute('data-bediter');
    await rendreBoutiques();
    return;
  }
  if (c.hasAttribute('data-bannuler')) {
    boutiqueEnEdition = null;
    await rendreBoutiques();
    return;
  }
  if (c.hasAttribute('data-bsave')) {
    const id = c.getAttribute('data-bsave');
    const nom = val('b-nom-' + id);
    const com = val('b-com-' + id);
    if (!nom || !com) { msg('msg-' + id, 'Le nom et la commune sont nécessaires.', 'ko'); return; }
    await agir(c, 'msg-' + id, function () {
      return OPS.majBoutique(id, {
        nom: nom, commune: com,
        adresse_repere: val('b-rep-' + id) || null,
        description: val('b-desc-' + id) || null
      });
    }, async function () {
      boutiqueEnEdition = null;
      await rechargerBase();
      await rendreBoutiques();
    });
    return;
  }

  /* --- Livraison : points de retrait --- */
  if (c.id === 'creerPoint') {
    const nom = val('ptNom'), com = val('ptCommune'), rep = val('ptRepere');
    const frais = enCentimes(val('ptFrais'));
    if (!nom || !com || !rep) {
      msg('newPtErr', 'Nom, commune et point de repère sont nécessaires.', 'ko'); return;
    }
    if (frais < 0) { msg('newPtErr', 'Tarif invalide.', 'ko'); return; }
    await agir(c, 'newPtErr', function () {
      return OPS.creerPoint({ nom: nom, departement: val('ptDep'), commune: com, repere: rep,
        telephone: val('ptTel'), frais: frais || 25000 });
    }, async function () {
      ['ptNom','ptCommune','ptRepere','ptTel','ptFrais'].forEach(function (k) {
        if (el(k)) el(k).value = '';
      });
      await rechargerBase();
      await rendreLivraison();
    });
    return;
  }
  if (c.hasAttribute('data-psave')) {
    const id = c.getAttribute('data-psave');
    const nom = val('p-nom-' + id), com = val('p-com-' + id), rep = val('p-rep-' + id);
    if (!nom || !com || !rep) {
      msg('msg-pt-' + id, 'Nom, commune et repère sont nécessaires.', 'ko'); return;
    }
    await agir(c, 'msg-pt-' + id, function () {
      return OPS.majPoint(id, { nom: nom, departement: val('p-dep-' + id), commune: com, repere: rep,
        telephone: val('p-tel-' + id) || null,
        frais: Math.max(0, enCentimes(val('p-frais-' + id))) });
    }, async function () {
      msg('msg-pt-' + id, 'Enregistré.', 'ok');
      await rechargerBase();
    });
    return;
  }
  if (c.hasAttribute('data-pbascule')) {
    const id = c.getAttribute('data-pbascule');
    const actif = c.getAttribute('data-actif') === '1';
    await agir(c, 'msg-pt-' + id, function () { return OPS.majPoint(id, { actif: actif }); },
      async function () { await rechargerBase(); await rendreLivraison(); });
    return;
  }
  if (c.hasAttribute('data-psup')) {
    const id = c.getAttribute('data-psup');
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer la suppression';
      msg('msg-pt-' + id, 'Le point et ses tarifs seront supprimés. Appuie encore.', 'ko');
      return;
    }
    await agir(c, 'msg-pt-' + id, function () { return OPS.supprimerPoint(id); },
      async function () { await rechargerBase(); await rendreLivraison(); });
    return;
  }

  /* --- Livraison : tarifs par commune --- */
  if (c.hasAttribute('data-tajout')) {
    const pid = c.getAttribute('data-tajout');
    const com = val('nt-com-' + pid);
    const frais = enCentimes(val('nt-frais-' + pid));
    if (!com) { msg('msg-pt-' + pid, 'Indique la commune d\u2019origine.', 'ko'); return; }
    if (frais < 0) { msg('msg-pt-' + pid, 'Tarif invalide.', 'ko'); return; }
    await agir(c, 'msg-pt-' + pid, function () {
      return OPS.creerTarif(pid, com, frais);
    }, async function () { await rechargerBase(); await rendreLivraison(); });
    return;
  }
  if (c.hasAttribute('data-tsup')) {
    const tid = c.getAttribute('data-tsup');
    await agir(c, null, function () { return OPS.supprimerTarif(tid); },
      async function () { await rechargerBase(); await rendreLivraison(); });
    return;
  }

  /* --- Boutiques --- */
  if (c.id === 'creerBoutique') {
    const nom = val('bNom');
    const commune = val('bCommune');
    if (!nom || !commune) { msg('newShopErr', 'Le nom et la commune sont nécessaires.', 'ko'); return; }
    await agir(c, 'newShopErr', function () {
      return OPS.creerBoutique({
        nom: nom, commune: commune,
        adresse_repere: val('bRepere'), description: val('bDesc')
      });
    }, async function () { await rechargerBase(); await rendreBoutiques(); });
    return;
  }
  if (c.hasAttribute('data-verifier')) {
    const id = c.getAttribute('data-verifier');
    await agir(c, 'msg-' + id, function () { return OPS.majStatutBoutique(id, 'verifiee'); },
      async function () { await rechargerBase(); await rendreBoutiques(); });
    return;
  }
  if (c.hasAttribute('data-suspendre')) {
    const id = c.getAttribute('data-suspendre');
    await agir(c, 'msg-' + id, function () { return OPS.majStatutBoutique(id, 'suspendue'); },
      async function () { await rechargerBase(); await rendreBoutiques(); });
    return;
  }

  /* --- Catégories --- */
  if (c.id === 'creerCategorie') {
    const fr = val('cNomFr');
    if (!fr) { msg('newCatErr', 'Donne un nom à la catégorie.', 'ko'); return; }
    await agir(c, 'newCatErr', function () {
      return OPS.creerCategorie({ nom_fr: fr, nom_ht: val('cNomHt'), ordre: val('cOrdre') });
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
      return OPS.majCategorie(code, {
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
    await agir(c, 'msg-cat-' + code, function () { return OPS.basculerCategorie(code, actif); },
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
    await agir(null, 'msg-' + id, function () { return OPS.definirPlan(id, c.value); },
      async function () { msg('msg-' + id, 'Plan enregistré.', 'ok'); await rechargerBase(); });
    return;
  }

  // Variantes : on enregistre au fil de la saisie, sans bouton.
  if (c.hasAttribute('data-vstock')) {
    await agir(null, null, function () {
      return OPS.majVariante(c.getAttribute('data-vstock'),
        { stock: Math.max(0, parseInt(c.value, 10) || 0) });
    });
    return;
  }
  if (c.hasAttribute('data-vlib')) {
    const lib = c.value.trim();
    if (!lib) return;
    await agir(null, null, function () {
      return OPS.majVariante(c.getAttribute('data-vlib'), { libelle: lib });
    });
    return;
  }
  if (c.hasAttribute('data-vprix')) {
    const cts = enCentimes(c.value);
    await agir(null, null, function () {
      return OPS.majVariante(c.getAttribute('data-vprix'), { prix: cts > 0 ? cts : null });
    });
    return;
  }

  if (c.hasAttribute('data-tcom')) {
    const v = c.value.trim();
    if (!v) return;
    await agir(null, null, function () {
      return OPS.majTarif(c.getAttribute('data-tcom'), { commune_origine: v });
    });
    return;
  }
  if (c.hasAttribute('data-tfrais')) {
    const cts = Math.max(0, enCentimes(c.value));
    await agir(null, null, function () {
      return OPS.majTarif(c.getAttribute('data-tfrais'), { frais: cts });
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
      return OPS.televerserPlusieurs(id, fichiers, dejaImg, dejaVid,
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


/* ---------- Révision -------------------------------------

   Les fiches soumises par les vendeurs, les plus anciennes d'abord.
   L'équipe corrige directement ce qui est corrigeable — une faute,
   une description trop maigre — et refuse en expliquant ce que le
   vendeur doit reprendre lui-même : une photo floue, une variante
   manquante. Un refus sans motif ne fait pas corriger, il fait
   abandonner.                                                    */

function carteRevision(p) {
  const med = (p.medias || []).slice()
    .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill att">En révision</span></div>' +
    '<div class="ligne"><span>Boutique</span><strong>' +
      esc(p.boutique ? p.boutique.nom : '\u2014') + '</strong></div>' +
    '<div class="ligne"><span>Soumise</span><span>' + esc(quand(p.soumis_le)) + '</span></div>' +

    (med.length
      ? '<div class="vignettes">' + med.map(function (m) {
          const url = API.photoUrl(m.chemin);
          return '<div class="media">' +
            ((m.type || 'image') === 'video'
              ? '<video class="vignette" src="' + esc(url) + '" muted playsinline preload="metadata"></video>' +
                '<span class="vid">VIDÉO</span>'
              : '<img class="vignette" src="' + esc(url) + '" alt="" loading="lazy">') +
            '<button class="sup" data-supmedia="' + esc(m.id) + '" data-prod="' + esc(p.id) +
              '" aria-label="Supprimer">\u00d7</button></div>';
        }).join('') + '</div>'
      : '<p class="note" style="color:var(--hot)">Aucune photo.</p>') +

    // Corrigeable sur place : nom, catégorie, prix, description.
    '<div class="edit">' +
      '<div class="champ"><label for="rv-nom-' + esc(p.id) + '">Nom</label>' +
        '<input id="rv-nom-' + esc(p.id) + '" value="' + esc(p.nom) + '"></div>' +
      '<div class="duo">' +
        '<div class="champ"><label for="rv-cat-' + esc(p.id) + '">Catégorie</label>' +
          '<select id="rv-cat-' + esc(p.id) + '">' + optionsCategories(p.categorie) + '</select></div>' +
        '<div class="champ"><label for="rv-prix-' + esc(p.id) + '">Prix (HTG)</label>' +
          '<input id="rv-prix-' + esc(p.id) + '" inputmode="decimal" value="' +
          esc(enGourdes(p.prix)) + '"></div>' +
      '</div>' +
      '<div class="champ"><label for="rv-desc-' + esc(p.id) + '">Description</label>' +
        '<textarea id="rv-desc-' + esc(p.id) + '" rows="6">' +
        esc(p.description || '') + '</textarea></div>' +
      '<button class="mini" data-rvsave="' + esc(p.id) + '">Enregistrer mes corrections</button>' +
    '</div>' +

    blocVariantes(p) +

    '<div class="champ"><label for="rv-com-' + esc(p.id) + '">Motif du refus</label>' +
      '<textarea id="rv-com-' + esc(p.id) + '" rows="3" placeholder="Ce que le vendeur ' +
      'doit reprendre : photo floue, variante manquante\u2026"></textarea></div>' +
    '<div id="msg-' + esc(p.id) + '"></div>' +
    '<button class="cta vert" data-rvpublier="' + esc(p.id) + '">Publier en vitrine</button>' +
    '<button class="ghost" data-rvrefuser="' + esc(p.id) + '">Renvoyer au vendeur</button>' +
  '</div>';
}

async function rendreRevision() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Révision</h2></div><p class="empty">\u2026</p>';
  try {
    aRevisers = await OPS.aReviser();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }
  z.innerHTML =
    '<div class="sechead"><h2>Révision</h2><span class="eyebrow num">' +
      (aRevisers.length || '') + '</span></div>' +
    (aRevisers.length
      ? '<p class="note">Corrige ce qui est corrigeable ici même. Renvoie au vendeur ' +
        'ce que lui seul peut reprendre, en disant quoi.</p>' +
        '<div class="pile">' + aRevisers.map(carteRevision).join('') + '</div>'
      : '<p class="empty">Aucune fiche en attente.</p>');
}

/* ---------- Plans ----------------------------------------

   Le pourcentage d'un plan n'est pas qu'un chiffre : il est figé sur
   chaque ligne de commande AU MOMENT DE LA VENTE. Le modifier ici ne
   change donc rien aux ventes passées — c'est voulu, un vendeur ne
   doit pas voir sa commission d'hier bouger — mais il s'applique à
   tout ce qui se vendra ensuite.                                  */

function cartePlan(p, nbBoutiques) {
  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill ' + (p.actif ? 'ok' : 'gris') + '">' +
      (p.actif ? 'Actif' : 'Désactivé') + '</span>' +
      (nbBoutiques ? '<span class="pill att">' + nbBoutiques + ' boutique(s)</span>' : '') +
    '</div>' +
    '<div class="champ"><label for="pl-nom-' + esc(p.code) + '">Nom</label>' +
      '<input id="pl-nom-' + esc(p.code) + '" value="' + esc(p.nom) + '"></div>' +
    '<div class="champ"><label for="pl-desc-' + esc(p.code) + '">Ce que le plan apporte</label>' +
      '<textarea id="pl-desc-' + esc(p.code) + '" rows="3">' +
      esc(p.description || '') + '</textarea></div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="pl-com-' + esc(p.code) + '">Commission (%)</label>' +
        '<input id="pl-com-' + esc(p.code) + '" inputmode="decimal" value="' +
        (p.commission_bps / 100) + '"></div>' +
      '<div class="champ"><label for="pl-ab-' + esc(p.code) + '">Abonnement / mois (HTG)</label>' +
        '<input id="pl-ab-' + esc(p.code) + '" inputmode="decimal" value="' +
        esc(enGourdes(p.abonnement_mois) || '0') + '"></div>' +
    '</div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="pl-ref-' + esc(p.code) + '">Références max</label>' +
        '<input id="pl-ref-' + esc(p.code) + '" class="num" type="number" min="0" value="' +
        (p.max_references == null ? '' : p.max_references) + '" placeholder="illimité"></div>' +
      '<div class="champ"><label for="pl-mea-' + esc(p.code) + '">Mises en avant</label>' +
        '<input id="pl-mea-' + esc(p.code) + '" class="num" type="number" min="0" value="' +
        (p.mises_en_avant || 0) + '"></div>' +
      '<div class="champ"><label for="pl-ord-' + esc(p.code) + '">Ordre</label>' +
        '<input id="pl-ord-' + esc(p.code) + '" class="num" type="number" value="' +
        (p.ordre || 0) + '"></div>' +
    '</div>' +
    '<div id="msg-pl-' + esc(p.code) + '"></div>' +
    '<div class="rangee">' +
      '<button class="mini" data-plsave="' + esc(p.code) + '">Enregistrer</button>' +
      '<button class="mini" data-plbascule="' + esc(p.code) + '" data-actif="' +
        (p.actif ? '0' : '1') + '">' + (p.actif ? 'Désactiver' : 'Réactiver') + '</button>' +
    '</div>' +
  '</div>';
}

async function rendrePlans() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Plans</h2></div><p class="empty">\u2026</p>';
  let nb = {};
  try { nb = await OPS.boutiquesParPlan(); } catch (e) {}

  z.innerHTML =
    '<div class="sechead"><h2>Plans</h2><span class="eyebrow num">' +
      (lesPlans.length || '') + '</span></div>' +
    '<p class="note">La commission est prélevée automatiquement sur chaque vente : ' +
      'le vendeur voit son solde déjà net. Le pourcentage est figé sur la commande ' +
      'au moment de la vente — le changer ici ne touche pas aux ventes passées, ' +
      'et c\u2019est volontaire : personne ne doit voir sa commission d\u2019hier bouger.</p>' +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="titreligne"><h2>Nouveau plan</h2></div>' +
        '<div class="champ"><label for="npNom">Nom</label>' +
          '<input id="npNom" placeholder="Gwo Biznis Plus"></div>' +
        '<div class="champ"><label for="npDesc">Ce que le plan apporte</label>' +
          '<textarea id="npDesc" rows="3"></textarea></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="npCom">Commission (%)</label>' +
            '<input id="npCom" inputmode="decimal" placeholder="5"></div>' +
          '<div class="champ"><label for="npAb">Abonnement / mois (HTG)</label>' +
            '<input id="npAb" inputmode="decimal" placeholder="0"></div>' +
        '</div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="npRef">Références max</label>' +
            '<input id="npRef" class="num" type="number" min="0" placeholder="illimité"></div>' +
          '<div class="champ"><label for="npMea">Mises en avant</label>' +
            '<input id="npMea" class="num" type="number" min="0" value="0"></div>' +
        '</div>' +
        '<div id="newPlanErr"></div>' +
        '<button class="cta" id="creerPlan">Ajouter le plan</button>' +
      '</div>' +
    '</div>' +
    '<div class="pile">' +
      lesPlans.map(function (p) { return cartePlan(p, nb[p.code] || 0); }).join('') +
    '</div>' +
    '<p class="note">Un plan ne se supprime pas : des abonnements et des ventes y ' +
      'sont rattachés. Le désactiver le retire du choix sans rien casser.</p>';
}

/* ---------- Tableau de bord ------------------------------
   Ce qu'un responsable veut voir en ouvrant l'app : ce qui bloque,
   ce qu'il doit, ce qui tourne. Pas une collection de compteurs
   flatteurs.                                                    */

async function rendreTableau() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Tableau de bord</h2></div><p class="empty">\u2026</p>';

  let ouvertes = [], du = [];
  try {
    ouvertes = await OPS.colisOuverts();
    du = await OPS.duAuxVendeurs();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  // Le travail se compte en COLIS : c'est l'unite qui voyage et qui
  // s'encaisse. Une commande partie de trois villes fait trois gestes.
  const aAppeler = new Set(ouvertes.filter(function (k) { return k.statut === 'recue'; })
    .map(function (k) { return k.commande ? k.commande.id : k.id; })).size;
  const auComptoir = ouvertes.filter(function (k) { return k.statut === 'au_point_retrait'; });
  const enRetard = auComptoir.filter(function (k) {
    return k.expire_le && new Date(k.expire_le) < Date.now(); }).length;
  const impayes = du.filter(function (l) { return !l.regle; });
  const dette = impayes.reduce(function (s, l) { return s + Number(l.net); }, 0);
  const enAttente = boutiques.filter(function (b) { return b.statut === 'en_attente'; }).length;
  // Ce qui demande un geste tout de suite : appeler, ou servir au comptoir.
  majPastilleAFaire(ouvertes.filter(function (k) {
    return k.statut === 'recue' || k.statut === 'au_point_retrait'; }).length);

  function tuile(titre, valeur, sous, alerte, vers) {
    // Une tuile qui annonce du travail doit y mener : lire « 2 a appeler »
    // sans pouvoir appeler depuis la meme application, c'est une impasse.
    return '<div class="bloc"' + (alerte ? ' style="border-color:var(--hot)"' : '') +
      (vers ? ' data-aller="' + esc(vers) + '" style="cursor:pointer"' : '') + '>' +
      '<div class="slabel" style="font-size:11px;font-weight:700;letter-spacing:.07em;' +
        'text-transform:uppercase;color:var(--ink-soft)">' + esc(titre) + '</div>' +
      '<div style="font-family:var(--display);font-size:24px;letter-spacing:-.02em">' +
        esc(valeur) + '</div>' +
      (sous ? '<div class="note">' + esc(sous) + '</div>' : '') + '</div>';
  }

  z.innerHTML =
    '<div class="sechead"><h2>Tableau de bord</h2></div>' +
    '<div class="pile">' +
      tuile('Dette envers les vendeurs', htg(dette),
            impayes.length + ' colis retiré(s) non réglé(s)', dette > 0, 'reglements') +
      tuile('À appeler', String(aAppeler), 'Commandes en attente de confirmation',
            false, 'comptoir') +
      tuile('Au comptoir', String(auComptoir.length),
            enRetard ? enRetard + ' au-delà du délai de retrait' : 'Dans les délais',
            enRetard > 0, 'comptoir') +
      tuile('Boutiques à vérifier', String(enAttente),
            enAttente ? 'Patente et pièce d\u2019identité à contrôler' : 'Rien en attente',
            false, 'boutiques') +
    '</div>' +
    '<p class="note">La dette envers les vendeurs est le chiffre à surveiller : ' +
      'en phase pilote Flashipping encaisse au comptoir et doit reverser. ' +
      'C\u2019est la somme la plus facile à oublier et la plus rapide à ' +
      'détruire une relation.</p>';
}

/* ---------- Règlements ------------------------------------ */

async function rendreReglements() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Règlements</h2></div><p class="empty">\u2026</p>';
  try {
    aRegler = await OPS.duAuxVendeurs();
    lesSoldes = await OPS.soldes();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  // Groupé par boutique : on règle un vendeur, pas un colis isolé.
  const parBoutique = {};
  aRegler.filter(function (l) { return !l.regle; }).forEach(function (l) {
    if (!parBoutique[l.boutique]) parBoutique[l.boutique] = { nom: l.boutique_nom, lignes: [] };
    parBoutique[l.boutique].lignes.push(l);
  });
  const cles = Object.keys(parBoutique);

  z.innerHTML =
    '<div class="sechead"><h2>Règlements</h2><span class="eyebrow num">' +
      (cles.length || '') + '</span></div>' +
    '<p class="note">L\u2019acheteur a payé au comptoir : cet argent appartient au ' +
      'vendeur, commission déduite. Chaque règlement laisse deux lignes dans le ' +
      'journal — ce qui part, ce que la plateforme garde — et rien ne s\u2019efface.</p>' +
    (cles.length
      ? '<div class="pile">' + cles.map(function (b) {
          const g = parBoutique[b];
          const total = g.lignes.reduce(function (s, l) { return s + Number(l.net); }, 0);
          return '<div class="bloc">' +
            '<div class="titreligne"><h2>' + esc(g.nom) + '</h2>' +
              '<span class="pill ok">' + g.lignes.length + ' commande(s)</span></div>' +
            g.lignes.map(function (l) {
              return '<div class="ligne"><span class="num">' + esc(l.reference) + ' \u00b7 ' +
                esc(quand(l.retire_le)) + '</span><span class="num">' + htg(l.net) + '</span></div>';
            }).join('') +
            '<div class="ligne" style="border-top:1px solid var(--line);padding-top:9px">' +
              '<span><strong>À verser</strong></span>' +
              '<strong class="num" style="font-size:18px">' + htg(total) + '</strong></div>' +
            '<div id="msg-reg-' + esc(b) + '"></div>' +
            '<button class="cta vert" data-regler="' + esc(b) + '">Marquer réglé \u00b7 ' +
              htg(total) + '</button>' +
          '</div>';
        }).join('') + '</div>'
      : '<p class="empty">Rien à régler. Toutes les ventes retirées sont soldées.</p>') +

    '<div class="sechead"><h2 style="font-size:14px">Historique par boutique</h2></div>' +
    '<div class="pile">' + (lesSoldes || []).map(function (s) {
      return '<div class="bloc"><div class="titreligne"><h2>' + esc(s.nom) + '</h2></div>' +
        '<div class="ligne"><span>Versé au vendeur</span><span class="num">' +
          htg(s.libere) + '</span></div>' +
        '<div class="ligne"><span>Commission gardée</span><span class="num">' +
          htg(s.commission) + '</span></div>' +
        '<div class="ligne"><span>Remboursé</span><span class="num">' +
          htg(s.rembourse) + '</span></div></div>';
    }).join('') + '</div>';
}

/* ---------- Onglet Comptoir ------------------------------
   Exactement l'écran de l'agent, dans l'administration. Un
   administrateur qui voit « 2 à appeler » sur son tableau de bord
   doit pouvoir appeler depuis la même application, pas changer
   d'écran. Les cartes et les gestes viennent de comptoir.js :
   un seul endroit où la chaîne est appliquée.                  */

async function rendreComptoirAdm() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Comptoir</h2></div><p class="empty">…</p>';
  let liste;
  try {
    liste = await OPS.colisOuverts();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }
  majPastilleAFaire(liste.filter(function (k) {
    return k.statut === 'recue' || k.statut === 'au_point_retrait';
  }).length);

  z.innerHTML =
    '<div class="sechead"><h2>Comptoir</h2><span class="eyebrow num">' +
      liste.length + ' colis en cours</span></div>' +
    COMPTOIR.files(liste);
}

/* Le nombre de gestes qui attendent, visible depuis les autres
   onglets : sans ça on ne sait qu'il y a du travail qu'en allant le
   chercher. On ne compte que ce qui demande une action tout de suite
   — appeler, ou servir quelqu'un au comptoir. */
function majPastilleAFaire(n) {
  const p = el('aFaire');
  if (!p) return;
  p.textContent = n > 9 ? '9+' : String(n);
  p.hidden = !n;
}

/* ---------- Fiche d'une boutique -------------------------
   Tout ce qui concerne un vendeur sur un seul écran : son état,
   son plan, ses pièces, ses colis en cours, ce qu'on lui doit.
   Jusqu'ici ces informations étaient éparpillées sur quatre
   onglets, ce qui obligeait à les recoller de tête.            */

function lignesDeLaBoutique(k, bId) {
  return (k.lignes || []).filter(function (l) {
    return l.boutique && l.boutique.id === bId;
  });
}

async function rendreFicheBoutique() {
  const z = el('panneau');
  const b = boutiques.filter(function (x) { return x.id === ficheBoutique; })[0];
  if (!b) { ficheBoutique = null; return rendreBoutiques(); }

  z.innerHTML = '<div class="sechead"><h2>' + esc(b.nom) + '</h2></div><p class="empty">…</p>';

  let lesColis = [], du = [], sesProduits = [];
  try {
    const r = await Promise.all([
      OPS.colisOuverts().catch(function () { return []; }),
      OPS.duAuxVendeurs(b.id).catch(function () { return []; }),
      OPS.produitsBoutique(b.id).catch(function () { return []; })
    ]);
    lesColis = r[0]; du = r[1]; sesProduits = r[2];
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  // Les colis qui contiennent au moins un de SES articles.
  const siens = lesColis.filter(function (k) { return lignesDeLaBoutique(k, b.id).length; });
  const par = function (sts) {
    return siens.filter(function (k) { return sts.indexOf(k.statut) !== -1; });
  };
  const aPreparer = par(['confirmee', 'en_preparation']);
  const prets     = par(['prete']);
  const enRoute   = par(['en_transit']);
  const auComptoir= par(['au_point_retrait']);
  const aAppeler  = par(['recue']);

  const impayes = du.filter(function (x) { return !x.regle; });
  const dette = impayes.reduce(function (s, x) { return s + Number(x.net); }, 0);
  const verse = du.filter(function (x) { return x.regle; })
    .reduce(function (s, x) { return s + Number(x.net); }, 0);
  const commission = du.reduce(function (s, x) { return s + Number(x.commission); }, 0);

  const enVitrine = sesProduits.filter(function (p) { return p.statut === 'publie'; }).length;
  const enRevision = sesProduits.filter(function (p) { return p.statut === 'en_revision'; }).length;
  const stock = sesProduits.reduce(function (s, p) {
    return s + (p.variantes || []).reduce(function (t, v) { return t + (v.stock || 0); }, 0);
  }, 0);

  function chiffre(titre, valeur, sous, alerte) {
    return '<div class="bloc"' + (alerte ? ' style="border-color:var(--hot)"' : '') + '>' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:.07em;' +
        'text-transform:uppercase;color:var(--ink-soft)">' + esc(titre) + '</div>' +
      '<div style="font-family:var(--display);font-size:22px;letter-spacing:-.02em">' +
        esc(valeur) + '</div>' +
      (sous ? '<div class="note">' + esc(sous) + '</div>' : '') + '</div>';
  }

  function file(titre, items, note) {
    if (!items.length) return '';
    return '<div class="sechead"><h2 style="font-size:14px">' + titre + '</h2>' +
      '<span class="eyebrow num">' + items.length + '</span></div>' +
      (note ? '<p class="note">' + note + '</p>' : '') +
      '<div class="pile">' + items.map(COMPTOIR.carteColis).join('') + '</div>';
  }

  z.innerHTML =
    '<button class="mini" id="retourBoutiques">← Toutes les boutiques</button>' +
    '<div class="sechead"><h2>' + esc(b.nom) + '</h2>' +
      '<span class="pill ' + (b.statut === 'verifiee' ? 'ok'
        : (b.statut === 'suspendue' ? 'ko' : 'warn')) + '">' +
      esc(b.statut === 'verifiee' ? 'Vérifiée'
        : (b.statut === 'suspendue' ? 'Suspendue' : 'En attente')) + '</span></div>' +

    '<div class="pile">' +
      chiffre('On lui doit', htg(dette),
        impayes.length + ' colis retiré(s) non réglé(s)', dette > 0) +
      chiffre('Déjà versé', htg(verse), 'Depuis le début') +
      chiffre('Commission gardée', htg(commission), 'Sur ses ventes retirées') +
      chiffre('Colis en cours', String(siens.length),
        aPreparer.length ? aPreparer.length + ' à préparer' : 'Rien à préparer') +
      chiffre('Catalogue', String(enVitrine) + ' en vitrine',
        (enRevision ? enRevision + ' en révision · ' : '') + stock + ' pièces en stock',
        enRevision > 0) +
    '</div>' +

    (dette > 0
      ? '<div id="msg-fiche-' + esc(b.id) + '"></div>' +
        '<button class="cta" data-regler="' + esc(b.id) + '">Régler ' + htg(dette) +
        ' à ce vendeur</button>'
      : '') +

    '<div class="sechead"><h2 style="font-size:14px">La boutique</h2></div>' +
    '<div class="pile">' + carteBoutique(b) + '</div>' +

    '<div class="sechead"><h2>Ses colis</h2></div>' +
    (siens.length ? '' : '<p class="empty">Aucun colis en cours pour ce vendeur.</p>') +
    file('À appeler', aAppeler,
      'Le client n’a pas encore confirmé : ce vendeur ne voit pas encore la commande.') +
    file('À préparer', aPreparer) +
    file('Prêts — en attente du transporteur', prets) +
    file('En route', enRoute) +
    file('Au comptoir', auComptoir);
}

/* ---------- Comptes --------------------------------------
   Qui est qui. Donner un rôle, et surtout rattacher une boutique
   à son vendeur : sans ce rattachement, un vendeur ouvre son
   espace et ne voit rien.                                      */

async function rendreComptes() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Comptes</h2></div><p class="empty">\u2026</p>';
  try {
    comptes = await OPS.profilsParRole(null);
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  const ROLES = [['acheteur', 'Acheteur'], ['vendeur', 'Vendeur'],
                 ['agent', 'Agent'], ['admin', 'Administrateur']];

  z.innerHTML =
    '<div class="sechead"><h2>Comptes</h2><span class="eyebrow num">' +
      (comptes.length || '') + '</span></div>' +
    '<p class="note">Un vendeur ne voit ses commandes que si une boutique lui est ' +
      'rattachée. Les boutiques créées par un agent lui appartiennent au départ : ' +
      'il faut les transférer.</p>' +
    '<div class="pile">' + comptes.map(function (p) {
      const sienne = boutiques.filter(function (b) { return b.proprietaire === p.id; });
      return '<div class="bloc">' +
        '<div class="titreligne"><h2>' + esc(p.nom || 'Sans nom') + '</h2>' +
          '<span class="pill ' + (p.role === 'admin' ? 'ko' :
            (p.role === 'agent' ? 'att' : (p.role === 'vendeur' ? 'ok' : 'gris'))) + '">' +
          esc(p.role) + '</span></div>' +
        (p.telephone ? '<div class="ligne"><span>Téléphone</span><span class="num">' +
          esc(p.telephone) + '</span></div>' : '') +
        (sienne.length ? '<div class="ligne"><span>Boutique</span><strong>' +
          sienne.map(function (b) { return esc(b.nom); }).join(', ') + '</strong></div>' : '') +
        '<div class="champ"><label for="r-' + esc(p.id) + '">Rôle</label>' +
          '<select id="r-' + esc(p.id) + '" data-role="' + esc(p.id) + '">' +
            ROLES.map(function (r) {
              return '<option value="' + r[0] + '"' + (p.role === r[0] ? ' selected' : '') +
                '>' + r[1] + '</option>';
            }).join('') + '</select></div>' +
        (p.role === 'vendeur'
          ? '<div class="champ"><label for="tb-' + esc(p.id) + '">Rattacher une boutique</label>' +
            '<select id="tb-' + esc(p.id) + '" data-transfert="' + esc(p.id) + '">' +
            '<option value="">\u2014 choisir \u2014</option>' +
            boutiques.map(function (b) {
              return '<option value="' + esc(b.id) + '"' +
                (b.proprietaire === p.id ? ' selected' : '') + '>' + esc(b.nom) +
                ' \u2014 ' + esc(b.commune) + '</option>';
            }).join('') + '</select></div>'
          : '') +
        '<div id="msg-' + esc(p.id) + '"></div>' +
      '</div>';
    }).join('') + '</div>';
}

/* ---------- Navigation ----------------------------------- */

async function rendre() {
  Array.prototype.forEach.call(document.querySelectorAll('.ong'), function (b) {
    b.setAttribute('aria-selected', b.getAttribute('data-ong') === ongletActif);
  });
  if (ongletActif === 'tableau') await rendreTableau();
  if (ongletActif === 'comptoir') await rendreComptoirAdm();
  if (ongletActif === 'boutiques') {
    if (ficheBoutique) await rendreFicheBoutique(); else await rendreBoutiques();
  }
  if (ongletActif === 'catalogue') await rendreCatalogue();
  if (ongletActif === 'categories') await rendreCategories();
  if (ongletActif === 'livraison') await rendreLivraison();
  if (ongletActif === 'revision') await rendreRevision();
  if (ongletActif === 'plans') await rendrePlans();
  if (ongletActif === 'reglements') await rendreReglements();
  if (ongletActif === 'comptes') await rendreComptes();
}

async function rechargerBase() {
  const r = await Promise.all([
    OPS.toutesBoutiques().catch(function () { return []; }),
    OPS.plans().catch(function () { return []; }),
    OPS.toutesCategories().catch(function () { return []; }),
    OPS.tousPoints().catch(function () { return []; }),
    OPS.communesVendeurs().catch(function () { return []; })
  ]);
  boutiques = r[0]; lesPlans = r[1]; categories = r[2]; points = r[3]; communes = r[4];
}

/* ---------- Événements propres à l'administration --------- */

/* Les tuiles du tableau de bord sont des blocs, pas des boutons : le
   gestionnaire principal ne regarde que les boutons, donc elles ont
   le leur. Une tuile qui annonce du travail doit y mener. */
document.addEventListener('click', async function (ev) {
  const t = ev.target.closest ? ev.target.closest('[data-aller]') : null;
  if (!t) return;
  ongletActif = t.getAttribute('data-aller');
  ficheBoutique = null;
  await rendre();
  window.scrollTo(0, 0);
});

document.addEventListener('click', async function (ev) {
  const c = ev.target.closest ? ev.target.closest('button') : null;
  if (!c) return;

  if (c.classList.contains('ong')) {
    ongletActif = c.getAttribute('data-ong');
    produitEnEdition = null;
    boutiqueEnEdition = null;
    await rendre();
    return;
  }

  if (c.hasAttribute('data-doc')) {
    await agir(c, null, function () { return OPS.lienDocument(c.getAttribute('data-doc')); },
      function (url) { if (url) window.open(url, '_blank', 'noopener'); });
    return;
  }

  if (c.hasAttribute('data-rvsave')) {
    const id = c.getAttribute('data-rvsave');
    const prix = enCentimes(val('rv-prix-' + id));
    if (!val('rv-nom-' + id)) { msg('msg-' + id, 'Le nom ne peut pas être vide.', 'ko'); return; }
    if (prix <= 0) { msg('msg-' + id, 'Prix invalide.', 'ko'); return; }
    await agir(c, 'msg-' + id, function () {
      return OPS.majProduit(id, {
        nom: val('rv-nom-' + id), prix: prix,
        categorie: el('rv-cat-' + id).value,
        description: val('rv-desc-' + id) || null
      });
    }, function () { msg('msg-' + id, 'Corrections enregistrées.', 'ok'); });
    return;
  }
  if (c.hasAttribute('data-rvpublier')) {
    const id = c.getAttribute('data-rvpublier');
    await agir(c, 'msg-' + id, function () { return OPS.publier(id); },
      async function () { await rendreRevision(); });
    return;
  }
  if (c.hasAttribute('data-rvrefuser')) {
    const id = c.getAttribute('data-rvrefuser');
    const motif = val('rv-com-' + id);
    if (!motif) {
      msg('msg-' + id, 'Écris ce que le vendeur doit corriger : un refus sans ' +
        'motif ne fait pas corriger, il fait abandonner.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return OPS.refuserProduit(id, motif); },
      async function () { await rendreRevision(); });
    return;
  }

  if (c.id === 'creerPlan') {
    const nom = val('npNom');
    const com = Math.round(parseFloat((val('npCom') || '').replace(',', '.')) * 100);
    if (!nom) { msg('newPlanErr', 'Donne un nom au plan.', 'ko'); return; }
    if (!isFinite(com) || com < 0 || com > 10000) {
      msg('newPlanErr', 'Commission invalide : entre 0 et 100 %.', 'ko'); return;
    }
    await agir(c, 'newPlanErr', function () {
      return OPS.creerPlan({
        nom: nom, description: val('npDesc'), commission_bps: com,
        abonnement_mois: enCentimes(val('npAb')),
        max_references: val('npRef') ? parseInt(val('npRef'), 10) : null,
        mises_en_avant: parseInt(val('npMea'), 10) || 0
      });
    }, async function () {
      ['npNom','npDesc','npCom','npAb','npRef'].forEach(function (k) {
        if (el(k)) el(k).value = ''; });
      await rechargerBase();
      await rendrePlans();
    });
    return;
  }
  if (c.hasAttribute('data-plsave')) {
    const code = c.getAttribute('data-plsave');
    const com = Math.round(parseFloat((val('pl-com-' + code) || '').replace(',', '.')) * 100);
    if (!isFinite(com) || com < 0 || com > 10000) {
      msg('msg-pl-' + code, 'Commission invalide : entre 0 et 100 %.', 'ko'); return;
    }
    const ref = val('pl-ref-' + code);
    await agir(c, 'msg-pl-' + code, function () {
      return OPS.majPlan(code, {
        nom: val('pl-nom-' + code),
        description: val('pl-desc-' + code) || null,
        commission_bps: com,
        abonnement_mois: enCentimes(val('pl-ab-' + code)),
        max_references: ref === '' ? null : parseInt(ref, 10),
        mises_en_avant: parseInt(val('pl-mea-' + code), 10) || 0,
        ordre: parseInt(val('pl-ord-' + code), 10) || 0
      });
    }, async function () {
      msg('msg-pl-' + code, 'Enregistré. S\u2019applique aux ventes à venir.', 'ok');
      await rechargerBase();
    });
    return;
  }
  if (c.hasAttribute('data-plbascule')) {
    const code = c.getAttribute('data-plbascule');
    const actif = c.getAttribute('data-actif') === '1';
    await agir(c, 'msg-pl-' + code, function () { return OPS.majPlan(code, { actif: actif }); },
      async function () { await rechargerBase(); await rendrePlans(); });
    return;
  }

  if (c.hasAttribute('data-regler')) {
    const b = c.getAttribute('data-regler');
    // Le bouton existe a deux endroits -- l'onglet Reglements et la fiche
    // d'une boutique -- avec deux zones de message. On ecrit dans celle
    // qui est presente.
    const zone = el('msg-reg-' + b) ? 'msg-reg-' + b : 'msg-fiche-' + b;
    // Deux appuis : un reglement ecrit dans un journal qui ne se reecrit pas.
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer le r\u00e8glement';
      msg(zone, '\u00c0 faire une fois l\u2019argent remis au vendeur. ' +
        'L\u2019\u00e9criture est d\u00e9finitive. Appuie encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, zone, async function () {
      // On relit juste avant d'ecrire : la liste affichee peut dater, et
      // un reglement se fait sur ce qui est du MAINTENANT.
      const du = await OPS.duAuxVendeurs(b);
      const ids = du.filter(function (l) { return !l.regle; })
        .map(function (l) { return l.colis; });
      if (!ids.length) throw new Error('Plus rien \u00e0 r\u00e9gler pour ce vendeur.');
      return OPS.reglerBoutique(b, ids);
    }, async function (r) {
      msg(zone, r.colis + ' colis r\u00e9gl\u00e9(s), ' + htg(r.montant) + ' vers\u00e9s.', 'ok');
      setTimeout(function () {
        if (ficheBoutique === b) rendreFicheBoutique(); else rendreReglements();
      }, 1500);
    });
    return;
  }

  // Ouvrir la fiche complete d'un vendeur, et en revenir.
  if (c.hasAttribute('data-fiche')) {
    ficheBoutique = c.getAttribute('data-fiche');
    boutiqueEnEdition = null;
    ongletActif = 'boutiques';
    await rendre();
    window.scrollTo(0, 0);
    return;
  }
  if (c.id === 'retourBoutiques') {
    ficheBoutique = null;
    await rendre();
    window.scrollTo(0, 0);
    return;
  }
});

document.addEventListener('change', async function (ev) {
  const c = ev.target;

  if (c.hasAttribute('data-role')) {
    const id = c.getAttribute('data-role');
    await agir(null, 'msg-' + id, function () { return OPS.definirRole(id, c.value); },
      async function () {
        msg('msg-' + id, 'Rôle enregistré.', 'ok');
        await rendreComptes();
      });
    return;
  }
  if (c.hasAttribute('data-transfert')) {
    const id = c.getAttribute('data-transfert');
    if (!c.value) return;
    await agir(null, 'msg-' + id, function () { return OPS.transfererBoutique(c.value, id); },
      async function () {
        msg('msg-' + id, 'Boutique rattachée.', 'ok');
        await rechargerBase();
      });
    return;
  }
});

/* ---------- Démarrage ------------------------------------- */

brancherDeclinaisons(
  function (id) {
    return produits.filter(function (p) { return p.id === id; })[0] ||
           aRevisers.filter(function (p) { return p.id === id; })[0];
  },
  async function () {
    if (ongletActif === 'revision') await rendreRevision();
    else await rechargerProduits();
  }
);

COMPTOIR.brancher(rendre);
EQUIPE.brancher(['admin'], async function () {
  await rechargerBase();
  await rendre();
});
