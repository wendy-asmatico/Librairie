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

    $username = sanitize_user($request->get_param('username'));
    $email    = sanitize_email($request->get_param('email'));
    $password = (string) $request->get_param('password');

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

    $token_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $token_request->set_param('username', $username);
    $token_request->set_param('password', $password);
    $token_response = rest_do_request($token_request);

    if ($token_response->is_error()) {
        return new WP_Error('token_generation_failed', 'Compte cree, mais la connexion automatique a echoue.', ['status' => 500]);
    }

    return rest_ensure_response($token_response->get_data());
}
