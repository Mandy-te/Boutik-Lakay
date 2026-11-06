# Konbit Market — version 1

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

### 1 bis. La confirmation d'e-mail est ACTIVE

**Authentication → Sign In / Providers → Email → « Confirm email » → activé.**

Elle a longtemps été désactivée, et le LISEZ-MOI disait de la laisser éteinte.
C'était juste à l'époque où les comptes naissaient avec une fausse adresse
`@lakay.local` : Supabase envoyait une confirmation dans le vide, et le compte
restait bloqué pour toujours.

Depuis que l'identifiant est une vraie adresse, la raison a disparu — et une
autre est apparue. **Rien ne vérifiait l'identité de personne**, ni téléphone
ni e-mail. N'importe qui pouvait ouvrir vingt comptes avec des adresses
inventées et déclencher vingt commandes que des commerçants préparent pour
rien. Le coût tombait sur eux, pas sur le fraudeur.

**Ce que ça change dans le code, et qui n'est pas évident :** `signUp` ne rend
plus de session tant que le lien n'est pas cliqué. Le navigateur n'a donc plus
aucun moment où il pourrait écrire le profil. Tout ce qui le compose — nom,
téléphone, commune, département, langue, version des conditions — voyage
**dans les métadonnées de l'inscription**, et c'est le trigger `creer_profil()`
qui le pose en base. Un champ oublié dans `metadonnees` est un champ perdu pour
toujours, sans erreur nulle part.

**Le parcours vendeur a un pli de plus.** La boutique se crée juste après le
compte, et sans session elle ne peut pas. `devenir-vendeur.js` met donc la fiche
de côté dans `localStorage` sous `km.brouillon.boutique`, affiche l'écran
d'attente, et termine le travail au retour du lien. Si le vendeur ouvre le
courriel sur un autre appareil, le brouillon est perdu : son compte est actif,
sa boutique reste à créer, et l'écran le lui dit. L'administration a déjà le
bouton « Créer en attente » pour la saisir à sa place.

**Les comptes en rade se voient.** Onglet Comptes de l'administration, bloc
« En attente de confirmation », avec le nombre d'heures. Au-delà de 24 h c'est
presque toujours une adresse mal tapée : la personne croit son compte créé,
n'apparaît dans aucune liste, et revient au comptoir en disant que le site ne
marche pas. Sans ce bloc, personne ne le saurait.

**Les deux modèles de courriel** sont dans `courriels/` : `confirmation.html`
pour « Confirm signup », `reinitialisation.html` pour « Reset Password ».

### 1 ter. Les deux réglages à corriger pour les mots de passe

**Authentication → Policies → Minimum password length → passer de 6 à 8.**
Il était à 6 du temps des codes à six chiffres. L'application en exige déjà 8,
mais un appel direct à l'API passerait encore avec 6 : ce réglage est le
plancher réel.

**Authentication → URL Configuration → Redirect URLs → ajouter
`https://konbitmarket.com/nouveau-mot-de-passe.html`.** Sans cette ligne,
Supabase refuse de renvoyer la personne sur la page où elle choisit son
nouveau mot de passe, et le lien reçu par e-mail ne mène nulle part.

### 1 quater. Brancher un vrai envoi d'e-mail

Sans ça, « mot de passe oublié » ne marche pas vraiment : l'envoi fourni par
défaut est limité à quelques messages par heure, destiné aux essais, et finit
régulièrement en indésirables. C'est la pièce qui manque pour que le mot de
passe soit un vrai mot de passe.

**1. Créer le domaine d'envoi chez Resend** (3 000 messages par mois gratuits,
100 par jour — large pour le pilote). Ajouter le domaine **`konbitmarket.com`**.
Resend génère trois enregistrements à poser chez Porkbun :

