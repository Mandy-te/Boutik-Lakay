/* ============================================================
   Konbit Market — comptoir

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

/* L'agent ne travaille pas sur une commande mais sur un COLIS : c'est
   le colis qui part d'une ville, porte un numéro de suivi, arrive au
   comptoir et s'encaisse. Une commande partie de trois villes donne
   trois cartes, chacune avec son avancement.

   Les cartes et les gestes vivent dans comptoir.js, partagés avec
   l'onglet Comptoir de l'administration : le même geste ne doit pas
   exister en deux exemplaires. */

let onglet = 'comptoir';
let trouves = [];

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

  z.innerHTML =
    '<div class="sechead"><h2>Comptoir</h2><span class="eyebrow num">' +
      liste.length + ' colis en cours</span></div>' +
    COMPTOIR.files(liste);
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
      trouves.map(COMPTOIR.carteColis).join('') + '</div>';
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
        el('resultat').innerHTML = trouves.map(COMPTOIR.carteColis).join('');
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

COMPTOIR.brancher(rafraichir);
EQUIPE.brancher(['agent', 'admin'], rendre);
