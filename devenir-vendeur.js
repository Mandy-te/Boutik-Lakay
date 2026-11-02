/* ============================================================
   Konbit Market — inscription d'un vendeur

   Un vendeur s'inscrit seul, depuis son téléphone. Il crée son
   compte, déclare sa boutique, dépose ses pièces. Rien n'est
   visible des acheteurs tant qu'un agent n'a pas vérifié.

   Pourquoi l'auto-inscription plutôt qu'un compte créé par
   l'équipe : à 15 vendeurs on peut tout saisir à la main, à 100
   c'est l'équipe qui devient le goulot d'étranglement. Et un
   vendeur qui doit attendre qu'on s'occupe de lui va voir
   ailleurs.

   Ce que l'inscription NE donne PAS : le rôle vendeur, ni la mise
   en vitrine. La boutique naît « en attente ». Un compte ne peut
   pas se promouvoir lui-même — la base le refuse, pas seulement
   cet écran.
   ============================================================ */

let boutiqueCreee = null;
let plans = [];
let planChoisi = null;

/* Le plan se choisit en voyant ce qu'il coûte ET ce qu'il apporte.
   Un pourcentage seul ne dit rien à quelqu'un qui démarre. */
function rendrePlans() {
  const z = el('listePlans');
  if (!z) return;
  z.innerHTML = plans.map(function (p) {
    return '<button type="button" class="pick" data-plan="' + esc(p.code) + '" ' +
      'aria-pressed="' + (planChoisi === p.code) + '">' +
      '<span class="dot"></span><span class="shopmeta">' +
        '<span class="shopname">' + esc(p.nom) +
          ' <span class="badge">' + (p.commission_bps / 100) + ' % par vente</span>' +
          (p.abonnement_mois ? ' <span class="badge">' +
            htg(p.abonnement_mois) + ' / mois</span>' : '') + '</span>' +
        (p.description ? '<span class="shopsub">' + esc(p.description) + '</span>' : '') +
        '<span class="shopsub">' +
          (p.max_references == null ? 'Articles illimités'
            : p.max_references + ' articles maximum') +
          (p.mises_en_avant ? ' \u00b7 ' + p.mises_en_avant + ' mise(s) en avant' : '') +
        '</span>' +
      '</span></button>';
  }).join('');
}

// Les deux listes sont liées : choisir un département remplit les communes.
document.addEventListener('DOMContentLoaded', function () {
  const d = el('vDep'), c = el('vCommune');
  if (d) d.innerHTML = optionsDepartements(null);
  if (c) c.innerHTML = optionsCommunes(null, null);
  lierDepartementCommune('vDep', 'vCommune');

  // Sélecteurs de fichiers habillés en français.
  const pieces = { accept: 'image/jpeg,image/png,image/webp,application/pdf' };
  const a = el('champId'), b = el('champPatente');
  if (a) a.innerHTML = champFichier('docId', 'Pièce d\u2019identité', pieces);
  if (b) b.innerHTML = champFichier('docPatente', 'Patente', pieces);

  OPS.plans().then(function (liste) {
    plans = (liste || []).filter(function (p) { return p.actif; });
    if (plans.length) planChoisi = plans[0].code;
    rendrePlans();
  }).catch(function () {
    const z = el('listePlans');
    if (z) z.innerHTML = '<p class="note">Formules indisponibles. ' +
      'Vérifiez votre connexion et rechargez.</p>';
  });
});

function montrer(vue) {
  ['form', 'pieces', 'fin'].forEach(function (v) {
    const e = el('vue-' + v);
    if (e) e.hidden = (v !== vue);
  });
  window.scrollTo(0, 0);
}

/* ---------- Création du compte et de la boutique ---------- */