| Type | Host | Valeur |
|---|---|---|
| MX | `send` | celle affichée par Resend, priorité **20** |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey` | la clé DKIM affichée par Resend |

Deux pièges, et ils coûtent une soirée chacun :

- **Resend passe par le sous-domaine `send`, pas par la racine.** C'est
  précisément ce qui évite d'écraser les MX de redirection d'e-mail de
  Porkbun et le SPF de la racine, qui restent en place et continuent de
  servir. Ne touche pas aux enregistrements existants.
- **La priorité MX doit être 20, pas 10.** Porkbun utilise déjà 10 pour
  `fwd1.porkbun.com`. Deux MX à la même priorité, et le comportement devient
  imprévisible.

Dans le champ Host de Porkbun, on écrit **seulement le préfixe** : `send`, pas
`send.konbitmarket.com`.

**2. Brancher Resend dans Supabase.**
Authentication → Emails → SMTP Settings, activer « Enable Custom SMTP » :

| Champ | Valeur |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | la clé d'API Resend |
| Sender email | `contact@konbitmarket.com` |
| Sender name | `Konbit Market` |

**3. Coller le courriel en français.**
Authentication → Emails → **Reset Password** : remplacer le contenu par
`courriels/reinitialisation.html` de ce dépôt.

Le modèle par défaut de Supabase est en anglais et dit « Reset Password ».
Envoyé à quelqu'un qui vend du savon aux Gonaïves, il ne veut rien dire. Le
nôtre est en français avec le créole sous chaque phrase qui compte, en
tableaux et styles en ligne parce que les clients de messagerie ignorent les
feuilles de style, et le lien est répété en texte brut sous le bouton pour
les téléphones qui ne les affichent pas.

La seule variable est `{{ .ConfirmationURL }}`. La renommer casse tout.

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
la qualité des photos décide des ventes. Il voit ce que Konbit Market lui doit,
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
`https://konbitmarket.com/devenir-vendeur.html`

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

### La formule n'est plus choisie à l'inscription

Toute nouvelle boutique démarre sur `gratuit` — la constante `PLAN_DEPART`
dans `devenir-vendeur.js`. La grille tarifaire ne s'affiche plus
publiquement, pour deux raisons : elle renseignait la concurrence, et elle
demandait à quelqu'un qui n'a encore rien vendu de choisir un taux de
commission qu'il n'a aucun moyen d'évaluer.

La montée en gamme se propose depuis l'administration, quand la boutique a
du volume. C'est aussi le bon moment commercial : on négocie mieux un taux
avec un vendeur qui vend déjà qu'avec un inscrit du jour.

**Attention au plafond.** `gratuit` limite à **10 articles**. Un vendeur qui
en a trente sera bloqué et viendra se plaindre avant que tu aies eu le temps
de le faire monter. Soit tu surveilles les nouvelles boutiques de près, soit
tu relèves `max_references` sur `gratuit` en base.

### Deux refus volontaires

**Publier exige au moins une photo et du stock.** Le bouton refuse sinon. Une
fiche vide ne se vend pas et abîme la confiance dans toute la plateforme, pas
seulement dans ce produit.

**Annuler demande deux appuis.** L'annulation remet les articles en stock et
compte un abandon au client, ce qui le rapproche du prépaiement obligatoire.
Trop lourd de conséquences pour un seul appui sur un téléphone tenu à une main.

---

## Les conditions d'utilisation

Deux pages publiques, `conditions.html` et `confidentialite.html`, liées
depuis le pied de page de tous les écrans publics. Elles sont écrites pour
être lues : un encadré de résumé en tête, des titres qui accrochent au
défilement, et une langue simple. Un texte légal que personne ne lit ne
protège personne.

### La case à l'inscription

L'inscription — acheteur comme vendeur — ne passe pas sans cocher la case.
Le contrôle est posé **dans `API.creerCompte()`**, c'est-à-dire dans le seul
chemin commun aux deux formulaires : un écran qui oublierait la case ne
pourrait pas créer de compte pour autant.

### Pourquoi la date vient de la base, et pas du téléphone

Le client n'envoie que `conditions_version`. Il n'envoie **jamais** la date.
C'est un trigger, `horodater_conditions()`, qui inscrit
`conditions_acceptees_le` au moment où la version change, et qui refuse
qu'on l'efface ou qu'on la remplace.

La raison est simple : une acceptation qu'un téléphone pourrait antidater ne
prouverait rien le jour où elle servirait. Si la preuve peut être fabriquée
par celui qu'elle engage, ce n'est pas une preuve.

### Quand tu modifies le texte

Change `CONFIG.conditions.version` dans `config.js` dès que tu touches au
fond de l'un des deux documents. Les comptes existants garderont l'ancienne
version, et on saura qui doit réaccepter. Laisser la version figée
reviendrait à affirmer que tout le monde a accepté un texte que personne n'a
vu.

### Ce qui reste à faire

