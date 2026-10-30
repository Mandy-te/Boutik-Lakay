# Boutique Lakay — version 1

Web app autonome, sans étape de compilation. Modifiable depuis un téléphone,
déployable sur GitHub Pages, et emballable plus tard en application Android /
iOS sans réécriture.

---

## Deux interrupteurs à activer avant que l'app fonctionne

L'app est branchée sur le projet Supabase `boutique-lakay`
(`xpiklpznggsrfsxmittr`), dont le schéma est déjà en place. Il reste deux
réglages que seul le tableau de bord permet.

### 1. Autoriser la connexion anonyme

**Authentication → Sign In / Providers → Anonymous sign-ins → activer.**

Pourquoi : il n'y a pas de mur d'inscription. L'acheteur navigue et commande
sans créer de compte, parce qu'en Haïti une inscription par e-mail fait perdre
la majorité des premiers acheteurs. Supabase crée quand même un vrai compte en
arrière-plan, donc la sécurité par ligne fonctionne normalement, et ce compte
pourra recevoir un numéro de téléphone plus tard sans perdre l'historique des
commandes.

Sans cet interrupteur, aucune commande ne peut être créée.

### 2. Te nommer administrateur

Une fois l'app ouverte une première fois sur ton téléphone, va dans
**SQL Editor** et exécute :

```sql
-- Remplace par ton adresse si tu crées un compte par e-mail,
-- ou prends le compte le plus récent si tu es passé par l'app.
update profiles set role = 'admin'
 where id = (select id from auth.users order by created_at desc limit 1);
```

Pourquoi c'est nécessaire : seul un compte `agent` ou `admin` peut publier un
produit. C'est volontaire — la qualité des photos décide des ventes, et un
vendeur laissé seul avec son téléphone publie des fiches illisibles.

---

## Mise en ligne sur GitHub Pages

1. Crée un dépôt, par exemple `boutique-lakay`.
2. Dépose tous les fichiers de ce dossier **à la racine** du dépôt.
3. **Settings → Pages → Source : `main` / `/ (root)`**.
4. L'app est en ligne sur `https://<ton-compte>.github.io/boutique-lakay/`.

Il faut du HTTPS pour que l'installation sur l'écran d'accueil et le mode
hors-ligne fonctionnent. GitHub Pages le fournit.

---

## Les fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Styles et squelette des écrans |
| `app.js` | Interface, navigation, panier, libellés FR/créole |
| `api.js` | Tout l'accès aux données. **Ce fichier part tel quel dans l'app mobile** |
| `config.js` | Clés Supabase, taux, phase, règles. Le seul à modifier d'habitude |
| `payments.js` | Moyens de paiement. Un moyen = une entrée |
| `sw.js` | Cache hors-ligne et installation sur l'écran d'accueil |
| `manifest.webmanifest` | Nom, icônes, couleurs de l'app installée |
| `icon*.png`, `icon.svg` | Icônes |

---

## Décisions inscrites dans le code

**L'argent est en centimes de gourde, partout.** `2 450,00 HTG` s'écrit
`245000`. Jamais de nombre à virgule sur de l'argent : une marketplace qui
arrondit mal perd ses vendeurs au premier écart de solde.

**Une commande se crée en un seul appel.** La base génère la référence, les
lignes, décrémente le stock et produit le code de retrait dans la même
transaction. En trois requêtes séparées sur un réseau qui coupe, une commande
sur dix finirait à moitié créée.

**Le code de retrait n'est stocké que haché.** Il s'affiche une fois à
l'acheteur et reste sur son appareil. Un agent peut le retrouver au comptoir.
Personne d'autre ne peut le lire, pas même en interrogeant la base.

**Rien n'est en cache du côté des prix et des stocks.** Le service worker met
en cache le squelette de l'app, jamais les données. Un prix servi depuis un
cache périmé, c'est un litige au comptoir.

**Le catalogue, lui, a un cache de secours.** Si la requête échoue, l'app
affiche le dernier catalogue connu avec un bandeau qui le dit. La data mobile
coûte cher et le réseau coupe.

---

## Brancher MonCash, NatCash ou la carte le jour venu

Tout est préparé : la base accepte déjà `especes`, `moncash`, `natcash`,
`carte` et `virement`. Il suffit de passer `disponible: true` sur l'entrée
correspondante dans `payments.js` et d'écrire sa fonction `preparer()`.

Deux rappels qui comptent plus que le code :

- **Un compte agent NatCash n'est pas un compte marchand.** Le float d'un
  compte agent appartient au système de l'opérateur. Y garder l'argent
  d'acheteurs en attente de livraison met en danger le compte lui-même, dont
  Flashipping a besoin.
- **Pour démarrer, le QR marchand au comptoir suffit.** L'acheteur scanne,
  l'agent voit le crédit, le colis part. Aucune intégration par API n'est
  nécessaire tant que le retrait se fait en succursale.

Passer `phase` de `pilote` à `sequestre` dans `config.js` change les libellés
et le parcours. À ne faire qu'une fois la société enregistrée.

---

## Ce qui n'est pas encore là

- **Le back-office de publication.** Aucun produit ne peut encore être ajouté
  depuis l'app : c'est la prochaine étape, et sans elle le catalogue reste
  vide.
- **L'espace vendeur.** Les fonctions de lecture existent dans `api.js`,
  l'écran reste à faire.
- **Le comptoir agent** : vérifier un code de retrait, encaisser, marquer la
  commande retirée.
- **Les litiges.** La table existe. Le bouton n'existera que quand les règles
  seront tranchées : qui arbitre, sous quel délai, avec quel plafond
  d'indemnisation.

---

## Vers l'application mobile

L'app est déjà installable sur l'écran d'accueil. Pour les magasins Android et
iOS, on l'emballe avec Capacitor : le même code source, sans réécriture, parce
que toute la logique est côté client et que `api.js` ne suppose aucun serveur.

Un point à savoir dès maintenant : Apple refuse les applications qui ne sont
qu'un site web emballé. Il faudra au moins les notifications et un vrai mode
hors-ligne pour passer la revue — les deux sont déjà amorcés ici.
