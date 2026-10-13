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

## Wireframes

[Le lien Figma](https://www.figma.com/design/118Mfb9r0dApZskAojI4c4/Untitled?node-id=0-1&p=f)

## WordPress local (Docker)

Un WordPress + WooCommerce prêt à l'emploi est fourni dans `wordpress/` :

1. Lancez Docker Desktop, puis : `cd wordpress && docker compose up -d`
2. Première fois seulement : `./setup.sh` (installe WordPress en français, WooCommerce, Stripe, Tax, JWT et crée les catégories de la boutique)
3. Créez un fichier `.env.production.local` à la racine avec `VITE_API_URL=http://localhost:8080`, puis relancez `npm run dev`

Admin : http://localhost:8080/wp-admin (identifiant `admin`, mot de passe `admin`). Les `mu-plugins` du projet sont montés automatiquement.
