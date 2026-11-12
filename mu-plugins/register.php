<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/register', [
        'methods'             => 'POST',
        'callback'            => 'headless_register_user',
        'permission_callback' => '__return_true',
    ]);
});

// Pas de limite sur un WordPress local (Docker, MAMP, XAMPP…) : pratique pour tester
function headless_register_is_local()
{
    $host = wp_parse_url(home_url(), PHP_URL_HOST);
    return in_array($host, ['localhost', '127.0.0.1', '::1'], true)
        || in_array(wp_get_environment_type(), ['local', 'development'], true);
}

function headless_register_rate_limit_check()
{
    if (headless_register_is_local()) {
        return true;
    }

    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'headless_register_' . md5($ip);

    $attempts = (int) get_transient($key);

    return $attempts < 5;
}

// Seuls les comptes réellement créés comptent : une erreur de saisie ne bloque pas
function headless_register_rate_limit_hit()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'headless_register_' . md5($ip);
    set_transient($key, (int) get_transient($key) + 1, HOUR_IN_SECONDS);
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
        return new WP_Error('too_many_requests', 'Trop de tentatives d’inscription depuis cette adresse. Réessayez dans une heure.', ['status' => 429]);
    }

    $json_params = $request->get_json_params();
    $json_params = is_array($json_params) ? $json_params : [];
    $email       = sanitize_email($json_params['email'] ?? $request->get_param('email'));
    $password    = (string) ($json_params['password'] ?? $request->get_param('password'));
    $username    = sanitize_user((string) ($json_params['username'] ?? $request->get_param('username')), true);

    if (empty($email)) {
        return new WP_Error('missing_email', 'L’adresse email est requise.', ['status' => 400]);
    }
    if (empty($password)) {
        return new WP_Error('missing_password', 'Le mot de passe est requis.', ['status' => 400]);
    }
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Adresse email invalide.', ['status' => 400]);
    }
    if (strlen($password) < 8) {
        return new WP_Error('weak_password', 'Le mot de passe doit contenir au moins 8 caracteres.', ['status' => 400]);
    }
    if ($username === '') {
        // Le formulaire ne demande pas d’identifiant : on le déduit de l’adresse email.
        $username = headless_register_username_from_email($email);
    }
    // Messages précis : la connexion indique déjà si un identifiant ou un email existe
    if (username_exists($username)) {
        return new WP_Error('username_exists', 'Ce nom d’utilisateur est déjà pris, choisissez-en un autre.', ['status' => 409]);
    }
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'Un compte existe déjà avec cette adresse email : connectez-vous.', ['status' => 409]);
    }

    add_filter('woocommerce_email_enabled_customer_new_account', '__return_false');

    if (function_exists('wc_create_new_customer')) {
        $user_id = wc_create_new_customer($email, $username, $password);
    } else {
        $user_id = wp_create_user($username, $password, $email);
    }

    remove_filter('woocommerce_email_enabled_customer_new_account', '__return_false');

    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
    }

    $role = get_role('customer') ? 'customer' : 'subscriber';
    $wp_user = new WP_User((int) $user_id);
    if (!$wp_user->exists()) {
        return new WP_Error('registration_failed', 'Compte créé mais introuvable.', ['status' => 500]);
    }
    if (!in_array($role, $wp_user->roles, true)) {
        $wp_user->set_role($role);
    }

    headless_register_rate_limit_hit();

    // Champs de la maquette Inscription (facultatifs)
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
    $newsletter_optin = filter_var($request->get_param('newsletter'), FILTER_VALIDATE_BOOLEAN);
    update_user_meta($user_id, 'newsletter_optin', $newsletter_optin ? 1 : 0);
    $newsletter_subscribed = null;
    if ($newsletter_optin) {
        $newsletter_result = headless_newsletter_subscribe($email, $first_name, $last_name);
        if (is_wp_error($newsletter_result)) {
            $error_data = $newsletter_result->get_error_data();
            $error_detail = isset($error_data['status']) ? 'HTTP ' . (int) $error_data['status'] : $newsletter_result->get_error_code();
            error_log(sprintf('[newsletter] Brevo subscription failed (%s).', $error_detail));
            $newsletter_subscribed = false;
        } else {
            $newsletter_subscribed = true;
        }
    }

    headless_register_send_welcome_email($user_id, $email, $username);

    $token_request = new WP_REST_Request('POST', '/jwt-auth/v1/token');
    $token_request->set_param('username', $username);
    $token_request->set_param('password', $password);
    $token_response = rest_do_request($token_request);

    if ($token_response->is_error()) {
        return new WP_Error('token_generation_failed', 'Compte cree, mais la connexion automatique a echoue.', ['status' => 500]);
    }

    $response_data = $token_response->get_data();
    $response_data['newsletter_subscribed'] = $newsletter_subscribed;
    return rest_ensure_response($response_data);
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

function headless_register_send_welcome_email($user_id, $email, $username)
{
    if (!function_exists('headless_front_url')) {
        return false;
    }

    $user = new WP_User($user_id);

    if (!$user->exists()) {
        return false;
    }

    $reset_key = get_password_reset_key($user);

    if (is_wp_error($reset_key)) {
        return false;
    }

    $reset_link = headless_front_url('/new-password') . '?login=' . rawurlencode($username) . '&key=' . rawurlencode($reset_key);

    $subject = 'Bienvenue sur notre boutique !';

    $message = "Bienvenue,\n\n";
    $message .= "Votre compte a ete cree avec succes.\n\n";
    $message .= "Pour definir votre mot de passe, cliquez sur le lien ci-dessous :\n";
    $message .= $reset_link . "\n\n";
    $message .= "Ce lien est valide pendant 24 heures.\n\n";
    $message .= "Cordialement,\nL'equipe";

    return wp_mail($email, $subject, $message);
}
