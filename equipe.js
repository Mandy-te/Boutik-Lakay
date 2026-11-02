/* ============================================================
   Konbit Market — socle commun aux écrans d'équipe

   Les trois écrans (vendeur, agent, administration) partagent la
   connexion, le contrôle du rôle, et les mêmes petits outils
   d'affichage. Tout cela vit ici : une correction faite une fois
   vaut pour les trois.

   Chaque écran déclare ensuite ses onglets et ses rendus.
   ============================================================ */

/* ---------- Petits outils -------------------------------- */

function el(id) { return document.getElementById(id); }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Les montants circulent en centimes. On n'affiche jamais des centimes bruts.
function htg(c) { return new Intl.NumberFormat('fr-FR').format(Math.round((c || 0) / 100)) + ' HTG'; }

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

function val(id) { const e = el(id); return e ? e.value.trim() : ''; }

function msg(zone, texte, type) {
  const e = el(zone);
  if (e) e.innerHTML = texte
    ? '<div class="' + (type === 'ok' ? 'succes' : 'erreur') + '">' + esc(texte) + '</div>'
    : '';
}

/* Enveloppe commune des actions : empêche le double-clic, remet le
   bouton en état, et affiche l'erreur de la base telle quelle plutôt
   qu'un message vague. Une erreur précise fait gagner dix minutes. */
let occupe = false;

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

/* ---------- Choix de fichier -----------------------------
   Le sélecteur natif écrit « Choose File » en anglais et son texte
   ne se change pas. On l'habille d'un label en français, et on
   affiche le nom du fichier choisi — sans quoi l'utilisateur ne
   sait pas si son appui a fait quelque chose.                   */

function champFichier(id, libelle, options) {
  const o = options || {};
  return '<div class="champ">' +
      (libelle ? '<label for="' + id + '">' + esc(libelle) + '</label>' : '') +
      '<div class="fichier">' +
        '<input type="file" id="' + id + '"' +
          (o.accept ? ' accept="' + o.accept + '"' : '') +
          (o.multiple ? ' multiple' : '') +
          (o.data ? ' ' + o.data : '') + '>' +
        '<label for="' + id + '">' + esc(o.bouton || 'Choisir un fichier') + '</label>' +
        '<span class="nomFichier" id="nom-' + id + '">' +
          esc(o.vide || 'Aucun fichier choisi') + '</span>' +
      '</div>' +
    '</div>';
}

// Un seul écouteur pour toute la page : le nom suit le choix.
document.addEventListener('change', function (ev) {
  const c = ev.target;
  if (!c || c.type !== 'file') return;
  const z = document.getElementById('nom-' + c.id);
  if (!z) return;
  const f = c.files;
  if (!f || !f.length) { z.textContent = 'Aucun fichier choisi'; return; }
  z.textContent = f.length > 1 ? f.length + ' fichiers choisis' : f[0].name;
});

/* ---------- Chaîne de suivi, vue par tous ----------------- */

function pastilleStatut(statut) {
  const i = OPS.rangEtape(statut);
  if (statut === 'abandonnee' || statut === 'remboursee') return { c: 'ko', mot: 'Annulée' };
  if (statut === 'cloturee') return { c: 'gris', mot: 'Terminée' };
  if (statut === 'code_valide') return { c: 'ok', mot: 'Retirée' };
  if (statut === 'au_point_retrait') return { c: 'ok', mot: 'À retirer' };
  if (statut === 'recue') return { c: 'warn', mot: 'À confirmer' };
  const e = OPS.ETAPES[i];
  return { c: 'att', mot: e ? e.nom : statut };
}

function ligneArticles(o) {
  return (o.lignes || []).map(function (l) {
    return esc(l.nom_produit) + (l.libelle ? ' · ' + esc(l.libelle) : '') +
      ' <span class="num">×' + l.quantite + '</span>';
  }).join('<br>');
}

