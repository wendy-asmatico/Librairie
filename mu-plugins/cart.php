<?php

/*
 * Extensions Store API du panier headless (espace de noms `headless-cart`) :
 * - chaque article expose sa catégorie et son option « emballage cadeau » ;
 * - le panier expose le prix TTC de l'emballage, en unités mineures ;
 * - POST /wc/store/v1/cart/extensions { namespace, data: { key, gift_wrap } }
 *   active ou retire l'emballage d'un article ;
 * - les emballages sont facturés en frais de panier et notés sur la commande.
 */

use Automattic\WooCommerce\StoreApi\Exceptions\RouteException;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema;

const HEADLESS_CART_NAMESPACE      = 'headless-cart';
const HEADLESS_GIFT_WRAP_ITEM_KEY  = 'headless_gift_wrap';
const HEADLESS_GIFT_WRAP_PRICE_TTC = 3.90;

add_action('woocommerce_blocks_loaded', function () {
    if (!function_exists('woocommerce_store_api_register_endpoint_data')) {
        return;
    }

    woocommerce_store_api_register_endpoint_data([
        'endpoint'        => CartItemSchema::IDENTIFIER,
        'namespace'       => HEADLESS_CART_NAMESPACE,
        'data_callback'   => 'headless_cart_item_extension_data',
        'schema_callback' => 'headless_cart_item_extension_schema',
        'schema_type'     => ARRAY_A,
    ]);

    woocommerce_store_api_register_endpoint_data([
        'endpoint'        => CartSchema::IDENTIFIER,
        'namespace'       => HEADLESS_CART_NAMESPACE,
        'data_callback'   => 'headless_cart_extension_data',
        'schema_callback' => 'headless_cart_extension_schema',
        'schema_type'     => ARRAY_A,
    ]);

    woocommerce_store_api_register_update_callback([
        'namespace' => HEADLESS_CART_NAMESPACE,
        'callback'  => 'headless_cart_update_gift_wrap',
    ]);
});

add_action('woocommerce_cart_calculate_fees', 'headless_cart_add_gift_wrap_fee');
add_action('woocommerce_checkout_create_order_line_item', 'headless_cart_save_gift_wrap_on_order_item', 10, 3);

function headless_cart_item_extension_data($cart_item)
{
    return [
        'category'  => headless_cart_product_category_name($cart_item['product_id']),
        'gift_wrap' => !empty($cart_item[HEADLESS_GIFT_WRAP_ITEM_KEY]),
    ];
}

function headless_cart_item_extension_schema()
{
    return [
        'category'  => [
            'description' => 'Catégorie la plus précise du produit.',
            'type'        => ['string', 'null'],
            'context'     => ['view', 'edit'],
            'readonly'    => true,
        ],
        'gift_wrap' => [
            'description' => "L'article est-il emballé pour être offert ?",
            'type'        => 'boolean',
            'context'     => ['view', 'edit'],
            'readonly'    => true,
        ],
    ];
}

function headless_cart_extension_data()
{
    return [
        'gift_wrap_price' => (string) round(HEADLESS_GIFT_WRAP_PRICE_TTC * pow(10, wc_get_price_decimals())),
    ];
}

function headless_cart_extension_schema()
{
    return [
        'gift_wrap_price' => [
            'description' => "Prix TTC d'un emballage cadeau, en unités mineures.",
            'type'        => 'string',
            'context'     => ['view', 'edit'],
            'readonly'    => true,
        ],
    ];
}

// Les catégories enfants sont plus parlantes que leurs parents, et la catégorie
// par défaut (« Non classé ») n'apporte rien au client.
function headless_cart_product_category_name($product_id)
{
    $terms = get_the_terms($product_id, 'product_cat');
    if (empty($terms) || is_wp_error($terms)) {
        return null;
    }

    $default_category_id = (int) get_option('default_product_cat', 0);
    $terms = array_values(array_filter($terms, function ($term) use ($default_category_id) {
        return $term->term_id !== $default_category_id;
    }));
    if (empty($terms)) {
        return null;
    }

    foreach ($terms as $term) {
        if ($term->parent) {
            return $term->name;
        }
    }

    return $terms[0]->name;
}

function headless_cart_update_gift_wrap($data)
{
    $cart     = WC()->cart;
    $item_key = isset($data['key']) ? wc_clean(wp_unslash($data['key'])) : '';
    $contents = $cart->get_cart_contents();

    if (!$item_key || !isset($contents[$item_key])) {
        throw new RouteException('headless_cart_item_not_found', 'Cet article ne figure plus dans le panier.', 404);
    }

    $contents[$item_key][HEADLESS_GIFT_WRAP_ITEM_KEY] = !empty($data['gift_wrap']);
    $cart->set_cart_contents($contents);
}

// Les frais WooCommerce sont saisis hors taxes : on en retire la TVA pour que le
// client paie exactement le prix TTC affiché.
function headless_cart_gift_wrap_net_price()
{
    $price = HEADLESS_GIFT_WRAP_PRICE_TTC;
    if (wc_tax_enabled()) {
        $price -= array_sum(WC_Tax::calc_inclusive_tax($price, WC_Tax::get_rates()));
    }
    return $price;
}

function headless_cart_add_gift_wrap_fee($cart)
{
    $wrapped_items = 0;
    foreach ($cart->get_cart() as $cart_item) {
        if (!empty($cart_item[HEADLESS_GIFT_WRAP_ITEM_KEY])) {
            $wrapped_items++;
        }
    }

    if ($wrapped_items > 0) {
        $cart->add_fee('Emballages cadeau', headless_cart_gift_wrap_net_price() * $wrapped_items, true);
    }
}

function headless_cart_save_gift_wrap_on_order_item($order_item, $cart_item_key, $cart_item)
{
    if (!empty($cart_item[HEADLESS_GIFT_WRAP_ITEM_KEY])) {
        $order_item->add_meta_data('Emballage cadeau', 'Oui', true);
    }
}
