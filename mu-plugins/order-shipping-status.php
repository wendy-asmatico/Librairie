<?php

add_action('init', function () {
    register_post_status('wc-shipped', [
        'label'                     => 'Expédiée',
        'public'                    => true,
        'exclude_from_search'       => false,
        'show_in_admin_all_list'    => true,
        'show_in_admin_status_list' => true,
        'label_count'               => _n_noop('Expédiée <span class="count">(%s)</span>', 'Expédiées <span class="count">(%s)</span>'),
    ]);
});

add_filter('wc_order_statuses', function ($statuses) {
    $result = [];
    foreach ($statuses as $key => $label) {
        $result[$key] = $label;
        if ($key === 'wc-processing') {
            $result['wc-shipped'] = 'Expédiée';
        }
    }
    return $result;
});

add_filter('woocommerce_order_is_paid_statuses', function ($statuses) {
    $statuses[] = 'shipped';
    return array_unique($statuses);
});

add_filter('woocommerce_reports_order_statuses', function ($statuses) {
    $statuses[] = 'shipped';
    return array_unique($statuses);
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/admin/orders/(?P<order_id>\d+)/status', [
        'methods'             => 'POST',
        'callback'            => 'headless_update_fulfilment_status',
        'permission_callback' => function () {
            return current_user_can('manage_woocommerce');
        },
    ]);
});

function headless_update_fulfilment_status($request)
{
    $order = wc_get_order((int) $request->get_param('order_id'));
    if (!$order) {
        return new WP_Error('order_not_found', 'Commande introuvable.', ['status' => 404]);
    }

    $current = $order->get_status();
    if ($current !== $request->get_param('expected_status')) {
        return new WP_Error('order_status_changed', 'Le statut a changé. Actualisez les commandes avant de réessayer.', ['status' => 409]);
    }

    $pickup = headless_order_has_store_pickup($order);
    $target = $request->get_param('status');
    $allowed = $current === 'processing' ? ($pickup ? ['completed'] : ['shipped']) : ($current === 'shipped' ? ['completed'] : []);
    if (!in_array($target, $allowed, true)) {
        return new WP_Error('invalid_status_transition', 'Ce changement de statut n’est pas autorisé.', ['status' => 400]);
    }

    if (!$order->update_status($target, '', true)) {
        return new WP_Error('order_update_failed', 'Impossible d’enregistrer le statut de la commande.', ['status' => 500]);
    }
    return rest_ensure_response(['id' => $order->get_id(), 'status' => $order->get_status()]);
}