- **Les comptes créés avant cette mise en ligne n'ont rien accepté.** Leur
  `conditions_version` est vide. Comme la base sera remise à zéro avant
  l'ouverture au public, le problème se règle tout seul — mais si tu changes
  d'avis sur le reset, il faudra leur présenter le texte à la connexion.
- **Pas de version créole.** L'application est bilingue, les deux documents
  ne le sont pas. C'est une vraie lacune pour une plateforme haïtienne. Si tu
  fais traduire, il faudra dire laquelle des deux versions fait foi en cas de
  désaccord d'interprétation.
- **Ces textes n'ont pas été relus par un avocat.** Ils sont honnêtes et
  collent à ce que fait réellement la plateforme, ce qui est déjà plus que
  beaucoup de sites en ligne. Ça ne remplace pas une relecture avant que de
  l'argent commence à circuler.

---

## Mise en ligne sur GitHub Pages

1. Crée un dépôt, par exemple `konbit-market`.
2. Dépose tous les fichiers de ce dossier **à la racine** du dépôt.
3. **Settings → Pages → Source : `main` / `/ (root)`**.
4. L'app est en ligne sur `https://<ton-compte>.github.io/<dépôt>/`.

Il faut du HTTPS pour que l'installation sur l'écran d'accueil et le mode
hors-ligne fonctionnent. GitHub Pages le fournit.

### Le nom de domaine

Le site répond sur **`konbitmarket.com`**. Trois pièces, et il faut les trois :

**1. Le fichier `CNAME`** à la racine du dépôt contient une seule ligne,
`konbitmarket.com`. C'est lui qui dit à GitHub quel domaine servir. Ne le
supprime jamais : sans lui le domaine se détache tout seul à la prochaine
mise en ligne.

**2. Les enregistrements DNS** chez le registraire (Porkbun) :

| Type | Hôte | Valeur |
|---|---|---|
| A | (vide) | `185.199.108.153` |
| A | (vide) | `185.199.109.153` |
| A | (vide) | `185.199.110.153` |
| A | (vide) | `185.199.111.153` |
| AAAA | (vide) | `2606:50c0:8000::153` |
| AAAA | (vide) | `2606:50c0:8001::153` |
| AAAA | (vide) | `2606:50c0:8002::153` |
| AAAA | (vide) | `2606:50c0:8003::153` |
| CNAME | `www` | `mandy-te.github.io` |

Les quatre A sont les quatre machines de GitHub : si une tombe, le navigateur
essaie la suivante. Les AAAA sont les mêmes en IPv6 — beaucoup de téléphones
en 4G passent par là, les mettre coûte une minute et évite un site injoignable
pour une partie des visiteurs.

**3. `Settings → Pages → Enforce HTTPS`**, à cocher une fois que GitHub a fini
de délivrer le certificat (quelques minutes à une heure après la propagation).

### Comment on se connecte

Le compte est identifié côté Supabase par **l'adresse e-mail réelle**, et la
personne entre avec **son numéro ou son adresse**, au choix. Les deux sont
voulus, pour deux raisons opposées : tout le monde connaît son numéro par
cœur, mais seul un e-mail réel permet de renvoyer un mot de passe perdu.

La traduction numéro → identifiant se fait en base, dans
`email_pour_telephone()` : `auth.users` n'est pas lisible depuis le navigateur.

**Ce que cette fonction coûte, et qu'il faut savoir :** elle dit à un appelant
anonyme si un numéro a un compte, et rend l'adresse. C'est le prix de « se
connecter par numéro OU par e-mail » — y renoncer demanderait de renoncer à
l'une des deux. Ce qu'on a limité : rien ne sort si le numéro n'est pas
exactement valide, et rien ne sort non plus si deux comptes le partagent.

**Un numéro, un compte — et c'est la base qui le garantit mal.** Supabase ne
contrôle l'unicité que de l'adresse, pas du téléphone. `creerCompte()`
vérifie donc avant de créer. Si deux comptes finissent quand même au même
numéro, la connexion par téléphone cesse de marcher **pour les deux** : elle
refuse de trancher au hasard. Ils peuvent toujours entrer par leur adresse.

### Le domaine interne `lakay.local` — à ne pas toucher

Il ne sert plus à créer de compte, mais quatre comptes d'équipe sont nés
avec, du temps où l'identifiant était fabriqué à partir du numéro
(`50931324336@lakay.local`). Ils se connectent toujours, par leur numéro.

