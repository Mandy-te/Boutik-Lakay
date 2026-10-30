/* ============================================================
   Boutique Lakay — espace vendeur

   Ce que le vendeur fait, et rien d'autre :
   · préparer les commandes qui le concernent et dire quand c'est prêt
   · tenir son catalogue (brouillons, stock, photos)
   · voir ce que Boutique Lakay lui doit

   Ce qu'il ne peut pas faire, et c'est voulu :
   · publier lui-même — la qualité des photos décide des ventes
   · déclarer qu'un colis est embarqué ou arrivé — ce n'est pas lui
     qui le transporte, et l'affirmer rendrait le suivi faux
   ============================================================ */

let onglet = 'preparer';
let boutique = null;
let produits = [];
let commandes = [];
let categories = [];
let produitEnEdition = null;
let remplace = null;   // pièce dont on veut déposer une nouvelle version
let plans = [];

/* ---------- À préparer ----------------------------------- */

function mesLignes(o) {
  if (!boutique) return [];
  return (o.lignes || []).filter(function (l) {
    return l.boutique && l.boutique.id === boutique.id;
  });
}

function carteCommande(o) {
  const p = pastilleStatut(o.statut);
  const lignes = mesLignes(o);
  if (!lignes.length) return '';

  const suivante = OPS.etapeSuivante(o.statut);
  const aMoi = suivante && (suivante.code === 'en_preparation' || suivante.code === 'prete');

  return '<div class="bloc">' +
    '<div class="titreligne"><span class="oref num">' + esc(o.reference) + '</span>' +
      '<span class="pill ' + p.c + '">' + esc(p.mot) + '</span></div>' +
    '<div class="ligne"><span>Commandée</span><span>' + esc(quand(o.cree_le)) + '</span></div>' +
    '<div class="ligne"><span>À livrer à</span><strong>' +
      esc(o.point ? o.point.nom : '—') + '</strong></div>' +
    '<div class="note">' + lignes.map(function (l) {
      return esc(l.nom_produit) + (l.libelle ? ' · ' + esc(l.libelle) : '') +
        ' <span class="num">×' + l.quantite + '</span>';
    }).join('<br>') + '</div>' +
    '<div class="ligne"><span>Votre part</span><strong class="num">' +
      htg(lignes.reduce(function (s, l) { return s + l.prix_unitaire * l.quantite; }, 0)) +
      '</strong></div>' +
    '<div id="msg-' + esc(o.id) + '"></div>' +
    (aMoi
      ? '<button class="cta" data-avancer="' + esc(o.id) + '" data-vers="' +
        esc(suivante.code) + '">' + esc(suivante.nom) + '</button>'
      : '<p class="note">Rien à faire de votre côté : Flashipping prend le relais.</p>') +
  '</div>';
}

/* La pastille de l'onglet. Elle se met à jour même quand le vendeur
   est ailleurs : c'est tout l'intérêt. Silencieuse en cas d'échec,
   une pastille absente ne doit pas bloquer l'écran. */
function majPastilleOng(n) {
  const p = el('aPreparer');
  if (!p) return;
  p.textContent = n > 9 ? '9+' : String(n);
  p.hidden = !n;
}

async function compterAPreparer() {
  try {
    const liste = await OPS.commandesAPreparer();
    commandes = liste;
    majPastilleOng(liste.filter(function (o) { return mesLignes(o).length; }).length);
  } catch (e) { majPastilleOng(0); }
}

async function rendrePreparer() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>À préparer</h2></div><p class="empty">…</p>';
  try {
    commandes = await OPS.commandesAPreparer();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }
  const miennes = commandes.filter(function (o) { return mesLignes(o).length; });
  majPastilleOng(miennes.length);

  z.innerHTML =
    '<div class="sechead"><h2>À préparer</h2><span class="eyebrow num">' +
      (miennes.length || '') + '</span></div>' +
    (miennes.length
      ? '<div class="pile">' + miennes.map(carteCommande).join('') + '</div>'
      : '<p class="empty">Aucune commande en attente. Elles apparaîtront ici ' +
        'dès qu’un agent aura confirmé l’appel au client.</p>');
}

