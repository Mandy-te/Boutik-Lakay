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
let trouvee = null;

/* ---------- Carte d'une commande -------------------------- */

function carteCommande(o) {
  const p = pastilleStatut(o.statut);
  const ab = o.acheteur && o.acheteur.abandons ? o.acheteur.abandons : 0;
  const suivante = OPS.etapeSuivante(o.statut);
  const origines = {};
  (o.lignes || []).forEach(function (l) {
    if (l.boutique) origines[l.boutique.nom] = l.boutique.commune;
  });

  let actions = '';

  if (o.statut === 'recue') {
    actions += '<p class="note">Appelle le client et confirme avec lui. Le colis ne ' +
      'doit pas quitter la boutique avant : c’est ce qui évite les colis ' +
      'immobilisés pour un client qui ne viendra jamais.</p>';
  }

  if (o.statut === 'au_point_retrait') {
    const retard = o.expire_le && new Date(o.expire_le) < Date.now();
    actions +=
      (o.expire_le ? '<div class="' + (retard ? 'retard' : 'note') + '">' +
        esc(dansCombien(o.expire_le)) + '</div>' : '') +
      '<div class="champ"><label for="code-' + esc(o.id) + '">Code de retrait du client</label>' +
        '<input class="codein" id="code-' + esc(o.id) + '" inputmode="numeric" ' +
        'maxlength="6" placeholder="------"></div>' +
      '<button class="cta vert" data-valider="' + esc(o.id) + '">Encaisser ' +
        htg(o.total) + ' et remettre</button>';
  } else if (suivante) {
    // Le colis entre dans le réseau Flashipping : son numéro de suivi est
    // ce que l'acheteur utilisera pour le suivre de son côté.
    if (suivante.code === 'en_transit') {
      actions += '<div class="champ"><label for="suivi-' + esc(o.id) + '">' +
        'Numéro de suivi Flashipping</label>' +
        '<input id="suivi-' + esc(o.id) + '" placeholder="FS-2026-00841" ' +
        'autocapitalize="characters"></div>' +
        '<p class="note">Obligatoire : sans lui, l’acheteur n’a rien à suivre.</p>';
    }
    if (suivante.code === 'en_preparation' || suivante.code === 'prete') {
      actions += '<p class="note">Normalement c’est le vendeur qui déclare ces ' +
        'étapes depuis son espace. Ne les coche à sa place qu’après l’avoir eu ' +
        'au téléphone.</p>';
    }
    actions += '<button class="cta" data-avancer="' + esc(o.id) + '" data-vers="' +
      esc(suivante.code) + '">' + esc(suivante.nom) + '</button>';
  }

  if (OPS.rangEtape(o.statut) >= 0 && o.statut !== 'code_valide' && o.statut !== 'cloturee') {
    actions += '<button class="ghost" data-abandon="' + esc(o.id) + '">' +
      (o.statut === 'au_point_retrait' ? 'Non retiré — annuler'
        : (o.statut === 'recue' ? 'Injoignable — annuler' : 'Annuler la commande')) +
      '</button>';
  }

  return '<div class="bloc">' +
    '<div class="titreligne"><span class="oref num">' + esc(o.reference) + '</span>' +
      '<span class="pill ' + p.c + '">' + esc(p.mot) + '</span>' +
      (ab >= 1 ? '<span class="pill ko">' + ab + ' abandon' + (ab > 1 ? 's' : '') + '</span>' : '') +
    '</div>' +
    '<div class="ligne"><span>Client</span><strong>' +
      esc(o.acheteur ? o.acheteur.nom : '—') + '</strong></div>' +
    (o.acheteur && o.acheteur.telephone
      ? '<div class="ligne"><span>Téléphone</span><span class="tel num">' +
        esc(o.acheteur.telephone) + '</span></div>' : '') +
    '<div class="ligne"><span>Retrait</span><strong>' +
      esc(o.point ? o.point.nom : '—') + '</strong></div>' +
    (Object.keys(origines).length
      ? '<div class="ligne"><span>Part de</span><span>' +
        Object.keys(origines).map(function (n) {
          return esc(n) + ' (' + esc(origines[n]) + ')';
        }).join(', ') + '</span></div>' : '') +
    '<div class="ligne"><span>Commandée</span><span>' + esc(quand(o.cree_le)) + '</span></div>' +
    (o.numero_suivi ? '<div class="ligne"><span>Suivi Flashipping</span>' +
      '<strong class="num">' + esc(o.numero_suivi) + '</strong></div>' : '') +
    '<div class="note">' + ligneArticles(o) + '</div>' +
    '<div class="ligne"><span>À encaisser</span><strong class="num">' + htg(o.total) + '</strong></div>' +
    '<div id="msg-' + esc(o.id) + '"></div>' +
    actions +
  '</div>';
}

/* ---------- Comptoir -------------------------------------- */