async function creerTout() {
  const nom = val('vNom');
  const tel = val('vTel');
  const pin = val('vPin');
  const mail = val('vMail');
  const boutique = val('vBoutique');
  const departement = val('vDep');
  const commune = val('vCommune');

  if (!nom) throw new Error('Indiquez votre nom.');
  if (!API.telValide(tel)) throw new Error('Numéro invalide. Exemple : 3132 4336');
  if (pin.length !== 6) throw new Error('Le code secret doit avoir 6 chiffres.');
  if (!boutique) throw new Error('Donnez un nom à votre boutique.');
  if (!departement) throw new Error('Choisissez votre département.');
  if (!commune) throw new Error('Choisissez la commune où se trouvent vos articles.');
  if (!planChoisi) throw new Error('Choisissez votre formule.');

  // Le compte d'abord : la boutique lui appartiendra, et c'est ce
  // rattachement qui lui donnera accès à ses commandes.
  await API.creerCompte({ tel: tel, pin: pin, nom: nom, email: mail });
  await API.majProfil({ departement: departement, commune: commune });

  const b = await OPS.creerBoutique({
    nom: boutique,
    departement: departement,
    commune: commune,
    adresse_repere: val('vRepere'),
    description: val('vQuoi')
  });
  boutiqueCreee = b;
  await OPS.definirPlan(b.id, planChoisi);
  return b;
}

/* ---------- Dépôt des pièces ------------------------------
   Bucket privé, un dossier par compte. Le vendeur ne voit que les
   siennes, l'équipe les consulte pour vérifier.                */

async function deposer(champ, genre, zoneMsg) {
  const input = el(champ);
  const f = input && input.files && input.files[0];
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) {
    msg(zoneMsg, 'Fichier trop lourd : 10 Mo maximum.', 'ko');
    input.value = '';
    return;
  }

  const moi = await API.monId();
  const ext = (f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const chemin = moi + '/' + genre + '-' + Date.now().toString(36) + '.' + ext;

  msg(zoneMsg, 'Envoi…', 'ok');
  const up = await API.sb().storage.from('documents')
    .upload(chemin, f, { contentType: f.type || undefined, upsert: true });
  if (up.error) { msg(zoneMsg, up.error.message, 'ko'); return; }

  await OPS.deposerDocument(boutiqueCreee.id, genre, chemin);
  msg(zoneMsg, 'Reçu.', 'ok');
}

/* ---------- Événements ------------------------------------ */

document.addEventListener('click', async function (ev) {
  const c = ev.target;

  const p = c.closest ? c.closest('[data-plan]') : null;
  if (p) {
    planChoisi = p.getAttribute('data-plan');
    rendrePlans();
    return;
  }

  if (c.id === 'creer') {
    await agir(c, 'formErr', creerTout, function () { montrer('pieces'); });
    return;
  }

  if (c.id === 'termine') {
    el('finTxt').textContent =
      'Votre boutique « ' + (boutiqueCreee ? boutiqueCreee.nom : '') + ' » est enregistrée. ' +
      'Un agent vérifie vos pièces et vous appelle au ' + val('vTel') + '. ' +
      'En attendant, elle n’est pas visible des acheteurs.';
    montrer('fin');
    return;
  }
});

document.addEventListener('change', async function (ev) {
  if (ev.target.id === 'docId') {
    await deposer('docId', 'identite', 'msgId');
  }
  if (ev.target.id === 'docPatente') {
    await deposer('docPatente', 'patente', 'msgPatente');
  }
});

/* ---------- Démarrage -------------------------------------

   Sur un téléphone, ouvrir le sélecteur de fichiers peut faire
   recharger la page : le navigateur met l'onglet en arrière-plan et
   le reconstruit au retour. L'inscription ne doit donc pas perdre
   le fil — c'est exactement là qu'elle le perdait, et le vendeur se
   retrouvait éjecté sans avoir pu déposer ses pièces.

   On reprend donc à l'étape où il en était.                      */

(async function () {
  if (!API.pret()) {
    msg('formErr', 'Librairie non chargée. Vérifiez votre connexion et rechargez.', 'ko');
    return;
  }
  try {
    const { data } = await API.sb().auth.getSession();
    if (!data || !data.session || data.session.user.is_anonymous) return;

    const b = await API.maBoutique();
    if (!b) return;                     // compte sans boutique : formulaire

    boutiqueCreee = b;
    // Les pièces vivent dans leur propre table, lisible par le seul
    // propriétaire et par l'équipe.
    const d = await OPS.documentsBoutique(b.id).catch(function () { return {}; });
    if (d.identite && d.patente) {
      location.replace('vendeur.html'); // tout est déposé, il n'a plus rien à faire ici
      return;
    }
    // Il manque au moins une pièce : on le remet exactement où il s'était arrêté.
    if (d.identite) msg('msgId', 'Déjà reçue.', 'ok');
    if (d.patente) msg('msgPatente', 'Déjà reçue.', 'ok');
    montrer('pieces');
  } catch (e) {}
})();
