<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/orders', [
        'methods'             => 'GET',
        'callback'            => 'headless_get_current_user_orders',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    register_rest_route('custom/v1', '/orders/(?P<order_id>\d+)/pay', [
        'methods'             => 'POST',
        'callback'            => 'headless_pay_pending_order',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
        'args'                => [
            'order_id' => [
                'required'          => true,
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                },
            ],
        ],
    ]);

    register_rest_route('custom/v1', '/orders/(?P<order_id>\d+)/delivery', [
        'methods'             => 'POST',
        'callback'            => 'headless_set_order_delivery',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
});

function headless_get_current_user_orders($request)
{
    if (!function_exists('wc_get_orders')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }

    $orders = wc_get_orders([
        'customer_id' => get_current_user_id(),
        'limit'       => -1,
        'orderby'     => 'date',
        'order'       => 'DESC',
    ]);

    $data = array_map(function ($order) {
        return [
            'id'       => $order->get_id(),
            'number'   => $order->get_order_number(),
            'status'   => $order->get_status(),
            'date'     => $order->get_date_created() ? $order->get_date_created()->date('c') : null,
            'total'    => $order->get_total(),
            'currency' => $order->get_currency(),
            'delivery_mode' => headless_order_has_store_pickup($order) ? 'pickup' : 'delivery',
            'shipping_method' => $order->get_shipping_method(),
            'billing'  => [
                'first_name' => $order->get_billing_first_name(),
                'last_name'  => $order->get_billing_last_name(),
                'address_1'  => $order->get_billing_address_1(),
                'postcode'   => $order->get_billing_postcode(),
                'city'       => $order->get_billing_city(),
                'country'    => $order->get_billing_country(),
                'email'      => $order->get_billing_email(),
            ],
            'items'    => array_map(function ($item) {
                return [
                    'name'     => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total'    => $item->get_total(),
                ];
            }, array_values($order->get_items())),
        ];
    }, $orders);

    return rest_ensure_response($data);
}

function headless_order_has_store_pickup($order)
{
    if ($order->get_meta('_headless_store_pickup')) {
        return true;
    }
    foreach ($order->get_shipping_methods() as $item) {
        if (strpos($item->get_method_id(), 'local_pickup') !== false || strpos($item->get_method_id(), 'pickup_location') !== false) {
            return true;
        }
    }
    return false;
}

function headless_pay_pending_order($request)
{
    if (!function_exists('wc_get_order')) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis pour cette fonctionnalite.', ['status' => 500]);
    }

    $order_id = $request->get_param('order_id');
    $order = wc_get_order($order_id);
    $current_user_id = get_current_user_id();

    if (!$order) {
        return new WP_Error('order_not_found', 'Commande introuvable.', ['status' => 404]);
    }

    if ((int) $order->get_customer_id() !== $current_user_id) {
        return new WP_Error('forbidden', 'Vous n\'avez pas accès à cette commande.', ['status' => 403]);
    }

    // Une commande dont le paiement a échoué (« failed ») peut être repayée
    if (!$order->needs_payment()) {
        return new WP_Error(
            'order_not_payable',
            'Cette commande ne peut pas être payée. Statut actuel : ' . $order->get_status(),
            ['status' => 400]
        );
    }

    $json_params = $request->get_json_params();
    $json_params = is_array($json_params) ? $json_params : [];
    $payment_method_id = sanitize_text_field((string) ($json_params['payment_method_id'] ?? ''));

    if (empty($payment_method_id)) {
        return new WP_Error('missing_payment_method', 'L\'identifiant du moyen de paiement est requis.', ['status' => 400]);
    }

    if (!isset($json_params['expected_total']) || !is_numeric($json_params['expected_total'])
        || wc_format_decimal($json_params['expected_total'], wc_get_price_decimals()) !== wc_format_decimal($order->get_total(), wc_get_price_decimals())) {
        return new WP_Error('order_total_changed', 'Le montant de la commande a changé. Rechargez la page avant de payer.', ['status' => 409]);
    }
    $current_mode = headless_order_has_store_pickup($order) ? 'pickup' : 'delivery';
    if (($json_params['delivery_mode'] ?? '') !== $current_mode) {
        return new WP_Error('delivery_mode_changed', 'Le mode de réception a changé. Rechargez la page avant de payer.', ['status' => 409]);
    }

    $address = headless_sanitize_order_address($json_params['address'] ?? []);
    if (is_wp_error($address)) {
        return $address;
    }
    if (!$order->get_meta('_headless_delivery_confirmed')) {
        return new WP_Error('delivery_not_confirmed', 'Veuillez choisir et confirmer le mode de réception.', ['status' => 409]);
    }
    if ($current_mode === 'delivery') {
        $destination = $order->get_meta('_headless_delivery_destination');
        if (!is_array($destination) || $destination['country'] !== $address['country']
            || $destination['postcode'] !== $address['postcode']) {
            return new WP_Error('delivery_address_changed', 'Veuillez recalculer la livraison pour cette adresse.', ['status' => 409]);
        }
    }

    $order->set_address($address, 'billing');
    if (headless_order_has_store_pickup($order)) {
        $order->set_address([
            'first_name' => $address['first_name'],
            'last_name'  => $address['last_name'],
            'address_1'  => '14 Boulevard de la Sagesse',
            'address_2'  => '',
            'postcode'   => '13002',
            'city'       => 'Marseille',
            'state'      => '',
            'country'    => 'FR',
        ], 'shipping');
    } else {
        $order->set_address(array_diff_key($address, ['email' => 1]), 'shipping');
    }
    $order->save();

    try {
        $result = headless_process_pending_order_payment($order, $payment_method_id);

        if (is_wp_error($result)) {
            return $result;
        }

        $order = wc_get_order($order->get_id());

        return rest_ensure_response([
            'success'         => true,
            'order_id'        => $order->get_id(),
            'status'          => $order->get_status(),
            'requires_action' => $result['requires_action'],
            'payment_action'  => $result['payment_action'],
        ]);
    } catch (Exception $e) {
        return new WP_Error('payment_error', $e->getMessage(), ['status' => 500]);
    }
}

