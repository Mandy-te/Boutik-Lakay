/* ============================================================
   Boutique Lakay — le comptoir, partagé

   L'agent et l'administrateur font exactement le même geste sur un
   colis : appeler le client, l'embarquer avec son numéro de suivi,
   le déclarer arrivé, encaisser contre le code, annuler.

   Ce fichier porte cette logique UNE fois. L'écran agent et l'onglet
   Comptoir de l'administration l'utilisent tel quel. Dupliquer ces
   boutons dans deux fichiers, c'est garantir qu'un jour l'un des
   deux laissera sauter une étape que l'autre interdit.

   Dépend de equipe.js (el, esc, htg, quand, dansCombien, msg, agir,
   pastilleStatut) et de ops.js (OPS).
   ============================================================ */

const COMPTOIR = (function () {

  // Appelée après chaque action réussie. Chaque écran donne la sienne.
  let rafraichir = function () {};

  function brancher(cb) { rafraichir = cb || function () {}; }

  /* Ce que le client paie pour CE colis : ses articles, plus le frais
     de son trajet. Pas le total de la commande — les autres colis se
     paient à leur propre retrait. */
  function montantColis(k) {
    return (k.lignes || []).reduce(function (s, l) {
      return l.annule_le ? s : s + l.prix_unitaire * l.quantite;
    }, 0) + Number(k.frais || 0);
  }

  function articles(k) {
    return (k.lignes || []).map(function (l) {
      // Une part retirée reste visible, barrée : l'agent au comptoir
      // doit savoir qu'elle a été commandée et pourquoi elle n'est pas
      // dans le carton, sinon il cherchera un article qui n'existe pas.
      if (l.annule_le) {
        return '<s>' + esc(l.nom_produit) + (l.libelle ? ' · ' + esc(l.libelle) : '') +
          ' ×' + l.quantite + '</s> <span class="pill ko">retiré</span>' +
          (l.motif_annulation ? ' <span class="cshop">' + esc(l.motif_annulation) + '</span>' : '');
      }
      return esc(l.nom_produit) + (l.libelle ? ' · ' + esc(l.libelle) : '') +
        ' <span class="num">×' + l.quantite + '</span>' +
        (l.prete_le ? ' <span class="pill done">remis</span>' : '');
    }).join('<br>');
  }

  function carteColis(k) {
    const o = k.commande || {};
    const p = pastilleStatut(k.statut);
    const ab = o.acheteur && o.acheteur.abandons ? o.acheteur.abandons : 0;
    const suivante = OPS.etapeSuivante(k.statut);
    // Une ligne retirée ne compte plus : ni dans ce qu'on attend, ni
    // dans ce qu'on encaisse.
    const vivantes = (k.lignes || []).filter(function (l) { return !l.annule_le; });
    const vendeurs = {};
    const enRetard = [];
    vivantes.forEach(function (l) {
      if (!l.boutique) return;
      vendeurs[l.boutique.nom] = l.prete_le ? 'prêt' : 'en attente';
      if (!l.prete_le && !enRetard.some(function (b) { return b.id === l.boutique.id; })) {
        enRetard.push(l.boutique);
      }
    });
    const montant = montantColis(k);

    let actions = '';

    if (k.statut === 'recue') {
      actions += '<p class="note">Appelle le client et confirme avec lui. Rien ne ' +
        'quitte la boutique avant : c’est ce qui évite les colis immobilisés ' +
        'pour un client qui ne viendra jamais. L’appel vaut pour TOUS les colis ' +
        'de la commande.</p>' +
        (o.acheteur && o.acheteur.telephone
          ? '<a class="cta ghost" href="tel:' + esc(o.acheteur.telephone) + '">Appeler ' +
            esc(o.acheteur.nom || 'le client') + '</a>'
          : '') +
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
        /* Un vendeur qui ne remet jamais sa part bloquerait le colis
           pour toujours, et annuler le colis entier punirait ceux qui
           ont déjà remis. On sort la part manquante : son montant est
           déduit, l'acheteur est prévenu, le reste continue. */
        enRetard.forEach(function (b) {
          actions += '<button class="ghost" data-retirer="' + esc(k.id) +
            '" data-boutique="' + esc(b.id) + '" data-nom="' + esc(b.nom) + '">' +
            'Retirer la part de ' + esc(b.nom) + '</button>';
        });
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
        ? '<div class="ligne"><span>Téléphone</span>' +
          '<a class="tel num" href="tel:' + esc(o.acheteur.telephone) + '">' +
          esc(o.acheteur.telephone) + '</a></div>' : '') +
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
      '<div class="note">' + articles(k) + '</div>' +
      '<div class="ligne"><span>À encaisser pour ce colis</span>' +
        '<strong class="num">' + htg(montant) + '</strong></div>' +
      '<div id="msg-' + esc(k.id) + '"></div>' +
      actions +
    '</div>';
  }

  /* Les quatre files de travail, dans l'ordre d'urgence : un client
     devant le comptoir passe avant un colis qui attend son camion. */
  function files(liste) {
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

    return (liste.length ? '' : '<p class="empty">Rien à traiter pour le moment.</p>') +
      section('Au comptoir', auComptoir) +
      section('À appeler', aAppeler,
        'Un seul appel par commande : il confirme tous ses colis d’un coup.') +
      section('En route', enCours) +
      section('Retirés — vendeur à régler', aRegler,
        'L’argent est encaissé. Le règlement du vendeur se fait dans l’onglet Règlements.');
  }

  /* ---------- Les gestes ---------------------------------- */

  document.addEventListener('click', async function (ev) {
    const c = ev.target.closest ? ev.target.closest('button') : null;
    if (!c) return;

    // L'appel de confirmation vaut pour toute la commande : on appelle
    // le client une fois, pas une fois par colis.
    if (c.hasAttribute('data-confirmer')) {
      const idCmd = c.getAttribute('data-confirmer');
      const bloc = c.closest('.bloc');
      const zone = bloc ? bloc.querySelector('[id^="msg-"]') : null;
      const idZone = zone ? zone.id : null;
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

    /* Retirer la part d'un vendeur. Deux appuis, comme pour une
       annulation : c'est un article qui sort de la commande et un
       montant qui baisse. */
    if (c.hasAttribute('data-retirer')) {
      const id = c.getAttribute('data-retirer');
      const bId = c.getAttribute('data-boutique');
      const nom = c.getAttribute('data-nom') || 'ce vendeur';
      if (c.dataset.sur !== '1') {
        c.dataset.sur = '1';
        c.textContent = 'Confirmer : retirer la part de ' + nom;
        msg('msg-' + id, 'Les articles de ' + nom + ' retournent dans son stock, ' +
          'leur montant est d\u00e9duit de ce que le client paiera, et le client est ' +
          'pr\u00e9venu. Le reste du colis continue. Appuie encore pour confirmer.', 'ko');
        return;
      }
      await agir(c, 'msg-' + id, function () {
        return OPS.retirerPartVendeur(id, bId, 'Article indisponible chez ' + nom);
      }, function (r) {
        msg('msg-' + id, r.colis_annule
          ? 'Part retir\u00e9e. Plus aucun article disponible : le colis a \u00e9t\u00e9 annul\u00e9.'
          : 'Part retir\u00e9e, ' + htg(r.montant) + ' d\u00e9duits du total. ' +
            (r.colis_pret ? 'Le colis est maintenant pr\u00eat \u00e0 partir.'
                          : 'Il reste ' + r.restant + ' article(s) \u00e0 remettre.'), 'ok');
        setTimeout(rafraichir, 1800);
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

  return {
    brancher: brancher,
    carteColis: carteColis,
    montantColis: montantColis,
    files: files
  };
})();
