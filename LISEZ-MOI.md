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

Pourquoi : l'acheteur navigue sans compte. Le compte n'est exigé qu'au moment
de commander — un mur d'inscription à l'entrée fait fuir un premier visiteur
qui ne connaît pas encore la plateforme. La session de passage devient un vrai
compte au paiement, sans rien perdre.

### 1 bis. Désactiver la confirmation d'e-mail

**Authentication → Sign In / Providers → Email → « Confirm email » → désactiver.**

Pourquoi : les comptes sont identifiés par le NUMÉRO DE TÉLÉPHONE et un code
secret à 6 chiffres. Techniquement Supabase authentifie par e-mail, donc l'app
fabrique un identifiant interne à partir du numéro (`50931324336@lakay.local`).
L'acheteur ne le voit jamais. Si la confirmation reste active, Supabase attend
une validation sur une adresse qui n'existe pas, et aucun compte ne s'active.

Pourquoi le téléphone plutôt que l'e-mail : tout le monde a un numéro, peu
consultent une boîte mail, et c'est déjà le numéro que l'agent appelle pour
confirmer la commande. Pourquoi un code à 6 chiffres plutôt qu'un mot de passe :
c'est le geste de MonCash, connu de tous, et bien plus facile à taper sur un
téléphone.

Le jour où un envoi de SMS sera budgété, on passera au vrai téléphone Supabase
sans rien changer à ce que voit l'acheteur.

### 2. Créer ton compte d'équipe

L'écran de gestion (`gestion.html`) demande un vrai compte, pas une session
anonyme. Deux étapes, une fois pour toutes.

**a.** Dans Supabase : **Authentication → Users → Add user → Create new user**.
Mets ton adresse e-mail et un mot de passe, et coche *Auto Confirm User*.

**b.** Dans **SQL Editor**, donne-toi le rôle :

```sql
update profiles set role = 'admin'
 where id = (select id from auth.users where email = 'ton.adresse@exemple.com');
```

Pour ajouter un agent plus tard, refais exactement ces deux étapes avec
`'agent'` au lieu de `'admin'`.

Pourquoi c'est nécessaire : seul un compte `agent` ou `admin` peut publier un
produit, vérifier une boutique ou valider un retrait. C'est volontaire — la
qualité des photos décide des ventes, et un vendeur laissé seul avec son
téléphone publie des fiches illisibles.

---

## Quatre écrans, quatre métiers

Une seule adresse à retenir et à partager : **`gestion.html`**. Chacun se
connecte là et arrive sur l'écran de son rôle. Un administrateur voit les trois
et peut ouvrir n'importe lequel — utile pour aider quelqu'un au téléphone en
voyant exactement ce qu'il voit.

| Écran | Pour qui | Ce qu'on y fait |
|---|---|---|
| `index.html` | Acheteurs | Catalogue, panier, commandes, suivi |
| `vendeur.html` | Vendeurs | Préparer ses commandes, son stock, son argent |
| `agent.html` | Agents | Appels, embarquement, remise au client |
| `admin.html` | Administration | Tout le reste |
| `devenir-vendeur.html` | Futurs vendeurs | Inscription libre, sans compte préalable |

**Espace vendeur** — ses commandes à préparer, et deux étapes qu'il est le seul
à pouvoir déclarer : « je prépare » et « c'est prêt ». Il ajuste ses stocks et
corrige ses descriptions. Il ne publie pas lui-même et ne fixe pas les prix :
la qualité des photos décide des ventes. Il voit ce que Boutique Lakay lui doit,
commande par commande.

**Comptoir** — les commandes qui attendent un geste, rangées par urgence : le
client devant le comptoir d'abord, le colis qui attend son camion ensuite. Pour
chacune, le numéro du client bien visible et une seule action possible. Un
client qui a déjà des abandons est signalé en rouge. Une recherche par référence
pour les appels.

**Administration** — tableau de bord, boutiques, catalogue complet, catégories,
points de retrait et tarifs, règlements des vendeurs, comptes et rôles.

### Le lien à envoyer à un vendeur

**`devenir-vendeur.html`** — par exemple
`https://mandy-te.github.io/Boutik-Lakay/devenir-vendeur.html`

Le vendeur s'inscrit seul depuis son téléphone : son nom, son numéro, un code
secret à 6 chiffres, puis sa boutique et ses pièces. Rien n'est visible des
acheteurs tant qu'un agent n'a pas vérifié.

