<?php

add_action('rest_api_init', function () {
    $permission = function () {
        return current_user_can('manage_woocommerce');
    };
    register_rest_route('custom/v1', '/admin/orders/(?P<order_id>\d+)/addresses', [
        'methods' => 'POST',
        'callback' => 'headless_admin_update_order_addresses',
        'permission_callback' => $permission,
    ]);
    register_rest_route('custom/v1', '/admin/products/(?P<product_id>\d+)/stock', [
        'methods' => 'POST',
        'callback' => 'headless_admin_update_product_stock',
        'permission_callback' => $permission,
    ]);
});

function headless_admin_update_order_addresses($request)
{
    $order = wc_get_order((int) $request['order_id']);
    if (!$order) {
        return new WP_Error('order_not_found', 'Commande introuvable.', ['status' => 404]);
    }

    $fields = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone'];
    $updates = [];
    foreach (['billing', 'shipping'] as $type) {
        $allowed = $type === 'billing' ? array_merge($fields, ['email']) : $fields;
        $current = $order->get_address($type);
        $expected = $request->get_param('expected_' . $type);
        $input = $request->get_param($type);
        if (!is_array($expected) || !is_array($input)) {
            return new WP_Error('invalid_address', 'Les coordonnées sont incomplètes.', ['status' => 400]);
        }
        foreach ($allowed as $key) {
            if (!array_key_exists($key, $input) || !is_string($input[$key]) || !array_key_exists($key, $expected) || !is_string($expected[$key])) {
                return new WP_Error('invalid_address', 'Les coordonnées sont invalides.', ['status' => 400]);
            }
            if (($current[$key] ?? '') !== $expected[$key]) {
                return new WP_Error('address_changed', 'Les coordonnées ont changé. Actualisez la fiche avant de réessayer.', ['status' => 409]);
            }
            $updates[$type][$key] = sanitize_text_field($input[$key]);
        }
        if ($updates[$type]['country'] !== '' && !array_key_exists($updates[$type]['country'], WC()->countries->get_countries())) {
            return new WP_Error('invalid_country', 'Le code pays doit être un code pays WooCommerce valide.', ['status' => 400]);
        }
    }
    if ($updates['billing']['email'] !== '' && !is_email($updates['billing']['email'])) {
        return new WP_Error('invalid_email', 'L’adresse e-mail est invalide.', ['status' => 400]);
    }
    try {
        $order->set_address($updates['billing'], 'billing');
        $order->set_address($updates['shipping'], 'shipping');
        $order->save();
    } catch (Exception $error) {
        return new WP_Error('address_save_failed', $error->getMessage(), ['status' => 500]);
    }
    return rest_ensure_response(['id' => $order->get_id()]);
}

function headless_admin_update_product_stock($request)
{
    $product = wc_get_product((int) $request['product_id']);
    if (!$product) {
        return new WP_Error('product_not_found', 'Produit introuvable.', ['status' => 404]);
    }
    if (!$product->managing_stock() || $product->get_stock_managed_by_id() !== $product->get_id()) {
        return new WP_Error('stock_not_managed', 'Le stock de ce produit ne peut pas être modifié ici.', ['status' => 400]);
    }
    $quantity = $request->get_param('quantity');
    $expected = $request->get_param('expected_quantity');
    if (!is_int($quantity) || $quantity < 0 || !is_int($expected)) {
        return new WP_Error('invalid_stock', 'Le stock doit être un nombre entier positif ou nul.', ['status' => 400]);
    }
    if ((int) $product->get_stock_quantity() !== $expected) {
        return new WP_Error('stock_changed', 'Le stock a changé. Actualisez la fiche avant de réessayer.', ['status' => 409]);
    }
    $result = wc_update_product_stock($product, $quantity, 'set');
    if ($result === null || $result === false) {
        return new WP_Error('stock_update_failed', 'Impossible d’enregistrer le stock.', ['status' => 500]);
    }
    return rest_ensure_response(['id' => $product->get_id(), 'stock_quantity' => $result]);
}