function headless_set_order_delivery($request)
{
    $order = wc_get_order((int) $request->get_param('order_id'));
    if (!$order) {
        return new WP_Error('order_not_found', 'Commande introuvable.', ['status' => 404]);
    }
    if ((int) $order->get_customer_id() !== get_current_user_id()) {
        return new WP_Error('forbidden', 'Vous n\'avez pas accès à cette commande.', ['status' => 403]);
    }
    if (!$order->needs_payment()) {
        return new WP_Error('order_not_payable', 'Cette commande ne peut pas être modifiée.', ['status' => 400]);
    }

    $mode = $request->get_param('mode');
    if (!in_array($mode, ['pickup', 'delivery'], true)) {
        return new WP_Error('invalid_delivery_mode', 'Mode de réception invalide.', ['status' => 400]);
    }
    $item = new WC_Order_Item_Shipping();
    if ($mode === 'pickup') {
        $item->set_method_title('Retrait gratuit en boutique');
        $item->set_method_id('local_pickup');
        $item->set_total(0);
        $item->add_meta_data('Adresse de retrait', HEADLESS_PICKUP_ADDRESS, true);
        $order->update_meta_data('_headless_store_pickup', 'yes');
        $order->delete_meta_data('_headless_delivery_destination');
    } else {
        if ($order->get_currency() !== 'EUR') {
            return new WP_Error('delivery_currency_unavailable', 'Le tarif de livraison est disponible uniquement en euros.', ['status' => 503]);
        }
        $destination = [
            'country' => strtoupper(sanitize_text_field((string) $request->get_param('country'))),
            'postcode' => sanitize_text_field((string) $request->get_param('postcode')),
        ];
        $weight = 0;
        $missing_weight = false;
        $quote = false;
        foreach ($order->get_items() as $line) {
            $product = $line->get_product();
            if (!$product) {
                $quote = true;
                continue;
            }
            if (!$product->needs_shipping()) {
                continue;
            }
            $product_weight = $product->get_weight();
            if ($product_weight === '' || !is_numeric($product_weight) || (float) $product_weight <= 0) {
                $missing_weight = true;
            } else {
                $weight += wc_get_weight((float) $product_weight, 'kg') * $line->get_quantity();
            }
        }
        $rate = headless_delivery_rate($destination, $weight, $missing_weight, $quote);
        if (is_wp_error($rate)) {
            return $rate;
        }
        $item->set_method_title($rate->get_label());
        $item->set_method_id($rate->get_method_id());
        $item->set_total($rate->get_cost());
        $item->set_taxes(['total' => $rate->get_taxes()]);
        $order->delete_meta_data('_headless_store_pickup');
        $order->update_meta_data('_headless_delivery_destination', $destination);
    }
    foreach ($order->get_shipping_methods() as $existing) {
        $order->remove_item($existing->get_id());
    }
    $order->add_item($item);
    $order->update_meta_data('_headless_delivery_confirmed', 'yes');
    $order->delete_meta_data('_headless_previous_shipping');
    $order->update_taxes();
    $order->calculate_totals(false);

    return rest_ensure_response([
        'mode'     => $mode,
        'total'    => $order->get_total(),
        'currency' => $order->get_currency(),
    ]);
}

