# Démonstration ACF : page exemple

Cette démo relie la page React `/exemple-acf` à une page WordPress et à cinq champs ACF. Le front-end appelle `GET /wp-json/custom/v1/acf-demo` ; l’endpoint est défini dans `mu-plugins/acf-demo.php`.

## 1. Activer ACF

Vérifiez que l’extension **Advanced Custom Fields** est installée et activée dans WordPress. Elle n’est pas installée par le script de configuration WordPress local de ce dépôt.

## 2. Créer la page WordPress

Dans **Pages → Ajouter**, créez une page publiée avec :

- Titre : `Exemple ACF`
- Permalien / slug : `exemple-acf`

Si vous ne voyez pas les réglages du permalien dans l’éditeur, publiez ou enregistrez d’abord la page. Vous pouvez ensuite aller dans **Pages → Toutes les pages**, choisir **Modification rapide** sous « Exemple ACF », saisir `exemple-acf` dans **Slug**, puis cliquer sur **Mettre à jour**.

## 3. Créer le groupe de champs

Dans **ACF → Groupes de champs**, créez un groupe, par exemple `Contenu de la page exemple`, et réglez son emplacement sur **Page est égale à Exemple ACF**. Ajoutez les champs suivants avec les noms techniques exacts :

| Libellé | Nom du champ | Type ACF | Exemple |
| --- | --- | --- | --- |
| Titre principal | `hero_title` | Texte | Découvrez notre sélection |
| Texte | `hero_text` | Zone de texte | Des livres choisis avec soin… |
| Image | `hero_image` | Image | Format de retour : **URL de l’image** |
| Texte du bouton | `button_text` | Texte | Voir le catalogue |
| Lien du bouton | `button_url` | URL | `https://…/ecom/catalogue` |

Enregistrez le groupe, remplissez les champs sur la page, puis mettez la page à jour.

## 4. Vérifier puis afficher

Ouvrez d’abord `/wp-json/custom/v1/acf-demo` sur le domaine WordPress. Vous devez voir les valeurs saisies sous les clés `title`, `text`, `image`, `button_text` et `button_url`. Ensuite ouvrez `/ecom/exemple-acf` sur le site React, généralement `http://localhost:5173/ecom/exemple-acf` en développement.

Si l’API indique qu’ACF n’est pas actif, activez l’extension sur cette instance WordPress. Si elle indique que la page n’existe pas, vérifiez son slug et son statut publié.

---

# Tutoriel : rendre un composant réutilisable avec ACF

Dans cet exemple, le composant **Trust** affiche les engagements de la boutique. Il est déjà réutilisé sur l’accueil, le catalogue et la page contact. On va gérer ses quatre textes depuis WordPress pour qu’une modification s’applique partout.

Cette méthode fonctionne avec la version gratuite d’ACF : on stocke les valeurs dans une page WordPress ordinaire utilisée comme page de réglages. Il n’est pas nécessaire d’installer ACF Pro ni d’utiliser un champ « Répéteur ».

## 1. Créer la page de réglages dans WordPress

Dans **Pages → Ajouter**, créez une page publiée avec :

- Titre : `Réglages des engagements`
- Slug : `reglages-engagements`

Cette page sert uniquement à stocker les valeurs ACF. Le composant React ne reprend pas son contenu WordPress : il lit les champs par l’API dédiée.

## 2. Créer et associer les champs ACF

Dans **ACF → Groupes de champs**, créez un groupe nommé `Engagements du site`. Pour sa règle de localisation, choisissez **Page est égale à Réglages des engagements**. Ajoutez quatre champs de type **Texte** avec ces noms techniques exacts :

| Libellé | Nom technique | Exemple de valeur |
| --- | --- | --- |
| Engagement 1 | `engagement_1` | Retrait gratuit en boutique |
| Engagement 2 | `engagement_2` | Livraison soignée |
| Engagement 3 | `engagement_3` | Paiement 100% sécurisé |
| Engagement 4 | `engagement_4` | Conseil & accompagnement |