Changer cette chaîne dans `api.js` les couperait. Et comme ces adresses ne
reçoivent rien, ces comptes-là **ne peuvent pas récupérer un mot de passe
oublié**. À recréer avec de vraies adresses — l'administration les signale
déjà en rouge.

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

## Le colis, pas la commande

C'est le point le plus important à comprendre avant de toucher au code.

Une commande peut partir de plusieurs villes. Les articles d'une même ville
sont emballés ensemble : c'est un **colis**. Il a sa ville de départ, son
numéro de suivi Flashipping, son avancement et **son propre code de retrait**.

Ce qui en découle :

- **un frais par colis, donc par ville.** Trois vendeurs du Cap dans le même
  panier ne font payer qu'un trajet. Le Cap plus Hinche en fait payer deux ;
- **le retrait se fait colis par colis.** L'acheteur vient chercher ce qui est
  arrivé sans attendre le reste, avec le code de CE colis. Le délai de 72 h
  court par colis, à partir de son arrivée au comptoir ;
- **le vendeur est réglé dès que SON colis est retiré**, sans attendre un
  colis parti d'une autre ville ;
- **un colis annulé retombe seul** : son montant et son frais sortent du
  total, les autres continuent. Le compteur d'abandons du client ne monte que
  si c'est lui qui n'est pas venu — pas quand un vendeur fait défaut ;
- **le vendeur déclare sa part**, pas le colis. Le colis passe « prêt » tout
  seul lorsque tous les vendeurs de la ville ont remis la leur. Il voit alors
  un simple décompte — combien de vendeurs, combien ont fini — et jamais ce
  que vendent les autres.

**Un vendeur ne peut pas bloquer un colis.** S'il ne remet jamais sa part, on
la retire : ses articles retournent dans son stock, leur montant sort du total
que l'acheteur paiera au comptoir, l'acheteur et le vendeur sont prévenus, et
le colis repart avec ce qui a été remis. Si la part retirée était la dernière
attendue, le colis passe « prêt » tout seul ; s'il ne reste plus rien, le
colis s'annule, sans que le compteur d'abandons de l'acheteur bouge — ce
n'était pas sa faute. Une ligne retirée n'est jamais supprimée : elle reste
visible, barrée, avec son motif, côté acheteur comme au comptoir. Un total qui
baisse sans explication est pire qu'un article manquant.

La commande, elle, ne décide plus de rien : son statut et ses totaux sont
**déduits** de ses colis par un déclencheur. Son statut est celui du colis le
moins avancé, pour qu'elle ne paraisse jamais terminée alors qu'un colis roule
encore. Les deux seules choses qui restent au niveau de la commande sont
l'appel de confirmation — on appelle le client une fois, pas une fois par
colis — et la clôture finale.

---

## L'administration peut tout faire, depuis un seul écran

L'administrateur a les mêmes gestes de comptoir que l'agent — appeler le
client, embarquer un colis avec son numéro de suivi, le déclarer arrivé,
encaisser contre le code, annuler — dans un onglet **Comptoir**. Ces cartes et
ces boutons vivent dans `comptoir.js`, partagé avec l'écran agent : le même
geste ne doit pas exister en deux exemplaires, sinon l'un des deux finira par
laisser sauter une étape que l'autre interdit.

Les tuiles du tableau de bord mènent à l'onglet qui permet d'agir. Lire
« 2 à appeler » sans pouvoir appeler depuis la même application est une
impasse.

Dans l'onglet **Boutiques**, cliquer sur le nom d'un vendeur ouvre sa fiche :
ce qu'on lui doit, ce qu'on lui a déjà versé, la commission gardée, l'état de
son catalogue, et tous ses colis rangés par étape — à appeler, à préparer,
prêts, en route, au comptoir — avec les mêmes boutons qu'au comptoir. Le
règlement se fait depuis là aussi, sur ce qui est dû au moment du clic et non
sur une liste qui peut dater.

---

## Faire entrer un agent

Il n'y a qu'une adresse pour toute l'équipe : **`gestion.html`**. Elle ne
montre rien par elle-même — elle regarde le rôle du compte et renvoie chacun
vers son écran. Un agent arrive au comptoir, un vendeur dans son espace, un
administrateur choisit entre les trois.

La marche à suivre, dans cet ordre :

1. l'agent crée un compte ordinaire sur la boutique en ligne, avec son numéro
   et un code à six chiffres, comme n'importe quel acheteur ;
2. dans l'onglet **Comptes**, tu le retrouves par son nom ou son numéro et tu
   lui donnes le rôle **Agent** ;
