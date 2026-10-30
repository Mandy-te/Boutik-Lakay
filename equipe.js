/* ============================================================
   Boutique Lakay — socle commun aux écrans d'équipe

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

  function montrer(vue) {
    ['login', 'refus', 'app'].forEach(function (v) {
      const e = el('vue-' + v);
      if (e) e.hidden = (v !== vue);
    });
    const s = el('sortir');
    if (s) s.hidden = (vue !== 'app');
  }

  function nomRole(r) {
    return { acheteur: 'acheteur', vendeur: 'vendeur',
             agent: 'agent', admin: 'administrateur' }[r] || r;
  }

  async function ouvrir() {
    monRole = await OPS.monRole();
    if (rolesAutorises.indexOf(monRole) === -1) {
      const t = el('refusTxt');
      if (t) {
        t.textContent = monRole
          ? 'Ce compte est ' + nomRole(monRole) + '. Cet écran est réservé ' +
            'aux comptes ' + rolesAutorises.map(nomRole).join(' ou ') + '.'
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

  function brancher(roles, auDemarrage) {
    rolesAutorises = roles;
    surConnexion = auDemarrage;

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