L'inscription ne donne ni le rôle vendeur ni la mise en vitrine : la boutique
naît « en attente », et un compte ne peut pas se promouvoir lui-même — la base
le refuse, pas seulement l'écran. Dans Administration → Boutiques, tu consultes
ses pièces et tu vérifies. Dans Comptes, tu lui donnes le rôle `vendeur`.

Les pièces (patente, pièce d'identité) vont dans un stockage privé, un dossier
par compte. Le vendeur ne voit que les siennes ; l'équipe les ouvre par un lien
signé valable une heure. Elles ne sont jamais exposées publiquement.

### Rattacher une boutique à son vendeur

Les boutiques créées par un agent lui appartiennent au départ. Tant qu'elles ne
sont pas transférées, **le vendeur ouvre son espace et ne voit rien**. Dans
Administration → Comptes : donne le rôle `vendeur` au compte, puis choisis sa
boutique dans la liste qui apparaît.

### Deux refus volontaires

**Publier exige au moins une photo et du stock.** Le bouton refuse sinon. Une
fiche vide ne se vend pas et abîme la confiance dans toute la plateforme, pas
seulement dans ce produit.

**Annuler demande deux appuis.** L'annulation remet les articles en stock et
compte un abandon au client, ce qui le rapproche du prépaiement obligatoire.
Trop lourd de conséquences pour un seul appui sur un téléphone tenu à une main.

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
| `index.html` | App publique : styles et squelette des écrans |
| `app.js` | Interface acheteur, navigation, panier, libellés FR/créole |
| `api.js` | Tout l'accès aux données. **Ce fichier part tel quel dans l'app mobile** |
| `config.js` | Clés Supabase, taux, phase, règles. Le seul à modifier d'habitude |
| `payments.js` | Moyens de paiement. Un moyen = une entrée |
| `gestion.html` | Écran de l'équipe : styles et squelette |
| `gestion.js` | Comptoir, catalogue, boutiques |
| `admin.js` | Fonctions réservées à l'équipe. **Chargé seulement par `gestion.html`** |
| `sw.js` | Cache hors-ligne et installation sur l'écran d'accueil |
| `manifest.webmanifest` | Nom, icônes, couleurs de l'app installée |
| `icon*.png`, `icon.svg` | Icônes |

`admin.js` est séparé exprès : un acheteur ne télécharge pas le code de
gestion. La data mobile coûte cher et il n'a rien à y faire.

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

- **L'envoi des messages.** Les avis sont bien produits et lisibles dans
  l'app — cloche en haut de l'écran acheteur — mais **rien ne part encore**
  ni par e-mail ni par SMS. La table `notifications` fait office de file
  d'attente : le jour où un fournisseur est branché, il n'y a qu'à la vider.
  Pour Haïti, viser le SMS ou WhatsApp plutôt que l'e-mail.
- **Le transfert d'une boutique à son vendeur.** Les boutiques sont créées au
  nom de l'agent. Quand un vendeur aura son propre compte, il faudra pouvoir
  lui passer la propriété.
- **Les litiges.** La table existe et un abandon y laisse une trace. Le bouton
  « ouvrir un litige » côté acheteur n'existera que quand les règles seront
  tranchées : qui arbitre, sous quel délai, avec quel plafond d'indemnisation.
  Un bouton qui promet un arbitrage inexistant est pire que pas de bouton.
- **Les relances automatiques.** Rien ne rappelle au client que son délai de
  retrait court. Il faut une tâche planifiée côté Supabase, pas un bout de
  code dans l'app : personne ne garantit qu'un navigateur sera ouvert.

### Une ligne de ménage à passer dans l'éditeur SQL

Il reste deux versions de `avancer_commande` en base. L'ancienne, à deux
arguments, ne sert plus à rien : son corps renvoie vers la version stricte,
donc elle ne contourne rien. Mais tant qu'elle existe, un appel à deux
arguments est ambigu et Postgres répond `function is not unique`. Pour faire
propre, coller ceci une fois dans l'éditeur SQL de Supabase :

```sql
drop function public.avancer_commande(uuid, statut_commande);
```

Ce n'est pas urgent : l'app appelle toujours la version à trois arguments.

---

## Vers l'application mobile

L'app est déjà installable sur l'écran d'accueil. Pour les magasins Android et
iOS, on l'emballe avec Capacitor : le même code source, sans réécriture, parce
que toute la logique est côté client et que `api.js` ne suppose aucun serveur.

Un point à savoir dès maintenant : Apple refuse les applications qui ne sont
qu'un site web emballé. Il faudra au moins les notifications et un vrai mode
hors-ligne pour passer la revue — les deux sont déjà amorcés ici.