3. tu lui envoies le lien `gestion.html` — le bouton « Copier le lien
   complet » le met dans le presse-papiers, prêt pour WhatsApp.

Il n'y a pas de création de compte depuis l'administration, et c'est
volontaire : le code secret ne doit jamais transiter par toi.

**Un compte d'équipe ne devrait pas posséder de boutique.** Celui qui vérifie
les vendeurs serait juge et partie, et son argent apparaîtrait dans la dette
de la plateforme envers ses propres vendeurs. L'administration le signale
désormais en rouge, dans l'onglet Comptes comme dans la fiche de la boutique.
Les boutiques créées par un agent lui appartiennent au départ : il faut les
rattacher à leur vrai propriétaire.

---

## Sécurité : où est le mur

Il faut être clair sur un point qui prête à confusion.

**Les quatre écrans ne sont pas protégés, et ne peuvent pas l'être.** `admin.html`
est un fichier public sur GitHub Pages : n'importe qui peut l'ouvrir, lire tout
le JavaScript, voir l'adresse Supabase et la clé publique dans `config.js`. Cette
clé est faite pour être publique. Cacher ces fichiers donnerait une illusion de
sécurité, pas de la sécurité : un navigateur doit pouvoir les lire pour les
exécuter.

**Le mur est dans la base, et nulle part ailleurs.** Chaque table a ses règles de
lecture et d'écriture (RLS), et chaque geste qui engage de l'argent ou la parole
de la plateforme passe par une fonction qui vérifie elle-même le rôle de
l'appelant. Ouvrir `admin.html` sans être administrateur donne un écran vide :
la page demande, la base refuse. C'est le bon modèle — celui où la sécurité ne
dépend pas de ce que le client veut bien s'interdire.

### Ce qui a été essayé, et bloqué

Tout ceci a été tenté pour de vrai contre la base, en se faisant passer
successivement pour un acheteur, un vendeur et un visiteur sans compte :

- se promouvoir administrateur ; lire les commandes, les comptes ou les codes de
  retrait d'autrui ; lire le journal d'argent ;
- faire avancer un colis, encaisser un retrait, déclencher un règlement,
  retirer la part d'un vendeur ;
- changer un prix, un stock, le total d'une commande, ajouter une ligne à une
  commande existante, neutraliser un code de retrait, créer un point de retrait ;
- côté vendeur : voir le catalogue non publié d'un concurrent, modifier ses prix
  ou son stock, détourner sa boutique, se publier sans passer par la révision,
  s'écrire un paiement ;
- sans compte : lire les comptes, les commandes, les brouillons.

Aucun n'est passé. La vitrine publique reste lisible, ce qui est le but.

### Deux failles trouvées et corrigées

**Un vendeur pouvait se vérifier lui-même.** La règle laissait le propriétaire
modifier sa boutique — normal pour le nom ou la description — sans distinguer
les colonnes. Il pouvait donc passer sa boutique de « en attente » à
« vérifiée » sans avoir déposé ni patente ni pièce d'identité, et porter le
badge VÉRIFIÉ devant les acheteurs. Le badge ne valait plus rien.

**Et il pouvait la créer déjà vérifiée.** Bloquer la modification ne suffisait
pas : la même faille passait par la porte de la création.

Désormais quatre champs n'appartiennent plus au vendeur — le statut, le
propriétaire, la ville et le dépôt de garantie — et une boutique créée par un
vendeur naît toujours en attente, quoi qu'il envoie. Le reste (nom,
description, repère, pièces déposées) lui appartient toujours.

### Quatrième correction : personne ne traite sa propre commande

Un agent est un client comme un autre, et il peut commander avec son compte —
c'est normal, et le bloquer serait absurde. Mais rien ne l'empêchait de
confirmer son propre appel, de pousser son colis jusqu'au comptoir et de
valider son propre code. Un paiement en espèces était enregistré, que personne
n'avait vu passer : il repartait avec la marchandise et les livres disaient
qu'il avait payé.

Ce n'était pas un trou dans les droits — un agent a le droit de faire ces
gestes. C'était un défaut de **séparation** : le même geste ne doit pas être
demandé et validé par la même personne.

Chaque geste d'équipe refuse désormais de s'appliquer à la commande de celui
qui le demande : confirmation téléphonique, avancement d'un colis, encaissement,
annulation, retrait de la part d'un vendeur. Et personne ne règle sa propre
boutique. Au comptoir, sa propre commande s'affiche sans boutons, avec la
raison : un collègue doit la traiter.

