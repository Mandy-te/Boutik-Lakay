/* ============================================================
   Haïti — départements et communes

   Sert partout où l'on demande un lieu : inscription d'un acheteur,
   déclaration d'une boutique, création d'un point de retrait, tarifs
   de livraison.

   Pourquoi une liste fermée plutôt qu'un champ libre : « Cap-Haïtien »,
   « Cap Haitien » et « Okap » sont trois communes différentes pour une
   base de données. Les tarifs de livraison se calculent sur ce nom —
   une faute de frappe et le colis part au mauvais prix.

   Liste à corriger ici, et nulle part ailleurs, si une commune manque
   ou si un découpage change.
   ============================================================ */

const HAITI = {
  'Ouest': [
    'Port-au-Prince', 'Delmas', 'Carrefour', 'Pétion-Ville', 'Kenscoff',
    'Gressier', 'Tabarre', 'Cité Soleil', 'Croix-des-Bouquets', 'Thomazeau',
    'Ganthier', 'Fonds-Verrettes', 'Cornillon', 'Léogâne', 'Grand-Goâve',
    'Petit-Goâve', 'Arcahaie', 'Cabaret', 'Anse-à-Galets', 'Pointe-à-Raquette'
  ],
  'Sud-Est': [
    'Jacmel', 'Marigot', 'Cayes-Jacmel', 'La Vallée-de-Jacmel', 'Bainet',
    'Côtes-de-Fer', 'Belle-Anse', 'Grand-Gosier', 'Thiotte', 'Anse-à-Pitres'
  ],
  'Nord': [
    'Cap-Haïtien', 'Limonade', 'Quartier-Morin', 'Acul-du-Nord', 'Plaine-du-Nord',
    'Milot', 'Grande-Rivière-du-Nord', 'Bahon', 'Saint-Raphaël', 'Dondon',
    'La Victoire', 'Pignon', 'Ranquitte', 'Borgne', 'Port-Margot',
    'Limbé', 'Bas-Limbé', 'Plaisance', 'Pilate'
  ],
  'Nord-Est': [
    'Fort-Liberté', 'Ferrier', 'Perches', 'Ouanaminthe', 'Capotille',
    'Mont-Organisé', 'Trou-du-Nord', 'Sainte-Suzanne', 'Terrier-Rouge',
    'Caracol', 'Vallières', 'Carice', 'Mombin-Crochu'
  ],
  'Nord-Ouest': [
    'Port-de-Paix', 'Bassin-Bleu', 'Chansolme', 'Île de la Tortue',
    'Saint-Louis-du-Nord', 'Anse-à-Foleur', 'Jean-Rabel', 'Môle-Saint-Nicolas',
    'Bombardopolis', 'Baie-de-Henne'
  ],
  'Artibonite': [
    'Gonaïves', 'Ennery', "L'Estère", 'Saint-Marc', 'La Chapelle', 'Liancourt',
    'Verrettes', 'Dessalines', 'Desdunes', 'Grande-Saline',
    "Petite-Rivière-de-l'Artibonite", 'Gros-Morne', 'Anse-Rouge', 'Terre-Neuve',
    'Marmelade', 'Saint-Michel-de-l’Attalaye'
  ],
  'Centre': [
    'Hinche', 'Maïssade', 'Thomonde', 'Cerca-Carvajal', 'Mirebalais',
    'Boucan-Carré', "Saut-d'Eau", 'Lascahobas', 'Belladère', 'Savanette',
    'Cerca-la-Source', 'Thomassique'
  ],
  'Sud': [
    'Les Cayes', 'Camp-Perrin', 'Chantal', 'Île-à-Vache', 'Maniche', 'Torbeck',
    'Aquin', 'Cavaillon', 'Saint-Louis-du-Sud', 'Côteaux', 'Chardonnières',
    'Les Anglais', 'Port-à-Piment', 'Roche-à-Bateau', 'Port-Salut',
    'Saint-Jean-du-Sud', 'Arniquet', 'Tiburon'
  ],
  'Nippes': [
    'Miragoâne', 'Fonds-des-Nègres', 'Paillant', 'Petite-Rivière-de-Nippes',
    'Anse-à-Veau', 'Arnaud', "L'Asile", 'Plaisance-du-Sud',
    'Petit-Trou-de-Nippes', 'Baradères', 'Grand-Boucan'
  ],
  "Grand'Anse": [
    'Jérémie', 'Abricots', 'Bonbon', 'Chambellan', 'Corail', 'Beaumont',
    'Pestel', 'Roseaux', 'Moron', "Anse-d'Hainault", 'Dame-Marie', 'Les Irois'
  ]
};

const DEPARTEMENTS = Object.keys(HAITI);

function communesDe(departement) {
  return HAITI[departement] || [];
}

// Retrouve le département d'une commune : utile pour les données déjà
// saisies à la main, avant que ces listes existent.
function departementDe(commune) {
  const c = String(commune || '').trim().toLowerCase();
  for (let i = 0; i < DEPARTEMENTS.length; i++) {
    const d = DEPARTEMENTS[i];
    if (HAITI[d].some(function (x) { return x.toLowerCase() === c; })) return d;
  }
  return null;
}

/* Deux listes liées : choisir un département remplit la seconde.
   `idDep` et `idCom` sont les identifiants des deux <select>. */
function optionsDepartements(choisi) {
  return '<option value="">— choisir —</option>' +
    DEPARTEMENTS.map(function (d) {
      return '<option value="' + d + '"' + (d === choisi ? ' selected' : '') +
        '>' + d + '</option>';
    }).join('');
}

function optionsCommunes(departement, choisie) {
  const liste = communesDe(departement);
  if (!liste.length) return '<option value="">— choisissez d’abord un département —</option>';
  return '<option value="">— choisir —</option>' +
    liste.map(function (c) {
      return '<option value="' + c + '"' + (c === choisie ? ' selected' : '') +
        '>' + c + '</option>';
    }).join('');
}

// Branche le lien entre les deux listes, une fois qu'elles sont dans la page.
function lierDepartementCommune(idDep, idCom) {
  const dep = document.getElementById(idDep);
  const com = document.getElementById(idCom);
  if (!dep || !com) return;
  dep.addEventListener('change', function () {
    com.innerHTML = optionsCommunes(dep.value, null);
  });
}

if (typeof window !== 'undefined') {
  window.HAITI = HAITI;
  window.DEPARTEMENTS = DEPARTEMENTS;
  window.communesDe = communesDe;
  window.departementDe = departementDe;
  window.optionsDepartements = optionsDepartements;
  window.optionsCommunes = optionsCommunes;
  window.lierDepartementCommune = lierDepartementCommune;
}