/* ---------- Pièces justificatives ------------------------
   Déposables à tout moment depuis ici, pas seulement pendant
   l'inscription : sur un téléphone, le sélecteur de fichiers peut
   faire recharger la page et interrompre le parcours. Il faut
   toujours un endroit où reprendre.                            */

/* Une pièce déjà reçue n'affiche plus un sélecteur vide : c'était
   contradictoire, le titre disait « reçue » et le champ disait « aucun
   fichier choisi ». On confirme ce qui est arrivé, avec de quoi le
   relire ou le remplacer si besoin. */
function champPiece(id, libelle, chemin, zone) {
  if (chemin && remplace !== id) {
    return '<div class="champ"><label>' + esc(libelle) + '</label>' +
      '<div class="recue"><span class="coche">\u2713</span>' +
        '<span>Reçue</span>' +
        '<span class="rangee">' +
          '<button class="mini" data-voir="' + esc(chemin) + '">Voir</button> ' +
          '<button class="mini" data-remplacer="' + id + '">Remplacer</button>' +
        '</span>' +
      '</div></div>' +
      '<div id="' + zone + '"></div>';
  }
  return champFichier(id, libelle, {
    accept: 'image/jpeg,image/png,image/webp,application/pdf',
    bouton: 'Choisir un fichier',
    vide: chemin ? 'Choisissez le nouveau fichier' : 'Aucun fichier choisi'
  }) + '<div id="' + zone + '"></div>';
}

function blocPieces() {
  if (!boutique) return '';
  const deux = boutique.piece_identite_url && boutique.patente_url;
  return champPiece('docId', 'Pièce d\u2019identité', boutique.piece_identite_url, 'msgId') +
    champPiece('docPatente', 'Patente', boutique.patente_url, 'msgPatente') +
    '<p class="note">' + (deux
      ? 'Vos deux pièces sont arrivées. Un agent les vérifie et vous appelle. ' +
        'Elles restent privées : seule l\u2019équipe de Boutique Lakay peut les consulter.'
      : 'Elles restent privées : seule l\u2019équipe de Boutique Lakay peut les consulter.') +
    '</p>';
}

async function deposerPiece(champ, genre, zoneMsg, colonne) {
  const input = el(champ);
  const f = input && input.files && input.files[0];
  if (!f || !boutique) return;
  if (f.size > 10 * 1024 * 1024) {
    msg(zoneMsg, 'Fichier trop lourd : 10 Mo maximum.', 'ko');
    input.value = '';
    return;
  }
  const moi = await API.monId();
  const ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const chemin = moi + '/' + genre + '-' + Date.now().toString(36) + '.' + ext;

  msg(zoneMsg, 'Envoi\u2026', 'ok');
  const up = await API.sb().storage.from('documents')
    .upload(chemin, f, { contentType: f.type || undefined, upsert: true });
  if (up.error) { msg(zoneMsg, up.error.message, 'ko'); return; }

  const champs = {};
  champs[colonne] = chemin;
  await OPS.majBoutique(boutique.id, champs);
  boutique = await API.maBoutique();
  remplace = null;
  await rendre();
  msg(zoneMsg, 'Reçue. Un agent la vérifiera.', 'ok');
}

/* ---------- Mon catalogue --------------------------------- */

function etatProduit(p) {
  if (p.statut === 'publie')      return { c: 'ok',   mot: 'En vitrine' };
  if (p.statut === 'en_revision') return { c: 'att',  mot: 'En révision' };
  if (p.statut === 'refuse')      return { c: 'ko',   mot: 'À corriger' };
  if (p.statut === 'suspendu')    return { c: 'ko',   mot: 'Retiré' };
  return { c: 'gris', mot: 'Brouillon' };
}