Deux conséquences voisines, du même esprit :

- **un vendeur achète chez les autres mais pas chez lui-même.** Il y perdrait
  la commission, donc ce n'est pas une fraude rentable — c'est une fraude de
  vitrine : quelques commandes à soi-même et une boutique neuve paraît active.
  Devant un acheteur, ou devant un investisseur à qui on montre les chiffres,
  ces ventes-là mentent ;
- **un simple visiteur n'est plus un compte.** Ouvrir la boutique crée une
  session anonyme — c'est ce qui permet de regarder le catalogue sans
  s'inscrire — et cette session créait aussi une fiche « Nouveau client ».
  D'où dix-sept acheteurs pour trois personnes réelles. La fiche se crée
  maintenant au moment où le compte devient réel. Attention au détail : une
  session anonyme est promue SUR PLACE, même identifiant, donc c'est une mise
  à jour de `auth.users` et pas une insertion — d'où le second déclencheur.
  Sans lui, plus personne n'aurait de fiche.

### Le verrou contre la force brute : écrit, mais dormant

ATTENTION, à lire avant de compter dessus. La fonction
`hook_verification_mot_de_passe` existe et fonctionne, mais le *Password
Verification Attempt hook* de Supabase est **réservé aux plans Team et
Enterprise**. Sur l'offre gratuite, le menu l'affiche grisé. La fonction reste
en place, testée, prête : le jour d'un passage à un plan supérieur, c'est un
seul interrupteur. D'ici là, personne ne l'appelle et elle ne protège rien.

Ce qui protège réellement l'authentification sur l'offre gratuite :

- **les limites de requêtes** (Authentication → Rate Limits), par adresse IP.
  Ne pas les serrer trop : en Haïti, les opérateurs font passer des milliers
  d'abonnés derrière quelques adresses, donc une limite agressive bloque des
  clients légitimes ;
- **le CAPTCHA** (Authentication → Attack Protection), lui bien disponible en
  gratuit, avec hCaptcha ou Cloudflare Turnstile. C'est la vraie réponse à la
  force brute. Il demande une clé Cloudflare et quelques lignes dans les
  écrans de connexion : à câbler quand la clé existe, pas avant ;
- **des mots de passe de vrais mots de passe pour l'équipe**, et MFA/TOTP
  (Authentication → Multi-Factor), gratuit.

### Une visite ne crée plus de compte

La première ouverture de la boutique ouvrait une session anonyme. Elle ne
servait à rien : le catalogue, les boutiques, les points de retrait et les
tarifs se lisent avec la clé publique, sans aucun compte.

Elle coûtait trois choses. Une ligne dans `auth.users` par navigateur, donc du
bruit. Une porte ouverte à qui veut en créer des milliers. Et surtout, elle
rendait le CAPTCHA inutilisable : il se serait appliqué à cette session, donc
à la simple consultation du catalogue, avant même d'avoir vu un article. Sur
une connexion mobile haïtienne, c'est rédhibitoire.

Conséquence : **l'interrupteur « Anonymous sign-ins » peut être désactivé**
(Authentication → Sign In / Providers). Plus rien ne l'utilise. Les navigateurs
qui ont déjà une session anonyme continuent de fonctionner et la transforment
en vrai compte à l'inscription, comme avant.

### Le CAPTCHA : l'ordre compte, sinon tout le monde est dehors

C'est la seule vraie protection contre la force brute disponible sur l'offre
gratuite, et le code est prêt. Mais l'ordre des trois étapes n'est pas
négociable :

1. créer le site sur **hCaptcha** — le fournisseur doit correspondre à celui
   choisi dans Supabase — et noter la **clé de site** et le **secret** ;
2. coller la **clé de site** dans `config.js`, puis **mettre en ligne** ;
3. seulement après, coller le **secret** dans Supabase (Authentication →
   Attack Protection) et activer.

Dans l'autre sens, Supabase réclame un jeton que l'application en ligne
n'envoie pas encore : plus personne ne se connecte ni ne s'inscrit, le temps
du déploiement.

Tant que `cleSite` est vide, ce code ne fait rien : aucune librairie chargée,
aucun octet de données mobiles dépensé. Le captcha ne se déclenche qu'à
l'inscription et à la connexion, jamais sur le catalogue — c'est précisément
pour ça que la session anonyme a été supprimée.

