/* ============================================================
   Boutique Lakay — déclinaisons d'un produit

   Partagé par l'espace vendeur et l'administration : les deux
   éditent les mêmes fiches, ils ne doivent pas avoir deux
   formulaires différents.

   LA distinction à rendre évidente : une déclinaison a un NOM
   (« Taille ») et des VALEURS (« S », « M », « L »). Mon premier
   écran demandait « ajouter une déclinaison » avec un champ libre
   et l'exemple « Taille » en gris — on y tape « S », et on se
   retrouve avec trois déclinaisons nommées S, M et L. L'erreur
   était prévisible, et c'était la mienne.

   Ici le nom se CHOISIT dans une liste, les valeurs se saisissent
   en dessous, et les combinaisons sont engendrées d'un coup :
   3 tailles × 2 couleurs = 6 variantes, pas six saisies.
   ============================================================ */

const NOMS_DECLINAISON = ['Taille', 'Couleur', 'Pointure', 'Contenance',
                          'Poids', 'Matière', 'Parfum', 'Modèle'];

const VALEURS_COURANTES = {
  'taille':      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  'pointure':    ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  'couleur':     ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Rose', 'Gris', 'Marron'],
  'contenance':  ['50 ml', '100 ml', '250 ml', '500 ml', '1 L'],
  'poids':       ['250 g', '500 g', '1 kg'],
  'matiere':     ['Coton', 'Lin', 'Polyester', 'Cuir', 'Jean']
};