function blocMedias(p) {
  const med = (p.medias || []).slice()
    .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
  const figee = p.statut === 'en_revision' || p.statut === 'publie';

  return (med.length
    ? '<div class="vignettes">' + med.map(function (m) {
        const url = API.photoUrl(m.chemin);
        const vid = (m.type || 'image') === 'video';
        return '<div class="media">' +
          (vid
            ? '<video class="vignette" src="' + esc(url) + '" muted playsinline preload="metadata"></video>' +
              '<span class="vid">VIDÉO</span>'
            : '<img class="vignette" src="' + esc(url) + '" alt="" loading="lazy">') +
          (figee ? '' : '<button class="sup" data-supmedia="' + esc(m.id) +
            '" data-prod="' + esc(p.id) + '" aria-label="Supprimer">\u00d7</button>') +
        '</div>';
      }).join('') + '</div>'
    : '<p class="note">Aucune photo. Une fiche sans photo ne se vend pas.</p>') +
    (figee ? '' :
      champFichier('ph-' + p.id, 'Ajouter des photos ou une vidéo', {
        accept: 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm',
        multiple: true, bouton: 'Choisir', vide: 'Photos ou vidéo',
        data: 'data-photo="' + esc(p.id) + '"'
      }) + '<div class="progres" id="prog-' + esc(p.id) + '"></div>');
}

/* Ce qu'un vendeur peut toucher, et quand :

   · le STOCK, toujours. C'est son métier, et une fiche en vitrine
     dont il ne peut pas corriger le stock vend ce qu'il n'a plus.
   · les DÉCLINAISONS et les variantes, sauf pendant la révision :
     modifier une fiche qu'un agent est en train de relire lui ferait
     valider autre chose que ce qu'il a sous les yeux.
   · les PRIX, seulement tant que la fiche est en brouillon. Ensuite
     ils passent par Boutique Lakay, comme la publication.          */
function blocVariantes(p) {
  const enRevision = p.statut === 'en_revision';
  const prixFige = enRevision || p.statut === 'publie';
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
        '" placeholder="' + esc(enGourdes(p.prix)) + '" data-vprix="' + esc(v.id) +
        '"' + (prixFige ? ' disabled' : '') + '></div>' +
      (enRevision ? '' : '<button class="sup" data-supvar="' + esc(v.id) +
        '" data-prod="' + esc(p.id) + '" aria-label="Supprimer">\u00d7</button>') +
    '</div>';
  }).join('');

  const stocks = (vs.length
    ? '<div class="sechead"><h2 style="font-size:13px">Stock par variante</h2></div>' + lignes +
      (prixFige ? '<p class="note">Les prix se modifient quand la fiche est en ' +
        'brouillon, ou par Boutique Lakay.</p>' : '')
    : '');

  // Une fiche sans aucune variante ne peut rien vendre : il faut
  // toujours un moyen d'en créer une, même en vitrine.
  const saisie = enRevision ? '' :
    (noms.length
      ? ''   // le bouton « créer les combinaisons » est dans blocDeclinaisons
      : '<div class="vrow">' +
          '<div class="champ lib"><label for="nv-stock-' + esc(p.id) + '">' +
            (vs.length ? 'Ajouter une autre variante' : 'Quantité en stock') + '</label>' +
            '<input id="nv-stock-' + esc(p.id) + '" class="num" type="number" min="0" value="1"></div>' +
          '<button class="mini" data-ajsimple="' + esc(p.id) + '">Enregistrer</button>' +
        '</div>');

  if (enRevision) {
    return blocDeclinaisons(p, { fige: true }) + stocks +
      '<p class="note">Fiche en révision : seuls vos stocks restent modifiables.</p>';
  }

  return blocDeclinaisons(p, {}) + stocks +
    (vs.length ? '' : '<p class="note">Aucune variante : cet article ne peut rien ' +
      'vendre tant que vous n\u2019en créez pas une.</p>') +
    saisie;
}

