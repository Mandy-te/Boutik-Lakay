/* ============================================================
   Boutique Lakay — comptoir

   L'écran d'un agent debout derrière un comptoir, un téléphone
   dans une main. Une commande, une action possible, pas de menu
   à explorer.

   Ce qu'il fait : appeler le client, embarquer le colis avec son
   numéro de suivi, le déclarer arrivé, encaisser contre le code,
   annuler quand le client ne vient pas.

   Ce qu'il ne fait pas : créer un vendeur, fixer un prix ou un
   tarif, supprimer quoi que ce soit, régler un vendeur. Un agent
   qui peut tout faire est un agent à qui on peut tout reprocher.
   ============================================================ */

let onglet = 'comptoir';
let trouves = [];

/* ---------- Carte d'un colis ------------------------------
   L'agent ne travaille plus sur une commande mais sur un COLIS :
   c'est le colis qui part d'une ville, qui porte un numéro de suivi,
   qui arrive au comptoir et qui s'encaisse. Une commande partie de
   trois villes donne trois cartes, chacune avec son avancement. */

function montantColis(k) {
  return (k.lignes || []).reduce(function (s, l) {
    return s + l.prix_unitaire * l.quantite;
  }, 0) + Number(k.frais || 0);
}

function carteColis(k) {
  const o = k.commande || {};
  const p = pastilleStatut(k.statut);
  const ab = o.acheteur && o.acheteur.abandons ? o.acheteur.abandons : 0;
  const suivante = OPS.etapeSuivante(k.statut);
  const vendeurs = {};
  (k.lignes || []).forEach(function (l) {
    if (l.boutique) vendeurs[l.boutique.nom] = l.prete_le ? 'prêt' : 'en attente';
  });
  const montant = montantColis(k);

  let actions = '';

  if (k.statut === 'recue') {
    actions += '<p class="note">Appelle le client et confirme avec lui. Rien ne ' +
      'quitte la boutique avant : c’est ce qui évite les colis immobilisés ' +
      'pour un client qui ne viendra jamais. L’appel vaut pour TOUS les colis ' +
      'de la commande.</p>' +
      '<button class="cta" data-confirmer="' + esc(o.id) + '">' +
        'Confirmée par téléphone</button>';
  } else if (k.statut === 'au_point_retrait') {
    const retard = k.expire_le && new Date(k.expire_le) < Date.now();
    actions +=
      (k.expire_le ? '<div class="' + (retard ? 'retard' : 'note') + '">' +
        esc(dansCombien(k.expire_le)) + '</div>' : '') +
      '<div class="champ"><label for="code-' + esc(k.id) + '">Code de retrait de CE colis</label>' +
        '<input class="codein" id="code-' + esc(k.id) + '" inputmode="numeric" ' +
        'maxlength="6" placeholder="------"></div>' +
      '<p class="note">Chaque colis a son propre code. Celui d’un autre colis ' +
        'de la même commande ne marchera pas ici.</p>' +
      '<button class="cta vert" data-valider="' + esc(k.id) + '">Encaisser ' +
        htg(montant) + ' et remettre</button>';
  } else if (suivante) {
    // Le colis entre dans le réseau Flashipping : son numéro de suivi est
    // ce que l'acheteur utilisera pour le suivre de son côté.
    if (suivante.code === 'en_transit') {
      actions += '<div class="champ"><label for="suivi-' + esc(k.id) + '">' +
        'Numéro de suivi Flashipping de ce colis</label>' +
        '<input id="suivi-' + esc(k.id) + '" placeholder="FS-2026-00841" ' +
        'autocapitalize="characters"></div>' +
        '<p class="note">Obligatoire, et propre à ce colis : sans lui, ' +
        'l’acheteur n’a rien à suivre.</p>';
    }
    if (suivante.code === 'en_preparation' || suivante.code === 'prete') {
      actions += '<p class="note">Normalement ce sont les vendeurs qui déclarent ' +
        'ces étapes depuis leur espace. Le colis ne passe « prêt » que lorsque ' +
        'TOUS les vendeurs de la ville ont remis leur part.</p>';
    }
    actions += '<button class="cta" data-avancer="' + esc(k.id) + '" data-vers="' +
      esc(suivante.code) + '">' + esc(suivante.nom) + '</button>';
  }

  if (OPS.rangEtape(k.statut) >= 0 && k.statut !== 'code_valide' && k.statut !== 'cloturee') {
    actions += '<button class="ghost" data-abandon="' + esc(k.id) + '" data-faute="' +
      (k.statut === 'au_point_retrait' ? '1' : '0') + '">' +
      (k.statut === 'au_point_retrait' ? 'Non retiré — annuler ce colis'
        : 'Annuler ce colis') + '</button>';
  }

  return '<div class="bloc">' +
    '<div class="titreligne"><span class="oref num">' + esc(o.reference || '—') + '</span>' +
      '<span class="pill ' + p.c + '">' + esc(p.mot) + '</span>' +
      (ab >= 1 ? '<span class="pill ko">' + ab + ' abandon' + (ab > 1 ? 's' : '') + '</span>' : '') +
    '</div>' +
    '<div class="ligne"><span>Colis</span><strong>n° ' + k.rang + ' · part de ' +
      esc(k.commune_origine) + '</strong></div>' +
    '<div class="ligne"><span>Client</span><strong>' +
      esc(o.acheteur ? o.acheteur.nom : '—') + '</strong></div>' +
    (o.acheteur && o.acheteur.telephone
      ? '<div class="ligne"><span>Téléphone</span><span class="tel num">' +
        esc(o.acheteur.telephone) + '</span></div>' : '') +
    '<div class="ligne"><span>Retrait</span><strong>' +
      esc(o.point ? o.point.nom : '—') + '</strong></div>' +
    (Object.keys(vendeurs).length
      ? '<div class="ligne"><span>Vendeurs</span><span>' +
        Object.keys(vendeurs).map(function (n) {
          return esc(n) + ' (' + esc(vendeurs[n]) + ')';
        }).join(', ') + '</span></div>' : '') +
    '<div class="ligne"><span>Commandée</span><span>' + esc(quand(o.cree_le)) + '</span></div>' +
    (k.numero_suivi ? '<div class="ligne"><span>Suivi Flashipping</span>' +
      '<strong class="num">' + esc(k.numero_suivi) + '</strong></div>' : '') +
    '<div class="note">' + ligneArticles(k) + '</div>' +
    '<div class="ligne"><span>À encaisser pour ce colis</span>' +
      '<strong class="num">' + htg(montant) + '</strong></div>' +
    '<div id="msg-' + esc(k.id) + '"></div>' +
    actions +
  '</div>';
}