/* ---------- Connexion et contrôle du rôle -----------------

   Chaque écran dit quels rôles il accepte. Un vendeur qui ouvre
   l'écran d'administration doit être refusé clairement, pas
   accueilli par une page vide qui le laisserait croire à une
   panne.                                                      */

const EQUIPE = (function () {

  let rolesAutorises = [];
  let surConnexion = null;
  let monRole = null;
  let ouAvecBoutique = false;

  function montrer(vue) {
    ['login', 'refus', 'app'].forEach(function (v) {
      const e = el('vue-' + v);
      if (e) e.hidden = (v !== vue);
    });
    const s = el('sortir');
    if (s) s.hidden = (vue !== 'app');
    /* Le retour vers la boutique. Un vendeur ou un agent arrive ici
       directement depuis la connexion ; sans ce lien il n'a aucun
       chemin pour aller acheter, et c'est exactement ce qui pousse
       quelqu'un à se créer un second compte. Le passage d'un rôle à
       l'autre doit être volontaire et visible, dans les deux sens. */
    Array.prototype.forEach.call(document.querySelectorAll('.versBoutique'),
      function (a) { a.hidden = (vue !== 'app'); });
  }

  function nomRole(r) {
    return { acheteur: 'acheteur', vendeur: 'vendeur',
             agent: 'agent', admin: 'administrateur' }[r] || r;
  }

  async function ouvrir() {
    monRole = await OPS.monRole();

    // Un vendeur fraîchement inscrit n'a pas encore le rôle : sa boutique
    // attend d'être vérifiée. L'enfermer dehors lui ferait croire à une
    // panne, alors qu'il doit justement pouvoir suivre sa demande.
    let proprietaire = false;
    if (ouAvecBoutique && rolesAutorises.indexOf(monRole) === -1) {
      proprietaire = !!(await API.maBoutique().catch(function () { return null; }));
    }

    if (!proprietaire && rolesAutorises.indexOf(monRole) === -1) {
      const t = el('refusTxt');
      if (t) {
        t.textContent = monRole
          ? 'Ce compte est ' + nomRole(monRole) + '. Cet écran est réservé ' +
            'aux comptes ' + rolesAutorises.map(nomRole).join(' ou ') + '.' +
            (ouAvecBoutique
              ? ' Si vous venez de vous inscrire comme vendeur, votre boutique ' +
                'doit d\u2019abord être rattachée à ce compte par un agent.' : '')
          : 'Aucun profil trouvé pour ce compte.';
      }
      const a = el('refusAutre');
      if (a) a.hidden = !monRole;
      montrer('refus');
      return;
    }
    montrer('app');
    if (surConnexion) await surConnexion(monRole);
  }

  function brancher(roles, auDemarrage, options) {
    rolesAutorises = roles;
    surConnexion = auDemarrage;
    ouAvecBoutique = !!(options && options.ouAvecBoutique);

    document.addEventListener('click', function (ev) {
      const c = ev.target;
      if (c.id === 'entrer') {
        agir(c, 'loginErr', function () {
          return OPS.connexion(val('email'), el('mdp').value);
        }, ouvrir);
        return;
      }
      if (c.id === 'sortir' || c.id === 'refusSortir') {
        OPS.deconnexion().then(function () { location.reload(); });
        return;
      }
      if (c.id === 'refusAutre') { location.href = 'gestion.html'; return; }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && (ev.target.id === 'mdp' || ev.target.id === 'email')) {
        const b = el('entrer');
        if (b) b.click();
      }
    });

    (async function () {
      if (!API.pret()) {
        msg('loginErr', 'Librairie non chargée. Vérifie ta connexion et recharge.', 'ko');
        montrer('login');
        return;
      }
      try {
        const { data } = await API.sb().auth.getSession();
        if (data && data.session && !data.session.user.is_anonymous) {
          await ouvrir();
          return;
        }
      } catch (e) {}
      montrer('login');
    })();
  }

  function role() { return monRole; }

  return { brancher: brancher, role: role, montrer: montrer };
})();

window.EQUIPE = EQUIPE;