function formProduit(p) {
  return '<div class="edit">' +
    '<div class="champ"><label for="e-nom-' + esc(p.id) + '">Nom de l\u2019article</label>' +
      '<input id="e-nom-' + esc(p.id) + '" value="' + esc(p.nom) + '"></div>' +
    '<div class="duo">' +
      '<div class="champ"><label for="e-cat-' + esc(p.id) + '">Catégorie</label>' +
        '<select id="e-cat-' + esc(p.id) + '">' +
          categories.map(function (c) {
            return '<option value="' + esc(c.code) + '"' +
              (c.code === p.categorie ? ' selected' : '') + '>' + esc(c.nom_fr) + '</option>';
          }).join('') + '</select></div>' +
      '<div class="champ"><label for="e-prix-' + esc(p.id) + '">Prix de base (HTG)</label>' +
        '<input id="e-prix-' + esc(p.id) + '" inputmode="decimal" value="' +
        esc(enGourdes(p.prix)) + '"></div>' +
    '</div>' +
    '<div class="champ"><label for="e-desc-' + esc(p.id) + '">Description</label>' +
      '<textarea id="e-desc-' + esc(p.id) + '" rows="7" placeholder="Matière, taille réelle, ' +
      'contenance, état, ce qui est inclus\u2026">' + esc(p.description || '') + '</textarea></div>' +
    '<button class="cta" data-enregistrer="' + esc(p.id) + '">Enregistrer</button>' +
    '<button class="ghost" data-annuler="' + esc(p.id) + '">Fermer</button>' +
  '</div>';
}

function carteProduit(p) {
  const e = etatProduit(p);
  const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
  const prix = API.fourchette({ prix: p.prix, variantes: p.variantes });
  const enEdition = produitEnEdition === p.id;
  const modifiable = p.statut === 'brouillon' || p.statut === 'refuse';

  return '<div class="bloc"' + (p.statut === 'refuse' ? ' style="border-color:var(--hot)"' : '') + '>' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill ' + e.c + '">' + esc(e.mot) + '</span></div>' +

    // Le motif du refus, en toutes lettres : c'est lui qui fait corriger.
    (p.statut === 'refuse' && p.commentaire_revision
      ? '<div class="erreur"><strong>À corriger :</strong><br>' +
        esc(p.commentaire_revision) + '</div>'
      : '') +
    (p.statut === 'en_revision'
      ? '<p class="note">Soumise le ' + esc(quand(p.soumis_le)) + '. ' +
        'Boutique Lakay vérifie les photos, le texte et les variantes.</p>'
      : '') +

    (enEdition ? formProduit(p) :
      '<div class="ligne"><span>Prix</span><strong class="num">' +
        (prix.min === prix.max ? htg(prix.min) : htg(prix.min) + ' à ' + htg(prix.max)) +
        '</strong></div>' +
      '<div class="ligne"><span>Stock total</span><strong class="num">' + stock + '</strong></div>' +
      (p.description ? '<div class="note">' + esc(p.description) + '</div>' : '') +
      (modifiable
        ? '<button class="mini" data-editer="' + esc(p.id) + '">Modifier la fiche</button>'
        : '')) +

    blocMedias(p) +
    blocVariantes(p) +
    '<div id="msg-' + esc(p.id) + '"></div>' +
    (modifiable
      ? '<button class="cta" data-soumettre="' + esc(p.id) + '">' +
        (p.statut === 'refuse' ? 'Soumettre à nouveau' : 'Soumettre à Boutique Lakay') +
        '</button>' +
        '<div class="danger"><button class="ghost" data-supprod="' + esc(p.id) +
          '">Supprimer cet article</button></div>'
      : '') +
  '</div>';
}

