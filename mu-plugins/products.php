<?php
/**
 * Plugin Name: Headless WooCommerce REST API Extensions
 * Description: Ajoute les routes REST API personnalisées pour récupérer les produits avec le stock des variations, la catégorie fonctionnelle et les spécifications techniques.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('rest_api_init', function () {
    // Route pour récupérer la liste des produits
    register_rest_route('custom/v1', '/products', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_products_with_variation_stock',
        'permission_callback' => '__return_true',
    ]);

    // Route pour récupérer un seul produit par son ID ou son Slug
    register_rest_route('custom/v1', '/products/(?P<id>[\w-]+)', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_single_product_with_variation_stock',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Enrichit les données d'un produit avec :
 * 1. Le statut de stock exact de chaque variation
 * 2. Les catégories complètes pour le fil d'Ariane fonctionnel
 * 3. La liste des spécifications (attributs WooCommerce personnalisés ou globaux)
 */
function headless_enrich_product_data($product_data)
{
    // Récupération de l'ID du produit WooCommerce
    $product_id = is_object($product_data) ? ($product_data->id ?? null) : ($product_data['id'] ?? null);
    $wc_product = $product_id ? wc_get_product($product_id) : null;

    // 1. Enrichissement du stock pour les déclinaisons (variations)
    $variations = is_object($product_data) ? ($product_data->variations ?? null) : ($product_data['variations'] ?? null);

    if (!empty($variations) && is_array($variations)) {
        $enriched_variations = array_map(function ($variation) {
            $variation_id      = is_object($variation) ? ($variation->id ?? null) : ($variation['id'] ?? null);
            $variation_product = $variation_id ? wc_get_product($variation_id) : null;

            $is_in_stock  = $variation_product ? $variation_product->is_in_stock() : null;
            $stock_status = $variation_product ? $variation_product->get_stock_status() : null;

            if (is_object($variation)) {
                $variation->is_in_stock  =$is_in_stock;
                $variation->stock_status =$stock_status;
            } else {
                $variation['is_in_stock']  =$is_in_stock;
                $variation['stock_status'] =$stock_status;
            }

            return $variation;
        }, $variations);

        if (is_object($product_data)) {
            $product_data->variations =$enriched_variations;
        } else {
            $product_data['variations'] =$enriched_variations;
        }
    }

    // 2. Extraction des catégories & spécifications WooCommerce
    if ($wc_product) {
        // Catégories du produit pour fil d'Ariane dynamique
        $terms = wp_get_post_terms($product_id, 'product_cat');$categories = [];

        if (!is_wp_error($terms) && !empty($terms)) {
            foreach ($terms as $term) {$categories[] = [
                    'id'   => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                ];
            }
        }

        $category_names = array_column($categories, 'name');$category_name  = !empty($category_names) ? implode(' / ', $category_names) : 'Catalogue';

        // Attributs du produit (Pagination, Dimensions, Papier, Reliure, Langues...)
        $specifications = [];
        $wc_attributes  =$wc_product->get_attributes();

        foreach ($wc_attributes as$attribute) {
            if ($attribute->is_taxonomy()) {$term_names = wc_get_product_terms($product_id,$attribute->get_name(), ['fields' => 'names']);
                if (!is_wp_error($term_names) && !empty($term_names)) {$specifications[] = [
                        'name'  => wc_attribute_label($attribute->get_name()),
                        'value' => implode(', ', $term_names)
                    ];
                }
            } else {
                $options =$attribute->get_options();
                if (!empty($options)) {$specifications[] = [
                        'name'  => $attribute->get_name(),
                        'value' => implode(', ', $options)
                    ];
                }
            }
        }

        // Injection dans l'objet réponse
        if (is_object($product_data)) {
            $product_data->categories    =$categories;
            $product_data->category_name =$category_name;
            $product_data->specifications =$specifications;
        } else {
            $product_data['categories']    =$categories;
            $product_data['category_name'] =$category_name;
            $product_data['specifications'] =$specifications;
        }
    }

    return $product_data;
}

/**
 * Callback GET /custom/v1/products
 */
function headless_get_products_with_variation_stock($request)
{
    if (!function_exists('wc_get_product')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }

    $store_request = new WP_REST_Request('GET', '/wc/store/v1/products');
    $store_request->set_query_params($request->get_query_params());

    $store_response = rest_do_request($store_request);

    if ($store_response->is_error()) {
        $error =$store_response->as_error();
        return $error instanceof WP_Error
            ? $error
            : new WP_Error('products_fetch_failed', 'Impossible de recuperer les produits.', ['status' => 500]);
    }

    $products = array_map('headless_enrich_product_data',$store_response->get_data());

    $response = rest_ensure_response($products);
    $store_headers =$store_response->get_headers();

    foreach (['X-WP-Total', 'X-WP-TotalPages'] as $header) {
        if (isset($store_headers[$header])) {
            $response->header($header, $store_headers[$header]);
        }
    }

    return $response;
}

/**
 * Résout le slug ou l'ID numérique en ID produit WooCommerce
 */
function headless_resolve_product_id($raw_id)
{
    if (is_numeric($raw_id)) {
        return (int) $raw_id;
    }

    $query = new WP_Query([
        'name'           => sanitize_title($raw_id),
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ]);

    return $query->have_posts() ? (int)$query->posts[0] : 0;
}

/**
 * Callback GET /custom/v1/products/{id_or_slug}
 */
function headless_get_single_product_with_variation_stock($request)
{
    if (!function_exists('wc_get_product')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }

    $product_id = headless_resolve_product_id($request->get_param('id'));

    if (!$product_id) {
        return new WP_Error('product_not_found', 'Produit introuvable.', ['status' => 404]);
    }

    $store_request  = new WP_REST_Request('GET', '/wc/store/v1/products/' .$product_id);
    $store_response = rest_do_request($store_request);

    if ($store_response->is_error()) {
        $error =$store_response->as_error();
        return $error instanceof WP_Error
            ? $error
            : new WP_Error('product_fetch_failed', 'Impossible de recuperer le produit.', ['status' => 500]);
    }

    return rest_ensure_response(headless_enrich_product_data($store_response->get_data()));
}