/* ---------- Comptoir -------------------------------------- */

async function rendreComptoir() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Comptoir</h2></div><p class="empty">…</p>';
  let liste;
  try {
    liste = await OPS.colisOuverts();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  // L'ordre des files suit l'ordre d'urgence : un client devant le
  // comptoir passe avant un colis qui attend son camion.
  const auComptoir = liste.filter(function (k) { return k.statut === 'au_point_retrait'; });
  const aAppeler   = liste.filter(function (k) { return k.statut === 'recue'; });
  const enCours    = liste.filter(function (k) {
    return ['confirmee', 'en_preparation', 'prete', 'en_transit'].indexOf(k.statut) !== -1; });
  const aRegler    = liste.filter(function (k) { return k.statut === 'code_valide'; });

  function section(titre, items, note) {
    if (!items.length) return '';
    return '<div class="sechead"><h2 style="font-size:14px">' + titre + '</h2>' +
      '<span class="eyebrow num">' + items.length + '</span></div>' +
      (note ? '<p class="note">' + note + '</p>' : '') +
      '<div class="pile">' + items.map(carteColis).join('') + '</div>';
  }

  z.innerHTML =
    '<div class="sechead"><h2>Comptoir</h2><span class="eyebrow num">' +
      liste.length + ' colis en cours</span></div>' +
    (liste.length ? '' : '<p class="empty">Rien à traiter pour le moment.</p>') +
    section('Au comptoir', auComptoir) +
    section('À appeler', aAppeler,
      'Un seul appel par commande : il confirme tous ses colis d’un coup.') +
    section('En route', enCours) +
    section('Retirés — vendeur à régler', aRegler,
      'L’argent est encaissé. Le règlement du vendeur se fait côté administration.');
}

/* ---------- Recherche ------------------------------------- */

async function rendreRecherche() {
  el('panneau').innerHTML =
    '<div class="sechead"><h2>Rechercher</h2></div>' +
    '<p class="note">Un client au téléphone, une référence sur un colis : ' +
      'tape-la pour retrouver la commande, même déjà close. Tous ses colis ' +
      'apparaissent, chacun avec son avancement.</p>' +
    '<div class="pile"><div class="bloc">' +
      '<div class="champ"><label for="ref">Référence</label>' +
        '<input id="ref" placeholder="BL-4489" autocapitalize="characters"></div>' +
      '<div id="chercheErr"></div>' +
      '<button class="cta" id="chercher">Chercher</button>' +
    '</div></div>' +
    '<div class="pile" id="resultat">' +
      trouves.map(carteColis).join('') + '</div>';
}

/* ---------- Navigation ------------------------------------ */