async function rendreCatalogue() {
  const z = el('panneau');
  if (!boutique) {
    z.innerHTML = '<p class="empty">Aucune boutique rattachée à ce compte.</p>';
    return;
  }
  z.innerHTML = '<div class="sechead"><h2>Mon catalogue</h2></div><p class="empty">\u2026</p>';
  try {
    produits = await OPS.produitsBoutique(boutique.id);
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  const aCorriger = produits.filter(function (p) { return p.statut === 'refuse'; }).length;

  z.innerHTML =
    '<div class="sechead"><h2>Mon catalogue</h2><span class="eyebrow num">' +
      (produits.length || '') + '</span></div>' +
    (aCorriger
      ? '<p class="note" style="color:var(--hot)">' + aCorriger +
        ' article(s) à corriger avant de repasser en vitrine.</p>' : '') +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="titreligne"><h2>Nouvel article</h2></div>' +
        '<div class="champ"><label for="pNom">Nom de l\u2019article</label>' +
          '<input id="pNom" placeholder="T-shirt coton"></div>' +
        '<div class="duo">' +
          '<div class="champ"><label for="pCat">Catégorie</label><select id="pCat">' +
            categories.map(function (c) {
              return '<option value="' + esc(c.code) + '">' + esc(c.nom_fr) + '</option>';
            }).join('') + '</select></div>' +
          '<div class="champ"><label for="pPrix">Prix (HTG)</label>' +
            '<input id="pPrix" inputmode="decimal" placeholder="1200"></div>' +
        '</div>' +
        '<div class="champ"><label for="pDesc">Description</label>' +
          '<textarea id="pDesc" rows="6" placeholder="Matière, taille réelle, contenance, ' +
            'état, ce qui est inclus\u2026"></textarea></div>' +
        '<div id="newProdErr"></div>' +
        '<button class="cta" id="creerProduit">Créer le brouillon</button>' +
        '<p class="note">Vous ajouterez ensuite les photos et les variantes, ' +
          'puis vous soumettrez la fiche. Boutique Lakay vérifie avant la vitrine.</p>' +
      '</div>' +
    '</div>' +
    '<div class="pile" id="listeProduits">' +
      (produits.length ? produits.map(carteProduit).join('')
        : '<p class="empty">Aucun article. Créez le premier ci-dessus.</p>') +
    '</div>';
}

async function rechargerProduits() {
  try {
    produits = await OPS.produitsBoutique(boutique.id);
  } catch (e) { return; }
  const z = el('listeProduits');
  if (z) z.innerHTML = produits.length
    ? produits.map(carteProduit).join('')
    : '<p class="empty">Aucun article. Créez le premier ci-dessus.</p>';
}


/* ---------- Mon argent ------------------------------------ */

async function rendreArgent() {
  const z = el('panneau');
  if (!boutique) {
    z.innerHTML = '<p class="empty">Aucune boutique rattachée à ce compte.</p>';
    return;
  }
  z.innerHTML = '<div class="sechead"><h2>Mon argent</h2></div><p class="empty">…</p>';

  let lignes = [], solde = null;
  try {
    lignes = await OPS.duAuxVendeurs(boutique.id);
    solde = await API.soldeBoutique(boutique.id);
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  const abo = (boutique.abonnements || []).filter(function (a) { return !a.fin; })[0];
  const monPlan = abo ? (plans.filter(function (p) { return p.code === abo.plan; })[0] || null) : null;
  const attente = lignes.filter(function (l) { return !l.regle; });
  const du = attente.reduce(function (s, l) { return s + Number(l.net); }, 0);
  const recu = solde ? Number(solde.libere) : 0;
  const retenu = solde ? Number(solde.commission) : 0;

  z.innerHTML =
    '<div class="sechead"><h2>Mon argent</h2></div>' +
    '<div class="pile">' +
      '<div class="bloc">' +
        '<div class="titreligne"><h2>Ce qui vous est dû</h2></div>' +
        '<div class="ligne"><span>En attente de règlement</span>' +
          '<strong class="num" style="font-size:19px">' + htg(du) + '</strong></div>' +
        '<div class="ligne"><span>Commandes concernées</span>' +
          '<span class="num">' + attente.length + '</span></div>' +
        '<div class="ligne"><span>Déjà reçu</span><span class="num">' + htg(recu) + '</span></div>' +
        '<div class="ligne"><span>Commission retenue</span><span class="num">' +
          htg(retenu) + '</span></div>' +
        '<p class="note">En phase pilote, l’acheteur paie en espèces au comptoir : ' +
          'Flashipping encaisse puis vous reverse, commission déduite.</p>' +
      '</div>' +
    '</div>' +
    '<div class="sechead"><h2 style="font-size:14px">Détail</h2></div>' +
    (lignes.length
      ? '<div class="pile">' + lignes.map(function (l) {
          return '<div class="bloc">' +
            '<div class="titreligne"><span class="oref num">' + esc(l.reference) + '</span>' +
              '<span class="pill ' + (l.regle ? 'gris' : 'ok') + '">' +
              (l.regle ? 'Réglé' : 'À recevoir') + '</span></div>' +
            '<div class="ligne"><span>Retiré le</span><span>' +
              esc(quand(l.retire_le)) + '</span></div>' +
            '<div class="ligne"><span>Montant vendu</span><span class="num">' +
              htg(l.brut) + '</span></div>' +
            '<div class="ligne"><span>Commission</span><span class="num">−' +
              htg(l.commission) + '</span></div>' +
            '<div class="ligne"><span><strong>Pour vous</strong></span>' +
              '<strong class="num">' + htg(l.net) + '</strong></div>' +
          '</div>';
        }).join('') + '</div>'
      : '<p class="empty">Aucune vente retirée pour le moment.</p>');
}

/* ---------- Navigation ------------------------------------ */

function bandeauBoutique() {
  if (!boutique) {
    return '<div class="bloc"><p class="note">Aucune boutique n\u2019est rattachée à ' +
      'ce compte. Si vous venez de vous inscrire, un agent doit d\u2019abord la ' +
      'rattacher.</p></div>';
  }
  if (boutique.statut === 'en_attente') {
    const manque = !boutique.piece_identite_url || !boutique.patente_url;
    return '<div class="bloc" style="border-color:var(--warn)">' +
      '<div class="titreligne"><h2>' + esc(boutique.nom) + '</h2>' +
      '<span class="pill warn">En attente</span></div>' +
      '<p class="note">' + (manque
        ? 'Il manque des pièces. Déposez-les ci-dessous : sans elles, un agent ' +
          'ne peut pas vérifier votre boutique.'
        : 'Un agent vérifie vos pièces puis vous appelle. Vos articles ne sont ' +
          'pas encore visibles des acheteurs.') + '</p>' +
      blocPieces() + '</div>';
  }
  if (boutique.statut === 'suspendue') {
    return '<div class="bloc" style="border-color:var(--hot)">' +
      '<div class="titreligne"><h2>' + esc(boutique.nom) + '</h2>' +
      '<span class="pill ko">Suspendue</span></div>' +
      '<p class="note">Vos articles sont retirés de la vitrine. ' +
      'Contactez Boutique Lakay.</p></div>';
  }
  return '';
}

async function rendre() {
  Array.prototype.forEach.call(document.querySelectorAll('.ong'), function (b) {
    b.setAttribute('aria-selected', b.getAttribute('data-ong') === onglet);
  });
  const avis = bandeauBoutique();
  if (avis) {
    el('panneau').innerHTML = '<div class="pile">' + avis + '</div>';
    if (!boutique || boutique.statut !== 'verifiee') return;
  }
  if (onglet === 'preparer') await rendrePreparer();
  if (onglet === 'catalogue') await rendreCatalogue();
  if (onglet === 'argent') await rendreArgent();
}

/* ---------- Événements ------------------------------------ */

document.addEventListener('click', async function (ev) {
  const c = ev.target.closest ? ev.target.closest('button') : null;
  if (!c) return;

  if (c.classList.contains('ong')) {
    onglet = c.getAttribute('data-ong');
    produitEnEdition = null;
    await rendre();
    return;
  }
  if (c.hasAttribute('data-avancer')) {
    const id = c.getAttribute('data-avancer');
    await agir(c, 'msg-' + id, function () {
      return OPS.avancerCommande(id, c.getAttribute('data-vers'));
    }, rendrePreparer);
    return;
  }
  if (c.hasAttribute('data-voir')) {
    await agir(c, null, function () { return OPS.lienDocument(c.getAttribute('data-voir')); },
      function (url) { if (url) window.open(url, '_blank', 'noopener'); });
    return;
  }
  if (c.hasAttribute('data-remplacer')) {
    remplace = c.getAttribute('data-remplacer');
    await rendre();
    return;
  }
  if (c.hasAttribute('data-editer')) {
    produitEnEdition = c.getAttribute('data-editer');
    await rendreCatalogue();
    return;
  }
  if (c.hasAttribute('data-annuler')) {
    produitEnEdition = null;
    await rendreCatalogue();
    return;
  }
  if (c.hasAttribute('data-enregistrer')) {
    const id = c.getAttribute('data-enregistrer');
    const nom = val('e-nom-' + id);
    const prix = enCentimes(val('e-prix-' + id));
    if (!nom) { msg('msg-' + id, 'Le nom ne peut pas être vide.', 'ko'); return; }
    if (prix <= 0) { msg('msg-' + id, 'Indiquez un prix.', 'ko'); return; }
    await agir(c, 'msg-' + id, function () {
      return OPS.majProduit(id, {
        nom: nom, prix: prix,
        categorie: el('e-cat-' + id).value,
        description: val('e-desc-' + id) || null
      });
    }, async function () { produitEnEdition = null; await rendreCatalogue(); });
    return;
  }

  if (c.id === 'creerProduit') {
    const nom = val('pNom');
    const prix = enCentimes(val('pPrix'));
    if (!nom) { msg('newProdErr', 'Donnez un nom à l\u2019article.', 'ko'); return; }
    if (prix <= 0) { msg('newProdErr', 'Indiquez un prix en gourdes.', 'ko'); return; }
    await agir(c, 'newProdErr', function () {
      return OPS.creerProduit({
        boutique: boutique.id, categorie: el('pCat').value,
        nom: nom, prix: prix, description: val('pDesc')
      });
    }, async function () {
      ['pNom','pPrix','pDesc'].forEach(function (k) { if (el(k)) el(k).value = ''; });
      await rendreCatalogue();
    });
    return;
  }

  // Article sans déclinaison : une seule variante, juste une quantité.
  if (c.hasAttribute('data-ajsimple')) {
    const id = c.getAttribute('data-ajsimple');
    const p = produits.filter(function (x) { return x.id === id; })[0];
    const n = ((p && p.variantes) || []).length;
    // Plusieurs variantes sans déclinaison auraient le même libellé :
    // on les numérote pour que la base les accepte et qu'on les
    // distingue à l'écran.
    const nom = n ? 'Lot ' + (n + 1) : 'Standard';
    await agir(c, 'msg-' + id, function () {
      return OPS.ajouterVariante(id, nom, 0, val('nv-stock-' + id), {});
    }, rechargerProduits);
    return;
  }

  if (c.hasAttribute('data-supvar')) {
    const vid = c.getAttribute('data-supvar');
    const pid = c.getAttribute('data-prod');
    await agir(c, 'msg-' + pid, function () { return OPS.supprimerVariante(vid); },
      rechargerProduits);
    return;
  }

  if (c.hasAttribute('data-supmedia')) {
    const mid = c.getAttribute('data-supmedia');
    const pid = c.getAttribute('data-prod');
    const prod = produits.filter(function (p) { return p.id === pid; })[0];
    const m = prod && (prod.medias || []).filter(function (x) { return x.id === mid; })[0];
    if (!m) return;
    await agir(c, 'msg-' + pid, function () { return OPS.supprimerMedia(m); }, rechargerProduits);
    return;
  }

  if (c.hasAttribute('data-soumettre')) {
    const id = c.getAttribute('data-soumettre');
    await agir(c, 'msg-' + id, function () { return OPS.soumettreProduit(id); },
      async function () {
        msg('msg-' + id, 'Envoyée. Boutique Lakay vérifie et vous répond.', 'ok');
        setTimeout(rechargerProduits, 1200);
      });
    return;
  }

  if (c.hasAttribute('data-supprod')) {
    const id = c.getAttribute('data-supprod');
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer la suppression';
      msg('msg-' + id, 'L\u2019article, ses variantes et ses photos seront supprimés. ' +
        'Appuyez encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return OPS.supprimerProduit(id); },
      async function () { produitEnEdition = null; await rendreCatalogue(); });
    return;
  }
});


document.addEventListener('change', async function (ev) {
  const c = ev.target;
  if (c.hasAttribute('data-vstock')) {
    await agir(null, null, function () {
      return OPS.majVariante(c.getAttribute('data-vstock'),
        { stock: Math.max(0, parseInt(c.value, 10) || 0) });
    });
    return;
  }
  if (c.id === 'docId') {
    await deposerPiece('docId', 'identite', 'msgId', 'piece_identite_url');
    return;
  }
  if (c.id === 'docPatente') {
    await deposerPiece('docPatente', 'patente', 'msgPatente', 'patente_url');
    return;
  }

  if (c.hasAttribute('data-vprix')) {
    const cts = enCentimes(c.value);
    await agir(null, null, function () {
      return OPS.majVariante(c.getAttribute('data-vprix'), { prix: cts > 0 ? cts : null });
    });
    return;
  }

  if (c.hasAttribute('data-photo')) {
    const id = c.getAttribute('data-photo');
    const fichiers = Array.prototype.slice.call(c.files || []);
    if (!fichiers.length) return;
    const prod = produits.filter(function (p) { return p.id === id; })[0] || { medias: [] };
    const dejaImg = (prod.medias || []).filter(function (m) { return (m.type || 'image') === 'image'; }).length;
    const dejaVid = (prod.medias || []).filter(function (m) { return m.type === 'video'; }).length;
    const prog = el('prog-' + id);

    await agir(null, 'msg-' + id, function () {
      return OPS.televerserPlusieurs(id, fichiers, dejaImg, dejaVid,
        function (i, total, nom) {
          if (prog) prog.textContent = 'Envoi ' + i + ' sur ' + total + ' \u2014 ' + nom;
        });
    }, async function (r) {
      if (prog) prog.textContent = '';
      c.value = '';
      if (r.erreurs.length) {
        msg('msg-' + id, (r.envoyes ? r.envoyes + ' envoyé(s). ' : '') +
          r.erreurs.join(' \u00b7 '), 'ko');
      } else {
        msg('msg-' + id, r.envoyes + ' média(s) ajouté(s).', 'ok');
      }
      await rechargerProduits();
    });
    return;
  }
});

/* ---------- Démarrage ------------------------------------- */

brancherDeclinaisons(
  function (id) { return produits.filter(function (p) { return p.id === id; })[0]; },
  rechargerProduits
);

EQUIPE.brancher(['vendeur', 'admin'], async function () {
  boutique = await API.maBoutique().catch(function () { return null; });
  categories = (await API.categories().catch(function () { return { data: [] }; })).data || [];
  plans = await OPS.plans().catch(function () { return []; });
  await rendre();
  if (onglet !== 'preparer') await compterAPreparer();
  // Ses messages sont marqués lus à l'ouverture : la file garde la
  // trace pour le jour où un SMS part vraiment, mais elle n'a pas à
  // s'empiler alors que la pastille dit déjà l'essentiel.
  API.marquerMessagesLus('vendeur').catch(function () {});
}, { ouAvecBoutique: true });
