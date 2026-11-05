<?php
/**
 * Formulaire de contact (US-1176 / US-1177)
 * POST /wp-json/custom/v1/contact  (multipart/form-data)
 *
 * Chaque message est envoyé par e-mail à la boutique et conservé dans
 * l'administration (type de contenu privé « Messages »).
 */

const HEADLESS_CONTACT_SUBJECTS = [
    'commande' => 'Commande & livraison',
    'coffret'  => 'Coffret cadeau sur mesure',
    'conseil'  => 'Conseil lecture',
    'devis'    => 'Devis pro / association',
    'retrait'  => 'Retrait en boutique',
    'autre'    => 'Autre',
];

const HEADLESS_CONTACT_MAX_SIZE = 5 * MB_IN_BYTES;
const HEADLESS_CONTACT_MIMES    = [
    'jpg|jpeg' => 'image/jpeg',
    'png'      => 'image/png',
    'pdf'      => 'application/pdf',
];

if (!function_exists('headless_front_base_url')) {
    function headless_front_base_url()
    {
        $configured = '';
        if (defined('HEADLESS_FRONTEND_URL') && is_string(HEADLESS_FRONTEND_URL)) {
            $configured = trim(HEADLESS_FRONTEND_URL);
        }
        if ($configured === '') {
            $configured = trim((string) get_option('headless_frontend_url', ''));
        }

        if ($configured !== '' && wp_http_validate_url($configured)) {
            $configured = untrailingslashit($configured);
            return preg_match('#/ecom$#', $configured) ? $configured : $configured . '/ecom';
        }

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw((string) $_SERVER['HTTP_ORIGIN']) : '';
        if ($origin !== '' && wp_http_validate_url($origin)) {
            $origin = untrailingslashit($origin);
            return preg_match('#/ecom$#', $origin) ? $origin : $origin . '/ecom';
        }

        return untrailingslashit(home_url('/ecom'));
    }
}

if (!function_exists('headless_front_url')) {
    function headless_front_url($path = '/')
    {
        $base = headless_front_base_url();
        $path = (string) $path;
        if ($path === '' || $path === '/') {
            return $base;
        }
        return $base . '/' . ltrim($path, '/');
    }
}

add_action('init', function () {
    register_post_type('contact_message', [
        'labels'          => [
            'name'          => 'Messages',
            'singular_name' => 'Message',
            'menu_name'     => 'Messages',
            'all_items'     => 'Tous les messages',
        ],
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'menu_icon'       => 'dashicons-email-alt',
        'supports'        => ['title', 'editor', 'custom-fields'],
        'capability_type' => 'post',
        'capabilities'    => ['create_posts' => 'do_not_allow'],
        'map_meta_cap'    => true,
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/contact', [
        'methods'             => 'POST',
        'callback'            => 'headless_contact_submit',
        'permission_callback' => '__return_true',
    ]);

    // Tableau de bord /admin : derniers messages + nombre de non lus
    register_rest_route('custom/v1', '/contact-messages', [
        'methods'             => 'GET',
        'callback'            => 'headless_contact_list_messages',
        'permission_callback' => function () {
            return current_user_can('manage_woocommerce');
        },
    ]);

    register_rest_route('custom/v1', '/quotes', [
        'methods'             => 'GET',
        'callback'            => 'headless_quote_list',
        'permission_callback' => function () {
            return current_user_can('manage_woocommerce');
        },
    ]);

    register_rest_route('custom/v1', '/quotes/(?P<id>\d+)/validate', [
        'methods'             => 'POST',
        'callback'            => 'headless_quote_validate',
        'permission_callback' => function () {
            return current_user_can('manage_woocommerce');
        },
        'args'                => [
            'id' => [
                'validate_callback' => function ($param) {
                    return (int) $param > 0;
                },
            ],
        ],
    ]);
});

