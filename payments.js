/* ============================================================
   Boutique Lakay — moyens de paiement

   Pourquoi ce fichier existe séparément : brancher MonCash ou NatCash
   plus tard ne doit toucher ni la base, ni l'interface, ni le panier.
   Un moyen de paiement = une entrée ici. Rien d'autre à modifier.

   La base accepte déjà : especes, moncash, natcash, carte, virement
   (type moyen_paiement). Le code ci-dessous dit lequel est ouvert.
   ============================================================ */

const PAIEMENTS = {

  /* ---------------------------------------------------------
     OUVERT — phase pilote
     --------------------------------------------------------- */
  especes: {
    code: 'especes',
    nom: { fr: 'Espèces au comptoir', ht: 'Kach nan kontwa a' },
    aide: {
      fr: 'Vous payez au point de retrait, après avoir vu l’article.',
      ht: 'Ou peye nan pwen retrè a, apre ou wè atik la.'
    },
    disponible: true,
    enLigne: false,      // pas de redirection, rien à encaisser en ligne
    // L'agent encaisse à la remise du colis. La plateforme ne détient
    // aucun fonds : Flashipping encaisse en tant que transporteur.
    async preparer() {
      return { type: 'comptoir' };
    }
  },

  /* ---------------------------------------------------------
     FERMÉ — en attente de l'enregistrement de la société

     Ne pas ouvrir ces moyens avant que Boutique Lakay existe
     légalement et dispose d'un compte MARCHAND (pas un compte
     agent : le float d'un compte agent n'est pas un séquestre,
     et s'en servir met en danger le compte lui-même).
     --------------------------------------------------------- */
  moncash: {
    code: 'moncash',
    nom: { fr: 'MonCash', ht: 'MonCash' },
    aide: { fr: 'Paiement par portefeuille Digicel.', ht: 'Peman ak bous Digicel.' },
    disponible: false,
    enLigne: true,
    motif: {
      fr: 'Disponible après l’enregistrement de la société et la signature du contrat marchand.',
      ht: 'Ap disponib apre antrepriz la anrejistre epi kontra machan an siyen.'
    },
    async preparer() {
      throw new Error('MonCash pas encore ouvert');
    }
  },

  natcash: {
    code: 'natcash',
    nom: { fr: 'NatCash', ht: 'NatCash' },
    aide: { fr: 'Paiement par portefeuille Natcom.', ht: 'Peman ak bous Natcom.' },
    disponible: false,
    enLigne: true,
    motif: {
      fr: 'Disponible après l’enregistrement de la société et l’ouverture d’un compte marchand.',
      ht: 'Ap disponib apre antrepriz la anrejistre epi yon kont machan louvri.'
    },
    // Piste la plus courte le jour venu : le QR marchand au comptoir.
    // L'acheteur scanne, l'agent voit le crédit, le colis part.
    // Aucune intégration API nécessaire pour démarrer.
    async preparer() {
      throw new Error('NatCash pas encore ouvert');
    }
  },

  carte: {
    code: 'carte',
    nom: { fr: 'Carte bancaire', ht: 'Kat bankè' },
    aide: { fr: 'Pour les achats depuis l’étranger.', ht: 'Pou acha ki soti deyò.' },
    disponible: false,
    enLigne: true,
    motif: {
      fr: 'Prévu pour la phase diaspora, après le pilote.',
      ht: 'Prevwa pou faz dyaspora a, apre pilòt la.'
    },
    async preparer() {
      throw new Error('Carte pas encore ouverte');
    }
  }
};

/* Les moyens réellement proposés à l'acheteur. */
function moyensDisponibles() {
  return Object.values(PAIEMENTS).filter(function (m) { return m.disponible; });
}

/* Les moyens annoncés mais pas encore ouverts : affichés en grisé,
   avec la raison. Un acheteur qui voit « MonCash bientôt » comprend
   que la plateforme est en construction, pas qu'elle est cassée. */
function moyensAVenir() {
  return Object.values(PAIEMENTS).filter(function (m) { return !m.disponible; });
}

function moyenParDefaut() {
  const dispo = moyensDisponibles();
  return dispo.length ? dispo[0] : null;
}

if (typeof window !== 'undefined') {
  window.PAIEMENTS = PAIEMENTS;
  window.moyensDisponibles = moyensDisponibles;
  window.moyensAVenir = moyensAVenir;
  window.moyenParDefaut = moyenParDefaut;
}