**Pour savoir si le domaine est autorisé, ne cherchez pas dans les menus :
ouvrez `verif-captcha.html`.** Cette page demande un vrai jeton depuis le
domaine où elle tourne et dit en clair si ça marche. C'est la seule preuve qui
compte, et elle teste aussi le câblage de l'application. Elle ne charge ni
Supabase ni `api.js` : si quelque chose cloche, on sait que c'est le captcha et
rien d'autre. À ressortir le jour du passage sur un nom de domaine propre.

### Ce qui est réservé aux plans payants, contrairement à ce qu'on croit

Deux protections paraissent disponibles et ne le sont pas sur l'offre gratuite.
Le tableau de bord laisse actionner l'interrupteur, et refuse à
l'enregistrement :

- **Password Verification Attempt hook** — Team et Enterprise. La fonction
  `hook_verification_mot_de_passe` est écrite et testée, dormante en attendant.
- **Prevent use of leaked passwords** (HaveIBeenPwned) — Pro et au-dessus.

Ce qui reste gratuit et réel : le CAPTCHA, les **limites de requêtes**
(Authentication → Rate Limits, à ne pas serrer trop fort : les opérateurs
haïtiens font passer des milliers d'abonnés derrière quelques adresses IP), et
**MFA / TOTP** (Authentication → Multi-Factor) pour les comptes d'équipe.

Un piège à connaître dans ces mêmes réglages : **« Minimum password length »
doit rester à 6**. C'est la longueur exacte du code secret des acheteurs. Le
monter à 8 ferait échouer toutes les inscriptions, sans message
compréhensible. Rien n'empêche en revanche un compte d'équipe d'avoir un mot
de passe beaucoup plus long : c'est un plancher, pas un plafond.

Et un interrupteur à **désactiver** : *Anonymous sign-ins*, devenu inutile
(voir plus haut).

### Les comptes d'équipe ne devraient pas tenir sur six chiffres

Un acheteur protège un panier, un agent protège la caisse, un administrateur
protège tout. L'administration signale désormais en rouge tout compte agent ou
administrateur qui n'a qu'une adresse interne `@lakay.local`. Ces comptes-là
sont nés avec un code à six chiffres, et surtout ils ne peuvent **pas**
récupérer un mot de passe oublié : leur adresse ne reçoit rien. Pour ceux-là,
recréer le compte avec une vraie adresse e-mail et un mot de passe long.

### Ce qui ressort du contrôleur et qu'il ne faut PAS « corriger »

Le contrôleur de Supabase signale que `est_staff()`, `est_ma_commande()` et
leurs voisines sont exécutables sans être connecté. C'est normal et nécessaire :
ces fonctions sont appelées **par les règles de lecture elles-mêmes**. La
vitrine publique lit `boutiques`, dont la règle appelle `est_staff()` — retirer
ce droit ferait tomber le catalogue entier pour les visiteurs. Ça a déjà été
tenté une fois dans ce projet, et tout s'est effondré. Ces fonctions ne révèlent
rien : elles répondent par oui ou non sur l'appelant lui-même.

### Troisième correction : les pièces justificatives

`boutiques` est lisible par tout le monde dès qu'une boutique est vérifiée —
c'est ce qui fait marcher la vitrine. Or les règles de lecture sont par LIGNE,
pas par colonne : impossible d'y cacher deux champs. Le chemin des pièces
d'identité et des patentes était donc visible de n'importe qui, même si le
fichier lui-même restait inatteignable.

Ces chemins vivent maintenant dans `documents_boutique`, une table qui ne
contient que ça et ne se lit que par le propriétaire de la boutique ou par
l'équipe. Un acheteur et un visiteur n'y voient rien — pas même l'existence
d'une pièce. Un vendeur dépose et remplace les siennes, ne touche pas à celles
d'un concurrent et ne supprime rien.

Les anciennes colonnes `boutiques.piece_identite_url` et
`boutiques.patente_url` ont été vidées et marquées mortes. Elles restent dans
le schéma faute de pouvoir les supprimer depuis ici ; pour faire propre, coller
une fois dans l'éditeur SQL de Supabase :

```sql
alter table public.boutiques
  drop column piece_identite_url,
  drop column patente_url;
```

Sans urgence : elles sont vides et plus aucun code ne les lit ni ne les écrit.

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