function headless_contact_list_messages($request)
{
    $limit = max(1, min(20, (int) ($request->get_param('per_page') ?: 5)));

    $posts = get_posts([
        'post_type'      => 'contact_message',
        'post_status'    => 'private',
        'posts_per_page' => $limit,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    $unread = new WP_Query([
        'post_type'      => 'contact_message',
        'post_status'    => 'private',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'meta_query'     => [['key' => 'contact_read', 'value' => '0']],
    ]);

    $items = array_map(function ($post) {
        $subject = get_post_meta($post->ID, 'contact_subject', true);
        return [
            'id'        => $post->ID,
            'date'      => get_post_time('c', true, $post),
            'firstname' => get_post_meta($post->ID, 'contact_firstname', true),
            'lastname'  => get_post_meta($post->ID, 'contact_lastname', true),
            'email'     => get_post_meta($post->ID, 'contact_email', true),
            'subject'   => HEADLESS_CONTACT_SUBJECTS[$subject] ?? $subject,
            'excerpt'   => wp_trim_words($post->post_content, 24, '…'),
            'unread'    => get_post_meta($post->ID, 'contact_read', true) === '0',
            'edit_url'  => admin_url('post.php?post=' . $post->ID . '&action=edit'),
        ];
    }, $posts);

    return rest_ensure_response([
        'unread' => (int) $unread->found_posts,
        'items'  => $items,
    ]);
}

function headless_quote_list($request)
{
    $limit = max(1, min(100, (int) ($request->get_param('per_page') ?: 50)));
    $status = sanitize_key((string) $request->get_param('status'));

    $meta_query = [[
        'key'     => 'contact_subject',
        'value'   => ['devis', 'coffret'],
        'compare' => 'IN',
    ]];

    if ($status === 'pending' || $status === 'validated') {
        $meta_query[] = [
            'key'   => 'contact_quote_status',
            'value' => $status,
        ];
    }

    $query = new WP_Query([
        'post_type'      => 'contact_message',
        'post_status'    => 'private',
        'posts_per_page' => $limit,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'meta_query'     => $meta_query,
    ]);
    $posts = $query->posts;

    $items = array_map(function ($post) {
        $status = get_post_meta($post->ID, 'contact_quote_status', true);
        $order_id = (int) get_post_meta($post->ID, 'contact_quote_order_id', true);
        $subject = (string) get_post_meta($post->ID, 'contact_subject', true);
        return [
            'id'          => $post->ID,
            'date'        => get_post_time('c', true, $post),
            'firstname'   => get_post_meta($post->ID, 'contact_firstname', true),
            'lastname'    => get_post_meta($post->ID, 'contact_lastname', true),
            'email'       => get_post_meta($post->ID, 'contact_email', true),
            'phone'       => get_post_meta($post->ID, 'contact_phone', true),
            'subject'     => $subject,
            'subject_label' => HEADLESS_CONTACT_SUBJECTS[$subject] ?? $subject,
            'message'     => (string) $post->post_content,
            'attachment'  => get_post_meta($post->ID, 'contact_attachment', true),
            'quote_status'=> $status ?: 'pending',
            'order_id'    => $order_id ?: null,
            'order_edit_url' => $order_id ? admin_url('admin.php?page=wc-orders&action=edit&id=' . $order_id) : '',
        ];
    }, $posts);

    return rest_ensure_response([
        'total' => (int) $query->found_posts,
        'items' => $items,
    ]);
}

function headless_quote_validate($request)
{
    if (!function_exists('wc_create_order')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce doit être actif pour créer une commande.', ['status' => 503]);
    }

    $quote_id = (int) $request->get_param('id');
    $quote = get_post($quote_id);
    if (!$quote || $quote->post_type !== 'contact_message' || $quote->post_status !== 'private') {
        return new WP_Error('quote_not_found', 'Devis introuvable.', ['status' => 404]);
    }

    $subject = (string) get_post_meta($quote_id, 'contact_subject', true);
    if (!in_array($subject, ['devis', 'coffret'], true)) {
        return new WP_Error('quote_invalid_subject', 'Ce message n’est pas un devis/coffret.', ['status' => 400]);
    }

    $existing_order_id = (int) get_post_meta($quote_id, 'contact_quote_order_id', true);
    if ($existing_order_id > 0) {
        return new WP_Error('quote_already_validated', 'Ce devis a déjà été validé en commande.', ['status' => 409]);
    }

    $amount = (float) $request->get_param('amount');
    if ($amount <= 0) {
        return new WP_Error('invalid_amount', 'Le montant du devis doit être supérieur à 0.', ['status' => 400]);
    }

    $message = sanitize_textarea_field((string) $request->get_param('message'));
    $firstname = sanitize_text_field((string) get_post_meta($quote_id, 'contact_firstname', true));
    $lastname = sanitize_text_field((string) get_post_meta($quote_id, 'contact_lastname', true));
    $email = sanitize_email((string) get_post_meta($quote_id, 'contact_email', true));
    $phone = sanitize_text_field((string) get_post_meta($quote_id, 'contact_phone', true));

    $customer = headless_quote_resolve_customer($email, $firstname, $lastname, $phone);
    if (is_wp_error($customer)) {
        return $customer;
    }

    try {
        $order = wc_create_order();
        if (!$order) {
            throw new Exception('Impossible de créer la commande WooCommerce.');
        }
        $order->set_customer_id((int) $customer['user_id']);

        $item = new WC_Order_Item_Product();
        $item->set_name('Coffret personnalisé (devis #' . $quote_id . ')');
        $item->set_quantity(1);
        $item->set_subtotal($amount);
        $item->set_total($amount);
        $order->add_item($item);

        $order->set_address([
            'first_name' => $firstname,
            'last_name'  => $lastname,
            'email'      => $email,
            'phone'      => $phone,
        ], 'billing');

        $note_lines = [
            'Commande créée depuis devis #' . $quote_id,
            'Message du client : ' . (string) $quote->post_content,
        ];
        if ($message !== '') {
            $note_lines[] = 'Note admin : ' . $message;
        }
        $order->set_customer_note(implode("\n\n", $note_lines));
        $order->calculate_totals(false);
        $order->update_status('pending', 'Commande créée depuis devis #' . $quote_id, true);
        $order->save();
    } catch (Throwable $error) {
        return new WP_Error('quote_order_creation_failed', $error->getMessage(), ['status' => 500]);
    }

    update_post_meta($quote_id, 'contact_quote_status', 'validated');
    update_post_meta($quote_id, 'contact_quote_order_id', $order->get_id());
    update_post_meta($quote_id, 'contact_quote_customer_id', (int) $customer['user_id']);

    $mail_sent = headless_quote_send_customer_email($order, [
        'quote_id' => $quote_id,
        'email' => $email,
        'firstname' => $firstname,
        'lastname' => $lastname,
        'customer_created' => (bool) $customer['created'],
        'user' => $customer['user'],
        'amount' => $amount,
    ]);
    if (!$mail_sent) {
        update_post_meta($quote_id, 'contact_quote_mail_error', 'wp_mail_failed');
    }

    return rest_ensure_response([
        'success'       => true,
        'order_id'      => $order->get_id(),
        'order_edit_url'=> admin_url('admin.php?page=wc-orders&action=edit&id=' . $order->get_id()),
        'customer_id'   => (int) $customer['user_id'],
        'customer_created' => (bool) $customer['created'],
        'mail_sent'     => (bool) $mail_sent,
    ]);
}

function headless_quote_resolve_customer($email, $firstname, $lastname, $phone)
{
    if (!is_email($email)) {
        return new WP_Error('quote_customer_email_invalid', 'Adresse e-mail client invalide pour créer la commande.', ['status' => 400]);
    }

    $user = get_user_by('email', $email);
    $created = false;

    if (!$user) {
        $username = headless_quote_username_from_email($email);
        $password = wp_generate_password(20, true, true);

        if (function_exists('wc_create_new_customer')) {
            $user_id = wc_create_new_customer($email, $username, $password, [
                'first_name' => $firstname,
                'last_name'  => $lastname,
            ]);
        } else {
            $user_id = wp_create_user($username, $password, $email);
            if (!is_wp_error($user_id)) {
                $wp_user = new WP_User($user_id);
                $wp_user->set_role('customer');
            }
        }

        if (is_wp_error($user_id)) {
            return new WP_Error('quote_customer_create_failed', $user_id->get_error_message(), ['status' => 500]);
        }

        $user = get_user_by('id', (int) $user_id);
        $created = true;
    }

    if (!$user) {
        return new WP_Error('quote_customer_missing', 'Impossible de relier la commande à un compte client.', ['status' => 500]);
    }

    update_user_meta($user->ID, 'billing_email', $email);
    if ($firstname !== '') {
        update_user_meta($user->ID, 'billing_first_name', $firstname);
    }
    if ($lastname !== '') {
        update_user_meta($user->ID, 'billing_last_name', $lastname);
    }
    if ($phone !== '') {
        update_user_meta($user->ID, 'billing_phone', $phone);
    }

    return [
        'user_id' => (int) $user->ID,
        'user'    => $user,
        'created' => $created,
    ];
}

function headless_quote_username_from_email($email)
{
    $base = sanitize_user(strstr($email, '@', true), true) ?: 'client';
    $username = $base;
    $suffix = 2;
    while (username_exists($username)) {
        $username = $base . $suffix++;
    }
    return $username;
}

function headless_quote_send_customer_email($order, $args)
{
    $quote_id = (int) ($args['quote_id'] ?? 0);
    $email = sanitize_email((string) ($args['email'] ?? ''));
    $firstname = sanitize_text_field((string) ($args['firstname'] ?? ''));
    $lastname = sanitize_text_field((string) ($args['lastname'] ?? ''));
    $customer_created = !empty($args['customer_created']);
    $user = $args['user'] ?? null;
    $amount = (float) ($args['amount'] ?? 0);

    if (!is_email($email) || !$order) {
        return false;
    }

    $full_name = trim($firstname . ' ' . $lastname);
    $account_link = headless_front_url('/profile?section=orders');
    $shop_link = headless_front_url('/');
    $payment_link = headless_front_url('/profile?section=orders');

    $amount_label = number_format_i18n($amount, 2) . ' ' . get_woocommerce_currency_symbol($order->get_currency());

    $lines = [
        'Assalamu alaykum ' . ($full_name !== '' ? $full_name : ''),
        '',
        'Votre devis #' . $quote_id . ' a été validé.',
        'Une commande n°' . $order->get_order_number() . ' a été créée pour un montant de ' . $amount_label . '.',
        '',
    ];

    if ($customer_created && $user instanceof WP_User) {
        $reset_key = get_password_reset_key($user);
        if (is_wp_error($reset_key)) {
            return false;
        }
        $reset_link = headless_front_url('/new-password') . '?login=' . rawurlencode($user->user_login) . '&key=' . rawurlencode($reset_key);
        $lines[] = 'Un compte client a été créé avec cette adresse e-mail.';
        $lines[] = 'Définissez votre mot de passe ici : ' . $reset_link;
    } else {
        $lines[] = 'Connectez-vous à votre compte avec cette adresse e-mail.';
    }

    $lines[] = 'Espace client (paiement de la commande) : ' . $payment_link;
    $lines[] = 'Boutique : ' . $shop_link;

    return wp_mail(
        $email,
        'Votre devis est validé — commande ' . $order->get_order_number(),
        implode("\n", $lines),
        ['Content-Type: text/plain; charset=UTF-8']
    );
}

// Administration WordPress : détail lisible du message, marqué comme lu à l'ouverture
add_action('add_meta_boxes_contact_message', function ($post) {
    if (get_post_meta($post->ID, 'contact_read', true) === '0') {
        update_post_meta($post->ID, 'contact_read', 1);
    }
    remove_meta_box('postcustom', 'contact_message', 'normal');
    add_meta_box('contact_details', 'Coordonnées', function ($post) {
        $meta = fn ($key) => get_post_meta($post->ID, 'contact_' . $key, true);
        $subject = $meta('subject');
        $rows = [
            'Objet'          => HEADLESS_CONTACT_SUBJECTS[$subject] ?? $subject,
            'Nom'            => trim($meta('firstname') . ' ' . $meta('lastname')),
            'Email'          => sprintf('<a href="mailto:%1$s">%1$s</a>', esc_attr($meta('email'))),
            'Téléphone'      => esc_html($meta('phone')),
            'N° de commande' => esc_html($meta('order')),
            'Pièce jointe'   => $meta('attachment')
                ? sprintf('<a href="%s" target="_blank" rel="noreferrer">Ouvrir</a>', esc_url($meta('attachment')))
                : '',
        ];
        echo '<table class="form-table" role="presentation">';
        foreach ($rows as $label => $value) {
            if ($value === '') {
                continue;
            }
            $html = in_array($label, ['Email', 'Pièce jointe', 'Téléphone', 'N° de commande'], true) ? $value : esc_html($value);
            printf('<tr><th scope="row">%s</th><td>%s</td></tr>', esc_html($label), $html);
        }
        echo '</table>';
    }, 'contact_message', 'normal', 'high');
});

add_filter('manage_contact_message_posts_columns', function ($columns) {
    return [
        'cb'              => $columns['cb'],
        'title'           => 'Message',
        'contact_email'   => 'Email',
        'contact_status'  => 'Statut',
        'date'            => $columns['date'],
    ];
});

add_action('manage_contact_message_posts_custom_column', function ($column, $post_id) {
    if ($column === 'contact_email') {
        echo esc_html(get_post_meta($post_id, 'contact_email', true));
    }
    if ($column === 'contact_status') {
        echo get_post_meta($post_id, 'contact_read', true) === '0' ? '<strong>Non lu</strong>' : 'Lu';
    }
}, 10, 2);

function headless_contact_rate_limit_check()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $key = 'headless_contact_' . md5($ip);

    $attempts = (int) get_transient($key);

    if ($attempts >= 5) {
        return false;
    }

    set_transient($key, $attempts + 1, HOUR_IN_SECONDS);
    return true;
}

function headless_contact_submit($request)
{
    // Champ piège invisible : seuls les robots le remplissent.
    if (!empty($request->get_param('website'))) {
        return rest_ensure_response(['success' => true]);
    }

    if (!headless_contact_rate_limit_check()) {
        return new WP_Error('too_many_requests', 'Trop de messages envoyés depuis cette adresse. Réessayez plus tard.', ['status' => 429]);
    }

    $subject   = sanitize_key($request->get_param('subject'));
    $lastname  = sanitize_text_field($request->get_param('lastname'));
    $firstname = sanitize_text_field($request->get_param('firstname'));
    $email     = sanitize_email($request->get_param('email'));
    $phone     = sanitize_text_field($request->get_param('phone'));
    $order     = sanitize_text_field($request->get_param('order'));
    $message   = sanitize_textarea_field($request->get_param('message'));
    $consent   = filter_var($request->get_param('consent'), FILTER_VALIDATE_BOOLEAN);

    if (!isset(HEADLESS_CONTACT_SUBJECTS[$subject])) {
        return new WP_Error('invalid_subject', 'Merci de choisir l\'objet de votre demande.', ['status' => 400]);
    }
    if ($lastname === '' || $firstname === '' || $message === '') {
        return new WP_Error('missing_fields', 'Nom, prénom et message sont requis.', ['status' => 400]);
    }
    if (!is_email($email)) {
        return new WP_Error('invalid_email', 'Adresse email invalide.', ['status' => 400]);
    }
    if (!$consent) {
        return new WP_Error('missing_consent', 'Merci d\'accepter la politique de confidentialité.', ['status' => 400]);
    }

    $attachment = headless_contact_store_attachment($request->get_file_params()['attachment'] ?? null);
    if (is_wp_error($attachment)) {
        return $attachment;
    }

    $label = HEADLESS_CONTACT_SUBJECTS[$subject];
    $name  = trim($firstname . ' ' . $lastname);

    $post_id = wp_insert_post([
        'post_type'    => 'contact_message',
        'post_status'  => 'private',
        'post_title'   => $label . ' — ' . $name,
        'post_content' => $message,
        'meta_input'   => [
            'contact_subject'    => $subject,
            'contact_firstname'  => $firstname,
            'contact_lastname'   => $lastname,
            'contact_email'      => $email,
            'contact_phone'      => $phone,
            'contact_order'      => $order,
            'contact_attachment' => $attachment ? $attachment['url'] : '',
            'contact_read'       => 0,
            'contact_quote_status' => in_array($subject, ['devis', 'coffret'], true) ? 'pending' : '',
        ],
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_Error('contact_save_failed', 'Impossible d\'enregistrer votre message.', ['status' => 500]);
    }

    $store_email = get_option('woocommerce_email_from_address') ?: get_option('admin_email');
    $store_email = sanitize_email((string) $store_email);
    if (!is_email($store_email)) {
        return new WP_Error('contact_mail_recipient_invalid', 'Adresse e-mail de destination invalide. Vérifiez les réglages WooCommerce/WordPress.', ['status' => 500]);
    }

    $lines = [
        'Objet : ' . $label,
        'Nom : ' . $name,
        'Email : ' . $email,
    ];
    if ($phone !== '') {
        $lines[] = 'Téléphone : ' . $phone;
    }
    if ($order !== '') {
        $lines[] = 'N° de commande : ' . $order;
    }
    $lines[] = '';
    $lines[] = $message;

    $sent = wp_mail(
        $store_email,
        '[Contact] ' . $label . ' — ' . $name,
        implode("\n", $lines),
        [
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $name . ' <' . $email . '>',
        ],
        $attachment ? [$attachment['file']] : []
    );

    if (!$sent) {
        update_post_meta($post_id, 'contact_mail_error', 'wp_mail_failed');
        return new WP_Error(
            'contact_mail_failed',
            'Votre message a bien été enregistré, mais l\'e-mail n\'a pas pu être envoyé. Vérifiez la configuration e-mail du serveur.',
            ['status' => 502]
        );
    }

    return rest_ensure_response(['success' => true, 'id' => $post_id]);
}

function headless_contact_store_attachment($file)
{
    if (empty($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return new WP_Error('upload_failed', 'La pièce jointe n\'a pas pu être envoyée.', ['status' => 400]);
    }
    if ($file['size'] > HEADLESS_CONTACT_MAX_SIZE) {
        return new WP_Error('file_too_large', 'La pièce jointe dépasse 5 Mo.', ['status' => 400]);
    }

    $check = wp_check_filetype_and_ext($file['tmp_name'], $file['name'], HEADLESS_CONTACT_MIMES);
    if (empty($check['type'])) {
        return new WP_Error('invalid_file_type', 'Formats acceptés : JPG, PNG ou PDF.', ['status' => 400]);
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';

    $upload = wp_handle_upload($file, [
        'test_form' => false,
        'mimes'     => HEADLESS_CONTACT_MIMES,
    ]);

    if (isset($upload['error'])) {
        return new WP_Error('upload_failed', $upload['error'], ['status' => 400]);
    }

    return $upload;
}