async function rendre() {
  Array.prototype.forEach.call(document.querySelectorAll('.ong'), function (b) {
    b.setAttribute('aria-selected', b.getAttribute('data-ong') === onglet);
  });
  if (onglet === 'comptoir') await rendreComptoir();
  if (onglet === 'recherche') await rendreRecherche();
}

async function rafraichir() {
  if (onglet === 'comptoir') await rendreComptoir();
  else if (trouves.length) {
    const ref = trouves[0].commande ? trouves[0].commande.reference : '';
    trouves = await OPS.chercherColis(ref).catch(function () { return trouves; });
    await rendreRecherche();
  }
}

/* ---------- Événements ------------------------------------ */

document.addEventListener('click', async function (ev) {
  const c = ev.target.closest ? ev.target.closest('button') : null;
  if (!c) return;

  if (c.classList.contains('ong')) {
    onglet = c.getAttribute('data-ong');
    await rendre();
    return;
  }

  if (c.id === 'chercher') {
    const ref = val('ref');
    if (!ref) { msg('chercheErr', 'Entre une référence.', 'ko'); return; }
    await agir(c, 'chercheErr', function () { return OPS.chercherColis(ref); },
      async function (liste) {
        trouves = liste || [];
        if (!trouves.length) { msg('chercheErr', 'Aucune commande avec cette référence.', 'ko'); }
        el('resultat').innerHTML = trouves.map(carteColis).join('');
      });
    return;
  }

  // L'appel de confirmation vaut pour toute la commande : on appelle
  // le client une fois, pas une fois par colis.
  if (c.hasAttribute('data-confirmer')) {
    const idCmd = c.getAttribute('data-confirmer');
    const bloc = c.closest('.bloc');
    const zone = bloc ? bloc.querySelector('[id^="msg-"]') : null;
    const idZone = zone ? zone.id : 'chercheErr';
    await agir(c, idZone, function () { return OPS.confirmerTelephone(idCmd); }, rafraichir);
    return;
  }

  if (c.hasAttribute('data-avancer')) {
    const id = c.getAttribute('data-avancer');
    const vers = c.getAttribute('data-vers');
    const champ = el('suivi-' + id);
    const num = champ ? champ.value.trim() : '';
    if (vers === 'en_transit' && !num) {
      msg('msg-' + id, 'Saisis le numéro de suivi Flashipping de ce colis avant d’embarquer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () {
      return OPS.avancerColis(id, vers, num);
    }, rafraichir);
    return;
  }

  if (c.hasAttribute('data-valider')) {
    const id = c.getAttribute('data-valider');
    const champ = el('code-' + id);
    const code = champ ? champ.value.trim() : '';
    if (code.length !== 6) {
      msg('msg-' + id, 'Entre les 6 chiffres du code de CE colis.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return OPS.validerRetrait(id, code); },
      function (r) {
        msg('msg-' + id, 'Encaissé ' + htg(r.montant) +
          (r.en_retard ? ' (retrait en retard)' : '') + '. Colis remis.' +
          (r.restants ? ' Il reste ' + r.restants + ' colis à venir sur cette commande.' : ''), 'ok');
        setTimeout(rafraichir, 1600);
      });
    return;
  }

  if (c.hasAttribute('data-abandon')) {
    const id = c.getAttribute('data-abandon');
    // fauteAcheteur n'est vrai que si le colis est AU COMPTOIR et que le
    // client n'est pas venu. Un vendeur qui ne prépare pas ou un colis
    // perdu ne doivent rien coûter à l'acheteur.
    const faute = c.getAttribute('data-faute') === '1';
    // Deux appuis : l'annulation remet le stock. Trop lourd pour un seul
    // appui sur un téléphone tenu à une main en servant quelqu'un.
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer l’annulation de ce colis';
      msg('msg-' + id, 'Les articles de CE colis retournent en stock et son ' +
        'montant sort du total. Les autres colis de la commande continuent.' +
        (faute ? ' Un abandon sera compté au client.' : '') +
        ' Appuie encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () {
      return OPS.annulerColis(id, faute ? 'Non retiré' : 'Colis non livré', faute);
    }, function (r) {
      msg('msg-' + id, 'Colis annulé.' +
        (faute ? ' Ce client totalise ' + r.abandons + ' abandon(s).' : '') +
        (r.colis_restants ? ' ' + r.colis_restants + ' colis restent sur cette commande.'
                          : ' Plus aucun colis sur cette commande.'), 'ok');
      setTimeout(rafraichir, 1600);
    });
    return;
  }
});

document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Enter' && ev.target.id === 'ref') {
    const b = el('chercher');
    if (b) b.click();
  }
});

/* ---------- Démarrage ------------------------------------- */

EQUIPE.brancher(['agent', 'admin'], rendre);
