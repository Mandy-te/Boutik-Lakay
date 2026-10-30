/* ============================================================
   Boutique Lakay — configuration
   Le seul fichier à modifier quand quelque chose change dehors.
   ============================================================ */

const CONFIG = {

  /* --- Supabase ------------------------------------------- */
  supabaseUrl: 'https://xpiklpznggsrfsxmittr.supabase.co',
  supabaseKey: 'sb_publishable_OUJkIiz304t-fcwxRDncnA_QjtW0Dyz',

  /* --- Monnaie -------------------------------------------- */
  // Les prix sont en CENTIMES de gourde partout dans le code et en base.
  // 2 450,00 HTG = 245000. Jamais de décimales, jamais de float sur l'argent.
  devise: 'HTG',

  // Taux indicatif pour l'affichage en dollars. L'acheteur paie en gourdes :
  // ce taux n'entre dans aucun calcul de montant dû, il est figé sur chaque
  // commande à sa création pour que l'historique reste lisible.
  // À remettre à jour de temps en temps.
  tauxUsd: 132.50,

  /* --- Zone de service ------------------------------------ */
  // Pilote : Grand Nord uniquement. On ouvre corridor par corridor.
  zone: 'Grand Nord',

  /* --- Phase ----------------------------------------------- */
  // 'pilote' : aucun argent ne transite par la plateforme.
  //            L'acheteur paie en espèces au comptoir, au retrait.
  // 'sequestre' : la plateforme encaisse et bloque jusqu'à confirmation.
  //            À n'activer qu'une fois la société enregistrée et le
  //            contrat marchand signé.
  phase: 'pilote',

  /* --- Règles anti-abandon --------------------------------- */
  // Le paiement au retrait n'engage à rien : ces trois règles protègent
  // le vendeur dont l'article est immobilisé pour un client qui ne vient pas.
  regles: {
    confirmationTelephone: true, // rien ne part avant un appel confirmé
    heuresAvantExpiration: 72,   // au-delà, la commande est annulée
    abandonsAvantPrepaiement: 3  // au 3e, le compte doit prépayer
  },

  /* --- Médias ---------------------------------------------- */
  // Les limites sont ici, pas dans le code : tu les changes sans me rappeler.
  //
  // Pourquoi une limite sur la vidéo : ce n'est pas le stockage qui coûte,
  // c'est la data de l'acheteur. Une vidéo de 30 Mo sur une fiche produit,
  // c'est une recharge brûlée pour regarder un article. Côté acheteur la
  // vidéo ne se télécharge jamais toute seule, il faut appuyer sur lecture.
  medias: {
    photosMax: 8,        // par produit
    videosMax: 2,        // par produit
    moMax: 30,           // par fichier, en mégaoctets
    videoSecondesMax: 20 // au-delà, l'envoi est refusé avec un message clair
  },

  /* --- Cache hors-ligne ------------------------------------ */
  // La data mobile est chère et le réseau coupe. Le catalogue est relu
  // depuis le cache quand la requête échoue, et rafraîchi dès que possible.
  cacheMinutes: 30,

  /* --- Divers ---------------------------------------------- */
  langueParDefaut: 'fr',
  version: '1.0.0'
};

if (typeof window !== 'undefined') window.CONFIG = CONFIG;