function headless_sanitize_order_address($raw)
{
    $raw = is_array($raw) ? $raw : [];
    $address = [];
    foreach (['first_name', 'last_name', 'address_1', 'postcode', 'city', 'country'] as $field) {
        $address[$field] = sanitize_text_field((string) ($raw[$field] ?? ''));
        if ($address[$field] === '') {
            return new WP_Error('missing_address', 'Veuillez renseigner votre adresse complète.', ['status' => 400]);
        }
    }
    $address['country'] = strtoupper($address['country']);
    $address['email']   = sanitize_email((string) ($raw['email'] ?? ''));
    if (!is_email($address['email'])) {
        return new WP_Error('invalid_email', 'Adresse email invalide.', ['status' => 400]);
    }

    return $address;
}

function headless_process_pending_order_payment($order, $payment_method_id)
{
    if (!function_exists('WC') || !WC()->payment_gateways) {
        return new WP_Error('woocommerce_unavailable', 'WooCommerce est requis.', ['status' => 500]);
    }

    $gateways       = WC()->payment_gateways->payment_gateways();
    $stripe_gateway = $gateways['stripe'] ?? null;

    if (!$stripe_gateway || !$stripe_gateway->is_available()) {
        return new WP_Error('stripe_unavailable', 'Stripe n\'est pas disponible.', ['status' => 503]);
    }

    // Le plugin Stripe lit le moyen de paiement dans $_POST, comme au checkout
    $_POST['payment_method']            = 'stripe';
    $_POST['wc-stripe-payment-method']  = $payment_method_id;
    $_POST['stripe_source']             = $payment_method_id;

    $order->set_payment_method('stripe');
    $order->set_payment_method_title($stripe_gateway->get_title());
    $order->save();

    // Pas de session WooCommerce en REST : nécessaire aux notices du plugin Stripe
    if (function_exists('wc_load_cart') && (!WC()->session || !WC()->cart)) {
        wc_load_cart();
    }

    wc_clear_notices();

    try {
        $result = $stripe_gateway->process_payment($order->get_id());
    } catch (Exception $e) {
        return new WP_Error('payment_failed', $e->getMessage(), ['status' => 400]);
    }

    if (is_array($result) && ($result['result'] ?? '') === 'success') {
        $order = wc_get_order($order->get_id());
        $redirect = $result['redirect'] ?? '';

        if ($order && in_array($order->get_status(), ['processing', 'shipped', 'completed', 'on-hold'], true)) {
            return [
                'requires_action' => false,
                'payment_action'  => null,
            ];
        }

        if ($order && is_string($redirect) && preg_match('/^#wc-stripe-confirm-pi:(\d+):([^:]+):([^:]+)$/', $redirect, $matches)
            && (int) $matches[1] === $order->get_id()) {
            return [
                'requires_action' => true,
                'payment_action'  => [
                    'client_secret' => $matches[2],
                    'nonce'         => $matches[3],
                ],
            ];
        }

        return new WP_Error(
            'payment_unconfirmed',
            'Le paiement nécessite une vérification supplémentaire ou est encore en cours. Consultez vos commandes avant de réessayer.',
            ['status' => 409]
        );
    }

    $messages = array_map(function ($notice) {
        return wp_strip_all_tags(is_array($notice) ? $notice['notice'] : $notice);
    }, wc_get_notices('error'));
    wc_clear_notices();

    return new WP_Error(
        'payment_declined',
        $messages ? implode(' ', $messages) : 'Le paiement a été refusé. Vérifiez votre carte ou essayez-en une autre.',
        ['status' => 400]
    );
}
