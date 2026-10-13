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
});

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
        ],
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_Error('contact_save_failed', 'Impossible d\'enregistrer votre message.', ['status' => 500]);
    }

    $store_email = get_option('woocommerce_email_from_address') ?: get_option('admin_email');
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

    wp_mail(
        $store_email,
        '[Contact] ' . $label . ' — ' . $name,
        implode("\n", $lines),
        ['Reply-To: ' . $name . ' <' . $email . '>'],
        $attachment ? [$attachment['file']] : []
    );

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
