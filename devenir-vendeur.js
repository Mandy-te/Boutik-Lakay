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

/* Toutes les nouvelles boutiques démarrent sur la même formule.
   La grille tarifaire ne s'affiche plus à l'inscription : elle
   renseignait la concurrence, et elle demandait à quelqu'un qui n'a
   pas encore vendu un article de choisir un taux de commission. La
   montée en gamme se propose depuis l'administration, quand la
   boutique a du volume — c'est aussi le bon moment pour en parler. */
const PLAN_DEPART = 'gratuit';

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
});

/* Le brouillon de boutique, gardé le temps que l'adresse soit confirmée.

   Avec « Confirm email » actif, le compte naît sans session : impossible
   de créer la boutique dans la foulée. Plutôt que de redemander tout le
   formulaire au retour, on le met de côté ici et on finit le travail dès
   que le vendeur revient par le lien. localStorage peut échouer — navigation
   privée, stockage bloqué — donc tout est sous try/catch : au pire on perd
   le brouillon, jamais le compte. */
const CLE_BROUILLON = 'km.brouillon.boutique';

function garderBrouillon(d) {
  try { localStorage.setItem(CLE_BROUILLON, JSON.stringify(d)); } catch (e) {}
}
function lireBrouillon() {
  try { return JSON.parse(localStorage.getItem(CLE_BROUILLON) || 'null'); }
  catch (e) { return null; }
}
function oublierBrouillon() {
  try { localStorage.removeItem(CLE_BROUILLON); } catch (e) {}
}

function montrer(vue) {
  ['form', 'attente', 'pieces', 'fin'].forEach(function (v) {
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
  if (!API.emailValide(mail)) {
    throw new Error('Indiquez une adresse e-mail valide. C\u2019est elle qui ' +
      'permettra de retrouver votre mot de passe.');
  }
  const souciMdp = API.forceMotDePasse(pin, tel);
  if (souciMdp) throw new Error(souciMdp);
  if (!boutique) throw new Error('Donnez un nom à votre boutique.');
  if (!departement) throw new Error('Choisissez votre département.');
  if (!commune) throw new Error('Choisissez la commune où se trouvent vos articles.');
  const accord = el('vAccord') && el('vAccord').checked;
  if (!accord) {
    throw new Error('Vous devez accepter les conditions d\u2019utilisation ' +
      'et la politique de confidentialit\u00e9.');
  }

  const fiche = {
    nom: boutique,
    departement: departement,
    commune: commune,
    adresse_repere: val('vRepere'),
    description: val('vQuoi'),
    tel: tel
  };

  // Le compte d'abord : la boutique lui appartiendra, et c'est ce
  // rattachement qui lui donnera accès à ses commandes.
  const r = await API.creerCompte({
    tel: tel, pin: pin, nom: nom, email: mail,
    departement: departement, commune: commune,
    conditions: true,
    retour: 'devenir-vendeur.html'    // le lien du courriel ramène ici
  });

  if (r && r.confirmation) {
    // Pas de session : la boutique ne peut pas se créer maintenant. On
    // garde la fiche et on reprendra au retour du lien.
    garderBrouillon(fiche);
    el('attenteMail').textContent = API.normaliserEmail(mail);
    montrer('attente');
    return null;
  }

  return await poserBoutique(fiche);
}

// Création de la boutique proprement dite, appelée soit dans la foulée de
// l'inscription, soit au retour du lien de confirmation.
async function poserBoutique(fiche) {
  const b = await OPS.creerBoutique({
    nom: fiche.nom,
    departement: fiche.departement,
    commune: fiche.commune,
    adresse_repere: fiche.adresse_repere,
    description: fiche.description
  });
  boutiqueCreee = b;
  await OPS.definirPlan(b.id, PLAN_DEPART);
  oublierBrouillon();
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

  if (c.id === 'creer') {
    await agir(c, 'formErr', creerTout, function (b) {
      // creerTout rend null quand l'adresse reste à confirmer : l'écran
      // d'attente est déjà affiché, on ne passe pas aux pièces.
      if (b) montrer('pieces');
    });
    return;
  }

  if (c.id === 'renvoyer') {
    await agir(c, 'attenteErr', function () {
      return API.renvoyerConfirmation(el('attenteMail').textContent,
        'devenir-vendeur.html');
    }, function () {
      msg('attenteErr', 'Lien renvoyé. Regardez votre boîte, et vos indésirables.', 'ok');
    });
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

    let b = await API.maBoutique();

    if (!b) {
      /* Session ouverte, pas de boutique : soit le vendeur revient de son
         courriel de confirmation avec son brouillon sous la main, soit il
         a ouvert le lien ailleurs et le brouillon est perdu. */
      const brouillon = lireBrouillon();
      if (!brouillon) return;           // formulaire, comme avant
      try {
        b = await poserBoutique(brouillon);
      } catch (e) {
        msg('formErr', 'Votre compte est actif, mais la boutique n’a pas pu ' +
          'être créée : ' + e.message + ' Appelez le comptoir, un agent la ' +
          'saisira avec vous.', 'ko');
        return;
      }
    }

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
