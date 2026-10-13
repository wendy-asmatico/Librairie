#!/usr/bin/env bash
# Installe et configure le WordPress local (à lancer une fois après `docker compose up -d`)
set -euo pipefail
cd "$(dirname "$0")"

wp() { docker compose --progress quiet run --rm cli wp "$@"; }

echo "→ Attente de la base de données…"
until wp db check >/dev/null 2>&1; do sleep 2; done

if ! wp core is-installed >/dev/null 2>&1; then
  wp core install --url="http://localhost:8080" --title="Maktaba El Hikma" \
    --admin_user=admin --admin_password=admin --admin_email=admin@maktaba.local --skip-email
fi

wp language core install fr_FR --activate || true
wp option update timezone_string "Europe/Paris"
wp option update blogdescription "Librairie & boutique islamique"
wp rewrite structure '/%postname%/' --hard
wp rewrite flush --hard

echo "→ Extensions (cf. README)"
wp plugin install woocommerce woocommerce-gateway-stripe woocommerce-services jwt-authentication-for-wp-rest-api --activate
wp plugin delete hello akismet || true
wp language plugin install woocommerce fr_FR || true

echo "→ Réglages WooCommerce"
wp option update woocommerce_default_country "FR"
wp option update woocommerce_currency "EUR"
wp option update woocommerce_price_thousand_sep " "
wp option update woocommerce_price_decimal_sep ","
wp option update woocommerce_currency_pos "right_space"
wp option update woocommerce_onboarding_profile '{"skipped":true}' --format=json
wp option update woocommerce_coming_soon "no"

echo "→ Catégories"
cat_id() { wp term list product_cat --slug="$1" --field=term_id --format=ids 2>/dev/null; }
create_cat() { # nom slug [parent_slug]
  if [ -z "$(cat_id "$2")" ]; then
    if [ -n "${3:-}" ]; then
      wp term create product_cat "$1" --slug="$2" --parent="$(cat_id "$3")" --porcelain >/dev/null
    else
      wp term create product_cat "$1" --slug="$2" --porcelain >/dev/null
    fi
  fi
  echo "   $2"
}
create_cat "Livres & Coran" livres-coran
create_cat "Corans" corans livres-coran
create_cat "Tafsir" tafsir livres-coran
create_cat "Hadiths & Fiqh" hadiths-fiqh livres-coran
create_cat "Invocations & Douas" invocations-douas livres-coran
create_cat "Sîra & Histoire" sira-histoire livres-coran
create_cat "Vêtements" vetements
create_cat "Homme" vetements-homme vetements
create_cat "Femme" vetements-femme vetements
create_cat "Accessoires" accessoires
create_cat "Tapis de prière" tapis-de-priere accessoires
create_cat "Parfums & Encens" parfums-encens accessoires
create_cat "Tasbih" tasbih accessoires
create_cat "Enfants" enfants
create_cat "Coffrets Cadeaux" coffrets-cadeaux

echo "✓ WordPress prêt : http://localhost:8080/wp-admin (admin / admin)"