Enregistrez le groupe. Ouvrez ensuite **Pages → Toutes les pages → Réglages des engagements**, remplissez les quatre champs ACF et cliquez sur **Mettre à jour**.

## 3. Vérifier la réponse de l’API

Dans le navigateur, ouvre l’endpoint de ton WordPress :

- En développement avec le proxy du site : `http://localhost:5173/woo-api/wp-json/custom/v1/trust-settings`
- Ou directement sur ton installation WordPress : ajoute `/wp-json/custom/v1/trust-settings` à son adresse.

La réponse attendue ressemble à ceci :

```json
{
	"items": [
		"Retrait gratuit en boutique",
		"Livraison soignée",
		"Paiement 100% sécurisé",
		"Conseil & accompagnement"
	]
}
```

L’endpoint est ajouté dans `mu-plugins/acf-demo.php` (le même mu-plugin que l’endpoint de la page exemple). Les icônes et la présentation restent définies dans React ; seuls les textes viennent d’ACF.

## 4. Voir le composant et tester sa réutilisation

Ouvre `http://localhost:5173/ecom/composant-acf`. Cette page de démonstration montre le composant `Trust` seul. Le même composant est utilisé sur l’accueil, le catalogue et la page contact ; les textes ACF seront donc communs à tous ces emplacements.

Après avoir modifié les champs dans WordPress, recharge les pages du site pour voir les changements. Si l’API renvoie une erreur 404, vérifie le slug et le statut publié de la page de réglages. Si les valeurs sont vides, vérifie les noms techniques des champs et enregistre à nouveau la page.

---

# Exemple ACF : HomeCategories sur la page d’accueil

Le composant `HomeCategories` de la page d’accueil est maintenant branché à ACF. Ses textes, liens et quatre images peuvent être modifiés dans WordPress. Les champs sont définis dans `mu-plugins/acf-demo.php` et apparaissent automatiquement dans l’éditeur ACF de la page « Réglages accueil » ; il ne faut pas créer un deuxième groupe de champs manuellement.

## Où modifier le contenu

Dans WordPress, ouvre **Pages → Toutes les pages → Réglages accueil**. Le slug doit être `reglages-accueil`. Dans le panneau **Contenu HomeCategories**, tu peux modifier les champs suivants, puis cliquer sur **Enregistrer** :

| Champ affiché | Nom technique ACF |
| --- | --- |
| Accroche du bloc | `home_eyebrow` |
| Titre du bloc | `home_title` |
| Texte descriptif | `home_description` |
| Texte / lien bouton principal | `home_primary_button_text` / `home_primary_button_url` |
| Texte / lien bouton secondaire | `home_secondary_button_text` / `home_secondary_button_url` |
| Titres des quatre cartes | `home_books_label`, `home_clothing_label`, `home_accessories_label`, `home_children_label` |
| Images des quatre cartes | `home_books_image`, `home_clothing_image`, `home_accessories_image`, `home_children_image` |

Les liens de boutons doivent être des chemins internes comme `/catalogue` ou `/coffrets`. Les images se choisissent dans la médiathèque WordPress.

## Champs Gift (même page de réglages)

Le composant **Gift** utilise également la page « Réglages accueil » et le groupe **Contenu HomeCategories**. Ses champs apparaissent sous les champs HomeCategories ; tu peux les modifier au même endroit :

| Champ affiché | Nom technique ACF |
| --- | --- |
| Gift — Accroche | `gift_eyebrow` |
| Gift — Titre | `gift_title` |
| Gift — Description | `gift_description` |
| Gift — Bouton coffrets | `gift_primary_button_text` |
| Gift — Bouton personnalisé / lien | `gift_secondary_button_text` / `gift_secondary_button_url` |
| Gift — Description image | `gift_image_alt` |
| Gift — Image | `gift_image` |

Le bouton principal garde son action React : afficher les coffrets dans le catalogue. Le champ ACF change son libellé, tandis que le bouton secondaire utilise le lien configuré.

## Champs StoreLocation (même page de réglages)

