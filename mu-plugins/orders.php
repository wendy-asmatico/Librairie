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

    $address = headless_sanitize_order_address($json_params['address'] ?? []);
    if (is_wp_error($address)) {
        return $address;
    }

    // Même adresse pour la facturation et la livraison, comme le formulaire de paiement
    $order->set_address($address, 'billing');
    $order->set_address(array_diff_key($address, ['email' => 1]), 'shipping');
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

        if ($order && in_array($order->get_status(), ['processing', 'completed', 'on-hold'], true)) {
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
