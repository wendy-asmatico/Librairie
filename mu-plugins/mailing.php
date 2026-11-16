<?php
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/newsletter', [
        'methods'             => 'POST',
        'callback'            => 'headless_newsletter_rest_subscribe',
        'permission_callback' => '__return_true',
    ]);
});

function headless_newsletter_rest_subscribe($request)
{
    $email = sanitize_email((string) $request->get_param('email'));
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Veuillez saisir une adresse e-mail valide.', ['status' => 400]);
    }

    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown';
    $rate_limit_key = 'headless_newsletter_' . md5($ip);
    $attempts = (int) get_transient($rate_limit_key);
    if ($attempts >= 5) {
        return new WP_Error('newsletter_rate_limited', 'Trop de tentatives. Réessayez dans une heure.', ['status' => 429]);
    }
    set_transient($rate_limit_key, $attempts + 1, HOUR_IN_SECONDS);

    $result = headless_newsletter_subscribe($email);
    if (is_wp_error($result)) {
        $error_data = $result->get_error_data();
        $provider_status = isset($error_data['status']) ? (int) $error_data['status'] : 0;
        error_log(sprintf(
            '[newsletter] Subscription failed (%s).',
            $provider_status ? 'HTTP ' . $provider_status : $result->get_error_code()
        ));
        return new WP_Error('newsletter_subscription_failed', 'Impossible de vous inscrire pour le moment. Réessayez plus tard.', ['status' => 503]);
    }

    return rest_ensure_response(['subscribed' => true]);
}

function headless_newsletter_subscribe($email, $first_name = '', $last_name = '')
{
    $api_key = defined('BREVO_API_KEY') ? trim((string) BREVO_API_KEY) : '';
    $list_id = defined('BREVO_NEWSLETTER_LIST_ID') ? absint(BREVO_NEWSLETTER_LIST_ID) : 0;

    if ($api_key === '' || $list_id === 0) {
        return new WP_Error('newsletter_not_configured', 'La newsletter n’est pas encore configurée.');
    }

    $attributes = [];
    if ($first_name !== '') {
        $attributes['FIRSTNAME'] = $first_name;
    }
    if ($last_name !== '') {
        $attributes['LASTNAME'] = $last_name;
    }

    $payload = [
        'email'         => sanitize_email($email),
        'listIds'       => [$list_id],
        'updateEnabled' => true,
    ];
    if ($attributes) {
        $payload['attributes'] = $attributes;
    }

    $response = wp_remote_post('https://api.brevo.com/v3/contacts', [
        'timeout' => 10,
        'headers' => [
            'accept'       => 'application/json',
            'api-key'      => $api_key,
            'content-type' => 'application/json',
        ],
        'body' => wp_json_encode($payload),
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('newsletter_connection_failed', 'Impossible de joindre Brevo.');
    }

    $status = wp_remote_retrieve_response_code($response);
    if ($status < 200 || $status >= 300) {
        return new WP_Error('newsletter_provider_rejected', 'Brevo a refusé l’inscription.', ['status' => $status]);
    }

    return true;
}

add_filter('rest_index', function ($response) {
    $data = $response->get_data();
    $data['store_email'] = get_option('woocommerce_email_from_address');
    $data['store_name']  = get_option('woocommerce_email_from_name');
    $response->set_data($data);
    return $response;
});

add_filter('wp_mail_from', function ($original_email) {
    $wc_email = get_option('woocommerce_email_from_address');
    return !empty($wc_email) ? $wc_email : $original_email;
});

add_filter('wp_mail_from_name', function ($original_name) {
    $wc_name = get_option('woocommerce_email_from_name');

    return !empty($wc_name) ? $wc_name : get_bloginfo('name');
});
