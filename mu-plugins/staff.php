<?php

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/admin/staff', [
        [
            'methods'             => 'GET',
            'callback'            => 'headless_list_staff',
            'permission_callback' => 'headless_staff_can_access',
        ],
        [
            'methods'             => 'POST',
            'callback'            => 'headless_create_staff_user',
            'permission_callback' => 'headless_staff_can_access',
        ],
    ]);
    register_rest_route('custom/v1', '/admin/staff/(?P<user_id>\d+)/remove', [
        'methods'             => 'POST',
        'callback'            => 'headless_remove_staff_user',
        'permission_callback' => function () {
            $user = wp_get_current_user();
            return is_user_logged_in()
                && in_array('administrator', $user->roles, true)
                && current_user_can('delete_users');
        },
    ]);
});

function headless_staff_can_access()
{
    $user = wp_get_current_user();
    return is_user_logged_in()
        && (in_array('administrator', $user->roles, true) || in_array('shop_manager', $user->roles, true))
        && current_user_can('manage_woocommerce');
}

function headless_list_staff($request)
{
    $page = max(1, (int) $request->get_param('page'));
    $per_page = 20;
    $query = new WP_User_Query([
        'role__in' => ['administrator', 'shop_manager'],
        'number'   => $per_page,
        'offset'   => ($page - 1) * $per_page,
        'orderby'  => 'display_name',
        'order'    => 'ASC',
        'count_total' => true,
    ]);
    $items = array_map(function ($user) {
        return [
            'id'         => $user->ID,
            'name'       => $user->display_name,
            'email'      => $user->user_email,
            'roles'      => array_values(array_intersect($user->roles, ['administrator', 'shop_manager'])),
        ];
    }, $query->get_results());

    return rest_ensure_response([
        'items'       => $items,
        'total'       => (int) $query->get_total(),
        'total_pages' => (int) ceil($query->get_total() / $per_page),
    ]);
}

function headless_remove_staff_user($request)
{
    if (is_multisite()) {
        return new WP_Error('multisite_unsupported', 'Cette action doit être effectuée dans l’administration du réseau WordPress.', ['status' => 409]);
    }

    $user_id = (int) $request->get_param('user_id');
    $action = (string) $request->get_param('action');
    if (!in_array($action, ['revoke', 'delete'], true)) {
        return new WP_Error('invalid_action', 'Action invalide.', ['status' => 400]);
    }
    if ($user_id === get_current_user_id()) {
        return new WP_Error('self_removal_forbidden', 'Vous ne pouvez pas retirer votre propre accès depuis cette page.', ['status' => 403]);
    }
    $user = get_userdata($user_id);
    if (!$user || !array_intersect($user->roles, ['administrator', 'shop_manager'])) {
        return new WP_Error('staff_not_found', 'Ce membre de l’équipe est introuvable ou ne possède plus ces droits.', ['status' => 404]);
    }

    if ($action === 'revoke') {
        if (!get_role('customer')) {
            return new WP_Error('customer_role_unavailable', 'Le rôle client WooCommerce est indisponible.', ['status' => 503]);
        }
        $user->set_role('customer');
        foreach (array_keys($user->caps) as $capability) {
            if (!wp_roles()->is_role($capability)) {
                $user->remove_cap($capability);
            }
        }
        WP_Session_Tokens::get_instance($user_id)->destroy_all();
    } else {
        require_once ABSPATH . 'wp-admin/includes/user.php';
        if (!wp_delete_user($user_id, get_current_user_id())) {
            return new WP_Error('staff_delete_failed', 'Impossible de supprimer ce compte.', ['status' => 500]);
        }
    }

    error_log(sprintf('[staff] Action %s sur utilisateur %d par utilisateur %d.', $action, $user_id, get_current_user_id()));
    return rest_ensure_response(['success' => true]);
}

function headless_create_staff_user($request)
{
    $email = trim((string) $request->get_param('email'));
    $first_name = sanitize_text_field((string) $request->get_param('first_name'));
    $last_name = sanitize_text_field((string) $request->get_param('last_name'));
    $role = (string) $request->get_param('role');

    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Adresse e-mail invalide.', ['status' => 400]);
    }
    if ($first_name === '' || $last_name === '') {
        return new WP_Error('missing_name', 'Le prénom et le nom sont obligatoires.', ['status' => 400]);
    }
    if (!in_array($role, ['administrator', 'shop_manager'], true) || !get_role($role)) {
        return new WP_Error('invalid_role', 'Le rôle demandé est indisponible.', ['status' => 400]);
    }
    if (email_exists($email)) {
        return new WP_Error('email_exists', 'Un compte existe déjà avec cette adresse e-mail.', ['status' => 409]);
    }

    $user_id = wp_insert_user([
        'user_login'   => $email,
        'user_email'   => $email,
        'user_pass'    => wp_generate_password(32, true, true),
        'first_name'   => $first_name,
        'last_name'    => $last_name,
        'display_name' => trim($first_name . ' ' . $last_name),
        'role'         => $role,
    ]);
    if (is_wp_error($user_id)) {
        return new WP_Error('staff_creation_failed', $user_id->get_error_message(), ['status' => 400]);
    }

    $user = get_userdata($user_id);
    $key = $user ? get_password_reset_key($user) : new WP_Error('staff_user_missing', 'Compte introuvable.');
    $mail_sent = false;
    if (!is_wp_error($key)) {
        $url = network_site_url('wp-login.php?action=rp&key=' . rawurlencode($key) . '&login=' . rawurlencode($user->user_login), 'login');
        $mail_sent = wp_mail(
            $email,
            'Votre accès à la boutique',
            "Bonjour,\n\nUn compte a été créé pour vous. Pour définir votre mot de passe, ouvrez ce lien :\n\n{$url}\n\nSi vous n'attendiez pas ce compte, contactez la boutique."
        );
    }
    if (!$mail_sent) {
        error_log('[staff] Le compte a été créé mais le lien de création du mot de passe n’a pas pu être envoyé.');
    }
    error_log(sprintf('[staff] Utilisateur %d créé avec le rôle %s par utilisateur %d.', $user_id, $role, get_current_user_id()));

    return rest_ensure_response(['id' => $user_id, 'role' => $role, 'email_sent' => (bool) $mail_sent]);
}