async function rendreComptoir() {
  const z = el('panneau');
  z.innerHTML = '<div class="sechead"><h2>Comptoir</h2></div><p class="empty">…</p>';
  let liste;
  try {
    liste = await OPS.commandesOuvertes();
  } catch (e) {
    z.innerHTML = '<div class="erreur">' + esc(e.message) + '</div>';
    return;
  }

  // L'ordre des files suit l'ordre d'urgence : un client devant le
  // comptoir passe avant un colis qui attend son camion.
  const auComptoir = liste.filter(function (o) { return o.statut === 'au_point_retrait'; });
  const aAppeler   = liste.filter(function (o) { return o.statut === 'recue'; });
  const enCours    = liste.filter(function (o) {
    return ['confirmee', 'en_preparation', 'prete', 'en_transit'].indexOf(o.statut) !== -1; });
  const aRegler    = liste.filter(function (o) { return o.statut === 'code_valide'; });

  function section(titre, items, note) {
    if (!items.length) return '';
    return '<div class="sechead"><h2 style="font-size:14px">' + titre + '</h2>' +
      '<span class="eyebrow num">' + items.length + '</span></div>' +
      (note ? '<p class="note">' + note + '</p>' : '') +
      '<div class="pile">' + items.map(carteCommande).join('') + '</div>';
  }

  z.innerHTML =
    '<div class="sechead"><h2>Comptoir</h2><span class="eyebrow num">' +
      liste.length + ' en cours</span></div>' +
    (liste.length ? '' : '<p class="empty">Rien à traiter pour le moment.</p>') +
    section('Au comptoir', auComptoir) +
    section('À appeler', aAppeler) +
    section('En route', enCours) +
    section('Retirées — vendeur à régler', aRegler,
      'L’argent est encaissé. Le règlement du vendeur se fait côté administration.');
}

/* ---------- Recherche ------------------------------------- */

async function rendreRecherche() {
  el('panneau').innerHTML =
    '<div class="sechead"><h2>Rechercher</h2></div>' +
    '<p class="note">Un client au téléphone, une référence sur un colis : ' +
      'tape-la pour retrouver la commande, même déjà close.</p>' +
    '<div class="pile"><div class="bloc">' +
      '<div class="champ"><label for="ref">Référence</label>' +
        '<input id="ref" placeholder="BL-4489" autocapitalize="characters"></div>' +
      '<div id="chercheErr"></div>' +
      '<button class="cta" id="chercher">Chercher</button>' +
    '</div></div>' +
    '<div class="pile" id="resultat">' +
      (trouvee ? carteCommande(trouvee) : '') + '</div>';
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
  else if (trouvee) {
    trouvee = await OPS.chercherCommande(trouvee.reference).catch(function () { return trouvee; });
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
    await agir(c, 'chercheErr', function () { return OPS.chercherCommande(ref); },
      async function (o) {
        trouvee = o;
        if (!o) { msg('chercheErr', 'Aucune commande avec cette référence.', 'ko'); }
        el('resultat').innerHTML = o ? carteCommande(o) : '';
      });
    return;
  }

  if (c.hasAttribute('data-avancer')) {
    const id = c.getAttribute('data-avancer');
    const vers = c.getAttribute('data-vers');
    const champ = el('suivi-' + id);
    const num = champ ? champ.value.trim() : '';
    if (vers === 'en_transit' && !num) {
      msg('msg-' + id, 'Saisis le numéro de suivi Flashipping avant d’embarquer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () {
      return OPS.avancerCommande(id, vers, num);
    }, rafraichir);
    return;
  }

  if (c.hasAttribute('data-valider')) {
    const id = c.getAttribute('data-valider');
    const champ = el('code-' + id);
    const code = champ ? champ.value.trim() : '';
    if (code.length !== 6) {
      msg('msg-' + id, 'Entre les 6 chiffres du code du client.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return OPS.validerRetrait(id, code); },
      function (r) {
        msg('msg-' + id, 'Encaissé ' + htg(r.total) +
          (r.en_retard ? ' (retrait en retard)' : '') + '. Colis remis.', 'ok');
        setTimeout(rafraichir, 1400);
      });
    return;
  }

  if (c.hasAttribute('data-abandon')) {
    const id = c.getAttribute('data-abandon');
    // Deux appuis : l'annulation remet le stock et compte contre le client,
    // ce qui le rapproche du prépaiement obligatoire. Trop lourd pour un
    // seul appui sur un téléphone tenu à une main en servant quelqu'un.
    if (c.dataset.sur !== '1') {
      c.dataset.sur = '1';
      c.textContent = 'Confirmer l’annulation';
      msg('msg-' + id, 'Les articles retournent en stock et un abandon est compté ' +
        'au client. Appuie encore pour confirmer.', 'ko');
      return;
    }
    await agir(c, 'msg-' + id, function () { return OPS.marquerAbandon(id, 'Non retiré'); },
      function (n) {
        msg('msg-' + id, 'Annulée. Ce client totalise ' + n + ' abandon(s).', 'ok');
        setTimeout(rafraichir, 1400);
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