function sansAccent(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function valeursSuggerees(nom) {
  return VALEURS_COURANTES[sansAccent(nom)] || [];
}

/* Toutes les combinaisons possibles : {Taille:[S,M]} × {Couleur:[Rouge]}
   donne [{Taille:S,Couleur:Rouge},{Taille:M,Couleur:Rouge}]. */
function combinaisons(declinaisons) {
  const noms = Object.keys(declinaisons || {}).filter(function (n) {
    return (declinaisons[n] || []).length;
  });
  if (!noms.length) return [];
  let sortie = [{}];
  noms.forEach(function (n) {
    const suivant = [];
    sortie.forEach(function (base) {
      declinaisons[n].forEach(function (v) {
        const copie = {};
        Object.keys(base).forEach(function (k) { copie[k] = base[k]; });
        copie[n] = v;
        suivant.push(copie);
      });
    });
    sortie = suivant;
  });
  return sortie;
}

function memeCombinaison(a, b) {
  const ka = Object.keys(a || {}), kb = Object.keys(b || {});
  if (ka.length !== kb.length) return false;
  return ka.every(function (k) { return a[k] === b[k]; });
}

function etiquette(attributs, ordre) {
  const noms = (ordre && ordre.length) ? ordre : Object.keys(attributs || {});
  return noms.map(function (n) { return attributs[n]; })
    .filter(Boolean).join(' · ');
}

/* ---------- Rendu du bloc ---------------------------------
   `prefixe` évite les collisions d'identifiants quand plusieurs
   produits sont affichés l'un sous l'autre.                   */

function blocDeclinaisons(p, options) {
  const o = options || {};
  const d = p.declinaisons || {};
  const noms = Object.keys(d);
  const id = p.id;
  const fige = !!o.fige;

  if (fige) {
    return noms.length
      ? '<p class="note">Déclinaisons : ' + noms.map(function (n) {
          return esc(n) + ' (' + (d[n] || []).map(esc).join(', ') + ')';
        }).join(' · ') + '</p>'
      : '';
  }

  const lignes = noms.map(function (n) {
    const sug = valeursSuggerees(n).filter(function (v) {
      return (d[n] || []).indexOf(v) === -1;
    });
    return '<div class="decl">' +
      '<div class="titreligne"><strong>' + esc(n) + '</strong>' +
        '<button class="sup" data-supdecl="' + esc(n) + '" data-prod="' + esc(id) +
          '" aria-label="Retirer ' + esc(n) + '">×</button></div>' +
      '<div class="rangee">' +
        ((d[n] || []).length
          ? d[n].map(function (v) {
              return '<span class="pill att">' + esc(v) +
                ' <button class="sup" style="border:0;background:none;padding:0 3px" ' +
                'data-supval="' + esc(v) + '" data-decl="' + esc(n) + '" data-prod="' + esc(id) +
                '" aria-label="Retirer ' + esc(v) + '">×</button></span>';
            }).join('')
          : '<span class="note">Aucune valeur</span>') +
      '</div>' +
      '<div class="vrow">' +
        '<div class="champ lib"><label for="dv-' + esc(id) + '-' + esc(n) + '">' +
          'Ajouter une valeur de ' + esc(n).toLowerCase() + '</label>' +
          '<input id="dv-' + esc(id) + '-' + esc(n) + '" data-decl-nom="' + esc(n) + '" ' +
          'list="dl-' + esc(id) + '-' + esc(n) + '" placeholder="' +
          esc(sug[0] || valeursSuggerees(n)[0] || 'S') + '">' +
          '<datalist id="dl-' + esc(id) + '-' + esc(n) + '">' +
            sug.map(function (v) { return '<option value="' + esc(v) + '">'; }).join('') +
          '</datalist></div>' +
        '<button class="mini" data-ajval="' + esc(n) + '" data-prod="' + esc(id) + '">Ajouter</button>' +
      '</div>' +
    '</div>';
  }).join('');

  const restants = NOMS_DECLINAISON.filter(function (n) { return noms.indexOf(n) === -1; });
  const total = combinaisons(d).length;
  const dejaN = (p.variantes || []).length;

  return '<div class="sechead"><h2 style="font-size:13px">Déclinaisons</h2></div>' +
    (noms.length
      ? lignes
      : '<p class="note">Cet article se vend tel quel. S’il existe en ' +
        'plusieurs tailles, couleurs ou contenances, ajoutez la déclinaison ' +
        'correspondante ci-dessous.</p>') +

    '<div class="vrow">' +
      '<div class="champ lib"><label for="dn-' + esc(id) + '">Ajouter une déclinaison</label>' +
        '<select id="dn-' + esc(id) + '">' +
          '<option value="">— choisir —</option>' +
          restants.map(function (n) {
            return '<option value="' + esc(n) + '">' + esc(n) + '</option>';
          }).join('') +
          '<option value="__autre">Autre…</option>' +
        '</select></div>' +
      '<div class="champ" id="dna-' + esc(id) + '" hidden>' +
        '<label for="dnx-' + esc(id) + '">Son nom</label>' +
        '<input id="dnx-' + esc(id) + '" placeholder="Longueur"></div>' +
      '<button class="mini" data-ajdecl="' + esc(id) + '">Ajouter</button>' +
    '</div>' +
    '<p class="note">Le <strong>nom</strong> est la sorte de déclinaison (Taille), ' +
      'les <strong>valeurs</strong> sont ce qu’elle peut valoir (S, M, L).</p>' +

    (total
      ? '<div id="msg-gen-' + esc(id) + '"></div>' +
        '<button class="mini" data-generer="' + esc(id) + '">' +
          'Créer les ' + total + ' combinaison(s)' +
          (dejaN ? ' — ' + dejaN + ' déjà là' : '') + '</button>'
      : '');
}


/* ---------- Gestionnaires partagés -------------------------
   Branchés une fois par écran. `recharger` est la fonction de
   l'écran qui redessine la liste des produits.               */

function brancherDeclinaisons(trouverProduit, recharger) {

  document.addEventListener('click', async function (ev) {
    const c = ev.target.closest ? ev.target.closest('button') : null;
    if (!c) return;

    // Ajouter une déclinaison (son NOM)
    if (c.hasAttribute('data-ajdecl')) {
      const id = c.getAttribute('data-ajdecl');
      const sel = el('dn-' + id);
      let nom = sel ? sel.value : '';
      if (nom === '__autre') nom = val('dnx-' + id);
      if (!nom) { msg('msg-' + id, 'Choisissez une déclinaison.', 'ko'); return; }

      const p = trouverProduit(id);
      const d = Object.assign({}, (p && p.declinaisons) || {});
      if (Object.keys(d).some(function (k) { return sansAccent(k) === sansAccent(nom); })) {
        msg('msg-' + id, 'Cette déclinaison existe déjà.', 'ko');
        return;
      }
      d[nom] = [];
      await agir(c, 'msg-' + id, function () { return OPS.majDeclinaisons(id, d); }, recharger);
      return;
    }

    // Retirer une déclinaison
    if (c.hasAttribute('data-supdecl')) {
      const id = c.getAttribute('data-prod');
      const nom = c.getAttribute('data-supdecl');
      const p = trouverProduit(id);
      if (p && (p.variantes || []).length) {
        msg('msg-' + id, 'Supprimez d\u2019abord les variantes : elles utilisent ' +
          'cette déclinaison.', 'ko');
        return;
      }
      const d = Object.assign({}, (p && p.declinaisons) || {});
      delete d[nom];
      await agir(c, 'msg-' + id, function () { return OPS.majDeclinaisons(id, d); }, recharger);
      return;
    }

    // Ajouter une VALEUR à une déclinaison
    if (c.hasAttribute('data-ajval')) {
      const id = c.getAttribute('data-prod');
      const nom = c.getAttribute('data-ajval');
      const v = val('dv-' + id + '-' + nom);
      if (!v) { msg('msg-' + id, 'Écrivez la valeur à ajouter.', 'ko'); return; }
      const p = trouverProduit(id);
      const d = Object.assign({}, (p && p.declinaisons) || {});
      const liste = (d[nom] || []).slice();
      if (liste.some(function (x) { return sansAccent(x) === sansAccent(v); })) {
        msg('msg-' + id, 'Cette valeur est déjà là.', 'ko');
        return;
      }
      liste.push(v);
      d[nom] = liste;
      await agir(c, 'msg-' + id, function () { return OPS.majDeclinaisons(id, d); }, recharger);
      return;
    }

    // Retirer une valeur
    if (c.hasAttribute('data-supval')) {
      const id = c.getAttribute('data-prod');
      const nom = c.getAttribute('data-decl');
      const v = c.getAttribute('data-supval');
      const p = trouverProduit(id);
      const d = Object.assign({}, (p && p.declinaisons) || {});
      d[nom] = (d[nom] || []).filter(function (x) { return x !== v; });
      await agir(c, 'msg-' + id, function () { return OPS.majDeclinaisons(id, d); }, recharger);
      return;
    }

    // Engendrer les combinaisons manquantes
    if (c.hasAttribute('data-generer')) {
      const id = c.getAttribute('data-generer');
      await agir(c, 'msg-gen-' + id, function () { return OPS.genererVariantes(id); },
        async function (r) {
          if (!r.crees) msg('msg-gen-' + id, 'Toutes les combinaisons existent déjà.', 'ok');
          await recharger();
        });
      return;
    }
  });

  // « Autre… » fait apparaître le champ libre
  document.addEventListener('change', function (ev) {
    const c = ev.target;
    if (c.id && c.id.indexOf('dn-') === 0) {
      const zone = el('dna-' + c.id.slice(3));
      if (zone) zone.hidden = (c.value !== '__autre');
    }
  });
}
