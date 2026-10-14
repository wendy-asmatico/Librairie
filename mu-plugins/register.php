<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/register', [
        'methods'             => 'POST',
        'callback'            => 'headless_register_user',
        'permission_callback' => '__return_true',
    ]);
});

function headless_register_rate_limit_check()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'headless_register_' . md5($ip);

    $attempts = (int) get_transient($key);

    if ($attempts >= 5) {
        return false;
    }

    set_transient($key, $attempts + 1, HOUR_IN_SECONDS);
    return true;
}

function headless_register_user($request)
{
    $routes = rest_get_server()->get_routes();
    if (!isset($routes['/jwt-auth/v1/token'])) {
        return new WP_Error(
            'jwt_auth_unavailable',
            'Le service d’authentification JWT n’est pas installé ou activé.',
            ['status' => 503]
        );
    }

    if (!headless_register_rate_limit_check()) {
        return new WP_Error('too_many_requests', 'Trion depuis cette adresse. Reessayez plus tard.', ['status' => 429]);
    }

    $email    = sanitize_email($request->get_param('email'));
    $password = (string) $request->get_param('password');
    $username = sanitize_user((string) $request->get_param('username'), true);
    if ($username === '' && is_email($email)) {
        // Page Inscription : pas d'identifiant demandé, on le déduit de l'email
        $username = headless_register_username_from_email($email);
    }

    if (empty($username) || empty($email) || empty($password)) {
        return new WP_Error('missing_fields', 'Identifiant, email et mot de passe sont requis.', ['status' => 400]);
    }
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Adresse email invalide.', ['status' => 400]);
    }
    if (strlen($password) < 8) {
        return new WP_Error('weak_password', 'Le mot de passe doit contenir au moins 8 caracteres.', ['status' => 400]);
    }
    if (username_exists($username) || email_exists($email)) {
        return new WP_Error('registration_unavailable', 'Impossible de creer ce compte avec ces informations.', ['status' => 409]);
    }

    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
    }

    // Champs de la page Inscription (facultatifs pour l'ancien formulaire)
    $first_name = sanitize_text_field((string) $request->get_param('first_name'));
    $last_name  = sanitize_text_field((string) $request->get_param('last_name'));
    if ($first_name !== '' || $last_name !== '') {
        wp_update_user([
            'ID'           => $user_id,
            'first_name'   => $first_name,
            'last_name'    => $last_name,
            'display_name' => trim($first_name . ' ' . $last_name) ?: $username,
        ]);
        update_user_meta($user_id, 'billing_first_name', $first_name);
        update_user_meta($user_id, 'billing_last_name', $last_name);
    }
    update_user_meta($user_id, 'billing_email', $email);

    $civility = $request->get_param('civility');
    if (in_array($civility, ['madame', 'monsieur'], true)) {
        update_user_meta($user_id, 'civility', $civility);
    }
    update_user_meta($user_id, 'newsletter_optin', filter_var($request->get_param('newsletter'), FILTER_VALIDATE_BOOLEAN) ? 1 : 0);

    $token_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $token_request->set_param('username', $username);
    $token_request->set_param('password', $password);
    $token_response = rest_do_request($token_request);

    if ($token_response->is_error()) {
        return new WP_Error('token_generation_failed', 'Compte cree, mais la connexion automatique a echoue.', ['status' => 500]);
    }

    return rest_ensure_response($token_response->get_data());
}

function headless_register_username_from_email($email)
{
    $base = sanitize_user(strstr($email, '@', true), true) ?: 'client';
    $username = $base;
    $suffix = 2;
    while (username_exists($username)) {
        $username = $base . $suffix++;
    }
    return $username;
}
