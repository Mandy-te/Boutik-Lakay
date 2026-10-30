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

function carteProduit(p) {
  const stock = (p.variantes || []).reduce(function (n, v) { return n + (v.stock || 0); }, 0);
  const pub = p.statut === 'publie';
  const photos = (p.medias || []).filter(function (m) { return (m.type || 'image') === 'image'; });
  const prix = API.fourchette({ prix: p.prix, variantes: p.variantes });
  const enEdition = produitEnEdition === p.id;

  const variantes = (p.variantes || []).map(function (v) {
    return '<div class="vrow">' +
      '<div class="champ lib"><label>' + esc(v.libelle) + '</label>' +
        '<input class="num" type="number" min="0" value="' + (v.stock || 0) +
        '" data-vstock="' + esc(v.id) + '"></div>' +
      '<div class="champ"><label>Prix</label>' +
        '<input value="' + esc(enGourdes(v.prix) || enGourdes(p.prix)) + '" disabled></div>' +
    '</div>';
  }).join('');

  return '<div class="bloc">' +
    '<div class="titreligne"><h2>' + esc(p.nom) + '</h2>' +
      '<span class="pill ' + (pub ? 'ok' : (p.statut === 'suspendu' ? 'ko' : 'gris')) + '">' +
      esc(pub ? 'En vitrine' : (p.statut === 'suspendu' ? 'Suspendu' : 'Brouillon')) +
      '</span></div>' +
    '<div class="ligne"><span>Prix</span><strong class="num">' +
      (prix.min === prix.max ? htg(prix.min) : htg(prix.min) + ' à ' + htg(prix.max)) +
      '</strong></div>' +
    '<div class="ligne"><span>Stock</span><strong class="num">' + stock + '</strong></div>' +
    (photos.length
      ? '<div class="vignettes">' + photos.map(function (m) {
          return '<div class="media"><img class="vignette" src="' +
            esc(API.photoUrl(m.chemin)) + '" alt="" loading="lazy"></div>';
        }).join('') + '</div>'
      : '<div class="note">Aucune photo. Envoyez-les à Boutique Lakay : ' +
        'c’est l’équipe qui publie, et sans photo rien ne part en vitrine.</div>') +

    (enEdition
      ? '<div class="edit">' +
          '<div class="champ"><label for="e-desc-' + esc(p.id) + '">Description</label>' +
            '<textarea id="e-desc-' + esc(p.id) + '" rows="6">' +
            esc(p.description || '') + '</textarea></div>' +
          '<button class="cta" data-enregistrer="' + esc(p.id) + '">Enregistrer</button>' +
          '<button class="ghost" data-annuler="' + esc(p.id) + '">Annuler</button>' +
        '</div>'
      : (p.description ? '<div class="note">' + esc(p.description) + '</div>' : '') +
        '<button class="mini" data-editer="' + esc(p.id) + '">Modifier la description</button>') +

    variantes +
    '<div id="msg-' + esc(p.id) + '"></div>' +
  '</div>';
}

async function rendreCatalogue() {
  const z = el('panneau');
  if (!boutique) {
    z.innerHTML = '<p class="empty">Aucune boutique n’est rattachée à ce compte. ' +
      'Demandez à un administrateur de vous en attribuer une.</p>';
    return;
  }
  z.innerHTML = '<div class="sechead"><h2>Mon catalogue</h2></div><p class="empty">…</p>';
  try {
    produits = await OPS.produitsBoutique(boutique.id);
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }
  z.innerHTML =
    '<div class="sechead"><h2>Mon catalogue</h2><span class="eyebrow num">' +
      (produits.length || '') + '</span></div>' +
    '<p class="note">Vous pouvez corriger une description et ajuster vos stocks. ' +
      'La publication et les prix passent par Boutique Lakay.</p>' +
    (produits.length
      ? '<div class="pile">' + produits.map(carteProduit).join('') + '</div>'
      : '<p class="empty">Aucun article. Contactez Boutique Lakay pour les saisir.</p>');
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
    await agir(c, 'msg-' + id, function () {
      return OPS.majProduit(id, { description: val('e-desc-' + id) || null });
    }, async function () { produitEnEdition = null; await rendreCatalogue(); });
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
});

/* ---------- Démarrage ------------------------------------- */

EQUIPE.brancher(['vendeur', 'admin'], async function () {
  boutique = await API.maBoutique().catch(function () { return null; });
  categories = (await API.categories().catch(function () { return { data: [] }; })).data || [];
  await rendre();
}, { ouAvecBoutique: true });
