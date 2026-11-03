/* ============================================================
   Konbit Market — configuration
   Le seul fichier à modifier quand quelque chose change dehors.
   ============================================================ */

const CONFIG = {

  /* --- Supabase ------------------------------------------- */
  supabaseUrl: 'https://xpiklpznggsrfsxmittr.supabase.co',
  supabaseKey: 'sb_publishable_OUJkIiz304t-fcwxRDncnA_QjtW0Dyz',

  /* --- Vérification anti-robot ----------------------------

     Supabase peut exiger un jeton de captcha sur l'inscription et la
     connexion : tableau de bord, Authentication, Attack Protection.
     C'est la vraie protection contre la force brute sur un code à six
     chiffres, et elle est disponible sur l'offre gratuite.

     ORDRE À RESPECTER, sinon tout le monde est dehors :

       1. créer le site sur hCaptcha, noter la clé de site ET le secret ;
       2. coller la CLÉ DE SITE ci-dessous, et mettre en ligne ;
       3. SEULEMENT APRÈS, coller le SECRET côté Supabase et activer.

     L'inverse coupe toutes les connexions pendant le temps du
     déploiement : Supabase réclamerait un jeton que l'application
     n'envoie pas encore.

     Tant que cleSite est vide, rien ne change : aucune librairie n'est
     chargée, aucun jeton n'est envoyé, et un visiteur qui regarde le
     catalogue ne paie rien — il n'y a plus de session anonyme à
     protéger.                                                        */
  captcha: {
    fournisseur: 'hcaptcha',   // doit correspondre au choix fait dans Supabase
    cleSite: 'b31e411c-e0f6-4e38-9b58-218611dca382'
  },

  /* --- Conditions d'utilisation ----------------------------
     La version que l'inscription fait accepter. C'est cette chaine
     qui est enregistree sur le profil, pas un simple « oui ».

     Quand tu modifies conditions.html ou confidentialite.html sur
     un point de fond, change cette date : les comptes existants
     porteront alors l'ancienne version, et on saura qui doit
     reaccepter. La laisser figee reviendrait a dire que tout le
     monde a accepte un texte que personne n'a vu.               */
  conditions: {
    version: '2026-11-02'
  },

  /* --- Monnaie -------------------------------------------- */
  // Les prix sont en CENTIMES de gourde partout dans le code et en base.
  // 2 450,00 HTG = 245000. Jamais de décimales, jamais de float sur l'argent.
  devise: 'HTG',

  // Taux indicatif pour l'affichage en dollars. L'acheteur paie en gourdes :
  // ce taux n'entre dans aucun calcul de montant dû, il est figé sur chaque
  // commande à sa création pour que l'historique reste lisible.
  // À remettre à jour de temps en temps.
  tauxUsd: 132.50,

  /* --- Flashipping ----------------------------------------
     Le colis entre dans le réseau du transporteur à l'embarquement.
     Si Flashipping expose une page de suivi publique, mets son
     adresse ici avec {numero} à la place du numéro : l'acheteur
     aura un lien direct. Laisse vide tant qu'elle n'existe pas —
     un lien mort vaut moins que pas de lien.                    */
  flashipping: {
    suiviUrl: ''   // ex. 'https://flashipping.com/suivi?code={numero}'
  },

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
