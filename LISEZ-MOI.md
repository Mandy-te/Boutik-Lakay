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

### Trois interrupteurs à activer

Tous gratuits, tous dans le tableau de bord Supabase :

- **CAPTCHA** (Authentication → Attack Protection) : la vraie réponse à la
  force brute sur l'offre gratuite. Créer un widget Cloudflare Turnstile,
  coller la clé secrète ici, puis câbler la clé publique dans les écrans de
  connexion. C'est la seule des trois qui demande du code.
- **Leaked password protection** (Authentication → Policies) : refuse les mots
  de passe déjà vus dans des fuites connues. Le contrôleur de Supabase le
  signale comme désactivé. Un clic.
- **MFA / TOTP** (Authentication → Multi-Factor) pour les comptes d'équipe :
  une seconde preuve en plus du mot de passe. C'est la meilleure protection
  disponible pour les comptes qui ouvrent la caisse.

Et un quatrième à **désactiver** : *Anonymous sign-ins*, devenu inutile (voir
plus haut).

### Les comptes d'équipe ne devraient pas tenir sur six chiffres

Un acheteur protège un panier, un agent protège la caisse, un administrateur
protège tout. L'administration signale désormais en rouge tout compte agent ou
administrateur qui n'a qu'une adresse interne `@lakay.local`, donc un code à
six chiffres. Pour ceux-là, créer le compte depuis le tableau de bord Supabase
avec une vraie adresse e-mail et un mot de passe long : l'écran de gestion
accepte déjà l'un ou l'autre.

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