Le bloc **StoreLocation** est lui aussi modifiable depuis **Pages → Réglages accueil** :

| Champ affiché | Nom technique ACF |
| --- | --- |
| Boutique — Accroche et titre | `store_eyebrow`, `store_title` |
| Boutique — Adresse et accès / transport | `store_address`, `store_transport` |
| Boutique — Horaires et information retrait | `store_hours`, `store_pickup` |
| Boutique — Boutons Google Maps et retrait | `store_maps_button_text`, `store_pickup_button_text` |
| Boutique — Lien retrait | `store_pickup_button_url` |
| Boutique — Localisation de la carte | `store_map_query` |

Les champs sont remplis avec les valeurs actuelles pour commencer. Modifie-les dans WordPress puis enregistre la page ; l’adresse Google Maps et la carte intégrée suivront l’adresse et la localisation configurées.

## Champs CatalogueHero (page de réglages dédiée)

Pour garder les réglages plus ordonnés, les bannières du catalogue ont leur propre page WordPress : **Pages → Réglages catalogue** (slug : `reglages-catalogue`). Chaque rayon possède un libellé, un titre, une description et une image :

| Rayon | Champs ACF | Image ACF |
| --- | --- | --- |
| Livres & Coran | `catalogue_hero_livres_coran_label`, `catalogue_hero_livres_coran_title`, `catalogue_hero_livres_coran_description` | `catalogue_hero_livres_coran_image` |
| Vêtements | `catalogue_hero_vetements_label`, `catalogue_hero_vetements_title`, `catalogue_hero_vetements_description` | `catalogue_hero_vetements_image` |
| Accessoires | `catalogue_hero_accessoires_label`, `catalogue_hero_accessoires_title`, `catalogue_hero_accessoires_description` | `catalogue_hero_accessoires_image` |
| Coffrets cadeaux | `catalogue_hero_coffrets_cadeaux_label`, `catalogue_hero_coffrets_cadeaux_title`, `catalogue_hero_coffrets_cadeaux_description` | `catalogue_hero_coffrets_cadeaux_image` |

Les champs sont remplis avec les textes et images actuels du catalogue. Le rayon **Enfants** garde sa page dédiée et son propre hero ; les deux boutons du CatalogueHero conservent leurs actions React. Les champs CatalogueHero ne sont plus dans la page « Réglages accueil ».

## Champs KidsHero (page de réglages dédiée)

La bannière de la page Enfants se modifie séparément dans **Pages → Réglages enfants** (slug : `reglages-enfants`). Le groupe **Bannière KidsHero** contient :

| Champ affiché | Nom technique ACF |
| --- | --- |
| Titre — première ligne | `kids_hero_title_line_1` |
| Titre — deuxième ligne (mobile) | `kids_hero_title_line_2` |
| Image de la bannière | `kids_hero_image` |

Les champs ont été préremplis avec le titre et l’image actuels. L’illustration de nuages reste décorative et est toujours fournie par le front-end. L’endpoint dédié est `GET /wp-json/custom/v1/kids-hero-settings`.

## Vérifier l’API et le rendu

L’endpoint `GET /wp-json/custom/v1/home-categories-settings` renvoie les champs HomeCategories, `/wp-json/custom/v1/gift-settings` ceux de Gift, `/wp-json/custom/v1/store-location-settings` ceux de StoreLocation, `/wp-json/custom/v1/catalogue-hero-settings` ceux du CatalogueHero et `/wp-json/custom/v1/kids-hero-settings` ceux du KidsHero. Avec le serveur front local, ces endpoints sont accessibles sous `http://localhost:5173/woo-api/wp-json/custom/v1/`. La page d’accueil est `http://localhost:5173/ecom`, le catalogue `http://localhost:5173/ecom/catalogue` et la page enfants `http://localhost:5173/ecom/enfants`.

Le composant conserve ses visuels et textes de secours si l’API est temporairement indisponible. Une fois les champs remplis, les valeurs ACF remplacent les valeurs de secours partout où `HomeCategories` est rendu.
