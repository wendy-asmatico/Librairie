# Storefront WooCommerce React

Ce projet est un front-end React/Vite prêt à brancher sur votre back-office WooCommerce.

## Démarrage

1. Installez les dépendances : `npm install`
2. Lancez le serveur de dev : `npm run dev`
3. Consultez le site en developpement sur : `http://localhost:5173`

## Configuration API

Le front utilise la variable suivante :

- `VITE_API_URL` dans le fichier .env.production, c'est ici que vous renseignerez l'adresse du site woocommerce

## Build

`npm run build`

## Config wordpress

1. creez un dossier /wooc sur le server pour deployer wordpress/woocommerce.
2. installez les plug-in WooCommerce, WooCommerce Stripe Gateway, WooCommerce Tax et JWT Authentication for WP-API.
3. renseignez le fichier wp-config.php.
4. copiez le dossier /mu-plugins dans /wp-content.

### Retrait en boutique

Dans WooCommerce, activez la méthode « Point de vente » / « Retrait sur place »
à coût zéro dans chaque zone d'expédition où le retrait doit être proposé.
L'adresse du retrait est définie dans `mu-plugins/pickup.php`
et `src/utils/pickup.js`.

Le tarif à domicile est défini dans `mu-plugins/pickup.php` pour la France
métropolitaine : 3 € TTC jusqu'à 1 kg, 5 € jusqu'à 2 kg, 7 € au-delà,
et 5 € si un produit n'a pas de poids. Les commandes issues d'un devis
utilisent 5 € TTC. Le calcul exige un taux de TVA français à 20 % applicable
à l'expédition dans la classe standard WooCommerce. Les tarifs sont calculés
en euros et actualisés avant paiement. Mondial Relay nécessite une intégration
et un compte configurés : l'option reste indisponible jusque-là.

## Wireframes

[Le lien Figma](https://www.figma.com/design/118Mfb9r0dApZskAojI4c4/Untitled?node-id=0-1&p=f)

## WordPress local (Docker)

Un WordPress + WooCommerce prêt à l'emploi est fourni dans `wordpress/` :

1. Lancez Docker Desktop, puis : `cd wordpress && docker compose up -d`
2. Première fois seulement : `./setup.sh` (installe WordPress en français, WooCommerce, Stripe, Tax, JWT et crée les catégories de la boutique)
3. Créez un fichier `.env.production.local` à la racine avec `VITE_API_URL=http://localhost:8080`, puis relancez `npm run dev`

Admin : http://localhost:8080/wp-admin (identifiant `admin`, mot de passe `maktaba2026`). Les `mu-plugins` du projet sont montés automatiquement.

4. Optionnel : `./seed.sh` ajoute des données de démo (livres de la maquette avec couvertures, clients, 140 commandes sur 60 jours).

## Tableau de bord administrateur

`/admin` (ex. http://localhost:5173/ecom/admin) : réservé aux comptes `administrator` / `shop_manager`.
Connectez-vous sur le site avec un compte admin, puis ouvrez la page. Les données viennent de l'API WooCommerce (`wc/v3`) avec le jeton JWT.
Les sections « Clients », « Messages » et « Avis clients » proposent des listes
consultables et paginées dans le tableau de bord. Les clients sont les comptes
WooCommerce ayant le rôle client ; les commandes invitées ne créent pas de compte.
Un message est marqué comme lu lorsqu'il est ouvert. Sa suppression le place
dans la corbeille WordPress ; pour une demande de devis ou de coffret, elle le
retire uniquement de la boîte de messages afin de conserver le devis. Les autres
modifications, réponses et la modération restent disponibles dans l'administration WordPress
(`VITE_WP_ADMIN_URL`, défini dans `.env.development`).

Lors de l'ajout d'un produit, une catégorie ou sous-catégorie peut être créée
et sélectionnée directement. Elle est enregistrée immédiatement dans WooCommerce,
même si la création du produit est ensuite annulée.
Lors de l'ajout ou de la modification, les images peuvent être retirées du
produit, de nouvelles images ajoutées et l'image principale choisie. Retirer une image du
produit ne la supprime pas de la médiathèque WordPress. Les images téléversées
avant une erreur restent également dans la médiathèque.
La création et la modification permettent de choisir le statut fiscal et la
classe de TVA configurée dans WooCommerce. Les taux effectifs dépendent des
réglages fiscaux et de l'adresse applicable ; le prix saisi suit le réglage
WooCommerce des prix HT ou TTC. Configurez et activez les taxes dans WooCommerce.

La page « Promotions » permet de créer, modifier et supprimer définitivement
les codes promo WooCommerce : type et valeur de remise, statut, expiration
(heure configurée dans WordPress), minimum d'achat, limites d'utilisation,
produits et catégories concernés. Sans restriction de produits ou de catégories,
le code s'applique à tous les produits éligibles. Si les deux restrictions sont
définies, WooCommerce vérifie chacune sur le panier. Les autres paramètres d'un
code existant restent gérés dans WooCommerce et sont conservés à la modification.

Dans « Commandes », une commande en préparation peut être marquée expédiée,
puis terminée une fois remise au client. Pour un retrait, elle est directement
marquée terminée lors de la remise. Le statut WooCommerce « Expédiée » est
enregistré par `mu-plugins/order-shipping-status.php` et n'envoie pas d'e-mail
automatique ; le passage à « Terminée » conserve les notifications WooCommerce.
