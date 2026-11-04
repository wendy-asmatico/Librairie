<?php

/**
 * Exemple de lecture de champs ACF pour la page WordPress « exemple-acf ».
 * GET /wp-json/custom/v1/acf-demo
 */
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/acf-demo', [
        'methods'             => 'GET',
        'callback'            => 'headless_acf_demo_get_content',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/trust-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_trust_settings',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/home-categories-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_home_categories_settings',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/gift-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_gift_settings',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/store-location-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_store_location_settings',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/catalogue-hero-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_catalogue_hero_settings',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/kids-hero-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_kids_hero_settings',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/contact-info-settings', [
        'methods'             => 'GET',
        'callback'            => 'headless_contact_info_settings',
        'permission_callback' => '__return_true',
    ]);
});

add_filter('acf/location/rule_types', function ($choices) {
    $choices['Page']['page_slug'] = 'Page par slug';
    return $choices;
});

add_filter('acf/location/rule_values/page_slug', function ($choices) {
    $choices['reglages-accueil'] = 'Réglages accueil';
    $choices['reglages-catalogue'] = 'Réglages catalogue';
    $choices['reglages-enfants'] = 'Réglages enfants';
    $choices['reglages-contact'] = 'Réglages contact';
    return $choices;
});

add_filter('acf/location/rule_match/page_slug', function ($match, $rule, $screen) {
    $post = get_post($screen['post_id'] ?? 0);
    $matches_slug = $post && $post->post_name === $rule['value'];

    return $rule['operator'] === '!=' ? !$matches_slug : $matches_slug;
}, 10, 3);

add_action('init', function () {
    if (!get_page_by_path('reglages-contact', OBJECT, 'page')) {
        wp_insert_post([
            'post_title'  => 'Réglages contact',
            'post_name'   => 'reglages-contact',
            'post_type'   => 'page',
            'post_status' => 'publish',
            'post_content'=> '',
        ]);
    }
});

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    $fields = [];
    $text_fields = [
        ['home_eyebrow', 'Accroche du bloc', 'LIBRAIRIE · VÊTEMENTS · CADEAUX'],
        ['home_title', 'Titre du bloc', 'Des produits qui ont du sens'],
        ['home_description', 'Texte descriptif', 'Commandez en ligne, faites-vous livrer ou retirez votre commande directement en boutique.'],
        ['home_primary_button_text', 'Texte bouton principal', 'Voir les nouveautés'],
        ['home_primary_button_url', 'Lien bouton principal', '/catalogue'],
        ['home_secondary_button_text', 'Texte bouton secondaire', 'Composer un coffret'],
        ['home_secondary_button_url', 'Lien bouton secondaire', '/coffrets'],
        ['home_books_label', 'Titre carte livres', 'Livres'],
        ['home_clothing_label', 'Titre carte vêtements', 'Vêtements'],
        ['home_accessories_label', 'Titre carte accessoires', 'Accessoires'],
        ['home_children_label', 'Titre carte enfants', 'Enfants'],
    ];

    foreach ($text_fields as $index => $field) {
        $fields[] = [
            'key'           => 'field_home_categories_' . $field[0],
            'label'         => $field[1],
            'name'          => $field[0],
            'type'          => 'text',
            'default_value' => $field[2],
        ];
    }

    $image_fields = [
        ['home_books_image', 'Image carte livres'],
        ['home_clothing_image', 'Image carte vêtements'],
        ['home_accessories_image', 'Image carte accessoires'],
        ['home_children_image', 'Image carte enfants'],
    ];

    foreach ($image_fields as $field) {
        $fields[] = [
            'key'           => 'field_home_categories_' . $field[0],
            'label'         => $field[1],
            'name'          => $field[0],
            'type'          => 'image',
            'return_format' => 'array',
            'preview_size'  => 'medium',
            'library'       => 'all',
        ];
    }

    $gift_text_fields = [
        ['gift_eyebrow', 'Gift — Accroche', 'Service personnalisé & cadeaux uniques'],
        ['gift_title', 'Gift — Titre', 'Coffrets Cadeaux'],
        ['gift_description', 'Gift — Description', 'Offrez un présent soigné dans les moindres détails.'],
        ['gift_primary_button_text', 'Gift — Bouton coffrets', 'Regarder nos coffrets cadeaux'],
        ['gift_secondary_button_text', 'Gift — Bouton personnalisé', 'Créer un coffret cadeau personnalisé'],
        ['gift_secondary_button_url', 'Gift — Lien bouton personnalisé', '/contact'],
        ['gift_image_alt', 'Gift — Description image', 'Coffret cadeau : Coran, citadelle du musulman, parfum et tasbih'],
    ];

    foreach ($gift_text_fields as $field) {
        $fields[] = [
            'key'           => 'field_gift_settings_' . $field[0],
            'label'         => $field[1],
            'name'          => $field[0],
            'type'          => 'text',
            'default_value' => $field[2],
        ];
    }

    $fields[] = [
        'key'           => 'field_gift_settings_gift_image',
        'label'         => 'Gift — Image',
        'name'          => 'gift_image',
        'type'          => 'image',
        'return_format' => 'array',
        'preview_size'  => 'medium',
        'library'       => 'all',
    ];

    $store_location_fields = [
        ['store_eyebrow', 'Boutique — Accroche', 'LIEU DE RENCONTRE & RETRAIT'],
        ['store_title', 'Boutique — Titre', 'Notre Boutique'],
        ['store_address', 'Boutique — Adresse', '14 Boulevard de la Sagesse, 13002 Marseille'],
        ['store_transport', 'Boutique — Accès / transport', 'Métro National • Accès rapide'],
        ['store_hours', 'Boutique — Horaires', 'Du Mardi au Dimanche : 10h30 – 19h30 sans interruption'],
        ['store_pickup', 'Boutique — Information retrait', 'Retrait express gratuit pour vos commandes passées sur le site'],
        ['store_maps_button_text', 'Boutique — Bouton Google Maps', 'Nous trouver sur Google Maps'],
        ['store_pickup_button_text', 'Boutique — Bouton retrait', 'Préparer mon retrait'],
        ['store_pickup_button_url', 'Boutique — Lien retrait', '/contact'],
        ['store_map_query', 'Boutique — Localisation de la carte', '13002 Marseille'],
    ];

    foreach ($store_location_fields as $field) {
        $fields[] = [
            'key'           => 'field_store_location_' . $field[0],
            'label'         => $field[1],
            'name'          => $field[0],
            'type'          => 'text',
            'default_value' => $field[2],
        ];
    }

    acf_add_local_field_group([
        'key'      => 'group_home_categories_settings',
        'title'    => 'Contenu HomeCategories',
        'fields'   => $fields,
        'location' => [[[
            'param'    => 'page_slug',
            'operator' => '==',
            'value'    => 'reglages-accueil',
        ]]],
        'position' => 'normal',
        'style'    => 'default',
    ]);

    $catalogue_hero_fields = [];
    $catalogue_heroes = [
        ['livres_coran', 'Livres & Coran', 'LIVRES & CORAN', 'Des lectures qui nourrissent l’esprit', 'Explorez notre sélection de Corans et d’ouvrages pour approfondir vos connaissances.'],
        ['vetements', 'Vêtements', 'VÊTEMENTS', 'L’élégance au quotidien', 'Découvrez une sélection de vêtements confortables, choisis avec soin.'],
        ['accessoires', 'Accessoires', 'ACCESSOIRES', 'Les détails qui font la différence', 'Retrouvez des accessoires et des idées utiles pour vous accompagner chaque jour.'],
        ['coffrets_cadeaux', 'Coffrets cadeaux', 'COFFRETS CADEAUX', 'Offrez un cadeau plein de sens', 'Composez une attention délicate avec nos coffrets et idées cadeaux.'],
    ];

    foreach ($catalogue_heroes as $hero) {
        [$key, $label, $default_label, $default_title, $default_description] = $hero;
        foreach ([
            ['label', 'Libellé', $default_label],
            ['title', 'Titre', $default_title],
            ['description', 'Description', $default_description],
        ] as [$field_suffix, $field_label, $default_value]) {
            $catalogue_hero_fields[] = [
                'key'           => 'field_catalogue_hero_' . $key . '_' . $field_suffix,
                'label'         => $label . ' — ' . $field_label,
                'name'          => 'catalogue_hero_' . $key . '_' . $field_suffix,
                'type'          => $field_suffix === 'description' ? 'textarea' : 'text',
                'default_value' => $default_value,
                'rows'          => $field_suffix === 'description' ? 3 : 1,
            ];
        }

        $catalogue_hero_fields[] = [
            'key'           => 'field_catalogue_hero_' . $key . '_image',
            'label'         => $label . ' — Image',
            'name'          => 'catalogue_hero_' . $key . '_image',
            'type'          => 'image',
            'return_format' => 'array',
            'preview_size'  => 'medium',
            'library'       => 'all',
        ];
    }

    acf_add_local_field_group([
        'key'      => 'group_catalogue_hero_settings',
        'title'    => 'Bannières CatalogueHero',
        'fields'   => $catalogue_hero_fields,
        'location' => [[[
            'param'    => 'page_slug',
            'operator' => '==',
            'value'    => 'reglages-catalogue',
        ]]],
        'position' => 'normal',
        'style'    => 'default',
    ]);

    acf_add_local_field_group([
        'key'      => 'group_kids_hero_settings',
        'title'    => 'Bannière KidsHero',
        'fields'   => [
            [
                'key'           => 'field_kids_hero_title_line_1',
                'label'         => 'Titre — première ligne',
                'name'          => 'kids_hero_title_line_1',
                'type'          => 'text',
                'default_value' => 'L’ESPACE DES',
            ],
            [
                'key'           => 'field_kids_hero_title_line_2',
                'label'         => 'Titre — deuxième ligne (mobile)',
                'name'          => 'kids_hero_title_line_2',
                'type'          => 'text',
                'default_value' => 'PETITS CROYANTS',
            ],
            [
                'key'           => 'field_kids_hero_image',
                'label'         => 'Image de la bannière',
                'name'          => 'kids_hero_image',
                'type'          => 'image',
                'return_format' => 'array',
                'preview_size'  => 'large',
                'library'       => 'all',
            ],
        ],
        'location' => [[[
            'param'    => 'page_slug',
            'operator' => '==',
            'value'    => 'reglages-enfants',
        ]]],
        'position' => 'normal',
        'style'    => 'default',
    ]);

    $contact_fields = [
        ['contact_phone_kicker', 'Carte téléphone — Intitulé', 'SERVICE CLIENT', 'text'],
        ['contact_phone', 'Carte téléphone — Numéro', '+33 1 42 68 00 00', 'text'],
        ['contact_phone_href', 'Carte téléphone — Lien', 'tel:+33142680000', 'url'],
        ['contact_phone_note', 'Carte téléphone — Note', 'Du mardi au dimanche · 10h30 – 19h30', 'text'],
        ['contact_email_kicker', 'Carte email — Intitulé', 'PAR EMAIL', 'text'],
        ['contact_email', 'Carte email — Adresse', 'contact@maktabaelhikma.fr', 'email'],
        ['contact_email_note', 'Carte email — Note', 'Réponse sous 24 h ouvrées, en français ou en arabe', 'text'],
        ['contact_whatsapp_kicker', 'WhatsApp — Intitulé', 'LIBRAIRE EN LIGNE', 'text'],
        ['contact_whatsapp_title', 'WhatsApp — Titre', 'Un conseil immédiat ?', 'text'],
        ['contact_whatsapp_description', 'WhatsApp — Description', 'Une photo d’un livre, une question sur la taille d’un qamis ou une idée de coffret : un libraire vous répond en direct sur WhatsApp.', 'textarea'],
        ['contact_whatsapp_button_text', 'WhatsApp — Bouton', 'Écrire sur WhatsApp', 'text'],
        ['contact_whatsapp_url', 'WhatsApp — Lien', 'https://wa.me/33142680000', 'url'],
        ['contact_faq_kicker', 'FAQ — Intitulé', 'QUESTIONS FRÉQUENTES', 'text'],
        ['contact_faq_title', 'FAQ — Titre', 'Votre réponse est peut-être déjà ici', 'text'],
        ['contact_faq_1_label', 'FAQ 1 — Question', 'Modalités et délais d’expédition', 'text'],
        ['contact_faq_1_url', 'FAQ 1 — Lien', '/cgv', 'url'],
        ['contact_faq_2_label', 'FAQ 2 — Question', 'Suivre l’état de ma commande', 'text'],
        ['contact_faq_2_url', 'FAQ 2 — Lien', '/profile', 'url'],
        ['contact_faq_3_label', 'FAQ 3 — Question', 'Retrait gratuit en boutique', 'text'],
        ['contact_faq_3_url', 'FAQ 3 — Lien', '#boutique', 'text'],
        ['contact_faq_4_label', 'FAQ 4 — Question', 'Retours & droit de rétractation', 'text'],
        ['contact_faq_4_url', 'FAQ 4 — Lien', '/cgv', 'url'],
        ['contact_faq_all_text', 'FAQ — Texte du lien centre d’aide', 'Voir tout le Centre d’aide →', 'text'],
        ['contact_faq_all_url', 'FAQ — Lien centre d’aide', '/cgv', 'url'],
    ];

    $contact_acf_fields = [];
    foreach ($contact_fields as [$name, $label, $default, $type]) {
        $contact_acf_fields[] = [
            'key'           => 'field_' . $name,
            'label'         => $label,
            'name'          => $name,
            'type'          => $type,
            'default_value' => $default,
        ];
    }

    acf_add_local_field_group([
        'key'      => 'group_contact_info_settings',
        'title'    => 'Cartes de contact',
        'fields'   => $contact_acf_fields,
        'location' => [[[
            'param'    => 'page_slug',
            'operator' => '==',
            'value'    => 'reglages-contact',
        ]]],
        'position' => 'normal',
        'style'    => 'default',
    ]);

});

function headless_acf_demo_get_content()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher cette page.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('exemple-acf', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'acf_demo_page_not_found',
            'Créez et publiez la page WordPress avec le slug « exemple-acf ».',
            ['status' => 404]
        );
    }

    $image = get_field('hero_image', $page->ID);
    if (is_array($image)) {
        $image = $image['url'] ?? '';
    } elseif (is_numeric($image)) {
        $image = wp_get_attachment_image_url((int) $image, 'large') ?: '';
    }

    return rest_ensure_response([
        'title'       => sanitize_text_field((string) get_field('hero_title', $page->ID)),
        'text'        => sanitize_textarea_field((string) get_field('hero_text', $page->ID)),
        'image'       => esc_url_raw((string) $image),
        'button_text' => sanitize_text_field((string) get_field('button_text', $page->ID)),
        'button_url'  => esc_url_raw((string) get_field('button_url', $page->ID)),
    ]);
}

/**
 * Libellés globaux du composant Trust, stockés sur la page WordPress
 * « Réglages des engagements » (slug : reglages-engagements).
 */
function headless_trust_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-engagements', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'trust_settings_page_not_found',
            'Créez et publiez la page WordPress avec le slug « reglages-engagements ».',
            ['status' => 404]
        );
    }

    $items = [];
    for ($index = 1; $index <= 4; $index++) {
        $items[] = sanitize_text_field((string) get_field('engagement_' . $index, $page->ID));
    }

    return rest_ensure_response(['items' => $items]);
}

/**
 * Textes, liens et images du bloc HomeCategories, stockés sur la page
 * WordPress « Réglages accueil » (slug : reglages-accueil).
 */
function headless_home_categories_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-accueil', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'home_categories_settings_not_found',
            'Créez et publiez la page WordPress avec le slug « reglages-accueil ».',
            ['status' => 404]
        );
    }

    $image_url = function ($field_name) use ($page) {
        $image = get_field($field_name, $page->ID);
        if (is_array($image)) {
            $image = $image['url'] ?? '';
        } elseif (is_numeric($image)) {
            $image = wp_get_attachment_image_url((int) $image, 'large') ?: '';
        }

        return esc_url_raw((string) $image);
    };

    $text_fields = [
        'eyebrow'                => 'home_eyebrow',
        'title'                  => 'home_title',
        'description'            => 'home_description',
        'primary_button_text'    => 'home_primary_button_text',
        'primary_button_url'     => 'home_primary_button_url',
        'secondary_button_text'  => 'home_secondary_button_text',
        'secondary_button_url'   => 'home_secondary_button_url',
        'books_label'            => 'home_books_label',
        'clothing_label'         => 'home_clothing_label',
        'accessories_label'      => 'home_accessories_label',
        'children_label'         => 'home_children_label',
    ];

    $content = [];
    foreach ($text_fields as $response_key => $field_name) {
        $value = get_field($field_name, $page->ID);
        $content[$response_key] = substr($response_key, -4) === '_url'
            ? esc_url_raw((string) $value)
            : sanitize_text_field((string) $value);
    }

    $content['books_image'] = $image_url('home_books_image');
    $content['clothing_image'] = $image_url('home_clothing_image');
    $content['accessories_image'] = $image_url('home_accessories_image');
    $content['children_image'] = $image_url('home_children_image');

    return rest_ensure_response($content);
}

function headless_gift_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-accueil', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'gift_settings_page_not_found',
            'La page publiée « Réglages accueil » est introuvable.',
            ['status' => 404]
        );
    }

    $image = get_field('gift_image', $page->ID);
    if (is_array($image)) {
        $image = $image['url'] ?? '';
    } elseif (is_numeric($image)) {
        $image = wp_get_attachment_image_url((int) $image, 'large') ?: '';
    }

    return rest_ensure_response([
        'eyebrow'                => sanitize_text_field((string) get_field('gift_eyebrow', $page->ID)),
        'title'                  => sanitize_text_field((string) get_field('gift_title', $page->ID)),
        'description'            => sanitize_textarea_field((string) get_field('gift_description', $page->ID)),
        'primary_button_text'    => sanitize_text_field((string) get_field('gift_primary_button_text', $page->ID)),
        'secondary_button_text'  => sanitize_text_field((string) get_field('gift_secondary_button_text', $page->ID)),
        'secondary_button_url'   => esc_url_raw((string) get_field('gift_secondary_button_url', $page->ID)),
        'image_alt'              => sanitize_text_field((string) get_field('gift_image_alt', $page->ID)),
        'image'                  => esc_url_raw((string) $image),
    ]);
}

function headless_store_location_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-accueil', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'store_location_settings_not_found',
            'La page publiée « Réglages accueil » est introuvable.',
            ['status' => 404]
        );
    }

    $fields = [
        'eyebrow'              => 'store_eyebrow',
        'title'                => 'store_title',
        'address'              => 'store_address',
        'transport'            => 'store_transport',
        'hours'                => 'store_hours',
        'pickup'               => 'store_pickup',
        'maps_button_text'     => 'store_maps_button_text',
        'pickup_button_text'   => 'store_pickup_button_text',
        'pickup_button_url'    => 'store_pickup_button_url',
        'map_query'            => 'store_map_query',
    ];

    $content = [];
    foreach ($fields as $response_key => $field_name) {
        $value = get_field($field_name, $page->ID);
        $content[$response_key] = $response_key === 'pickup_button_url'
            ? esc_url_raw((string) $value)
            : sanitize_text_field((string) $value);
    }

    return rest_ensure_response($content);
}

function headless_catalogue_hero_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-catalogue', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'catalogue_hero_settings_not_found',
            'La page publiée « Réglages catalogue » est introuvable.',
            ['status' => 404]
        );
    }

    $hero_keys = [
        'livres_coran'      => 'livres-coran',
        'vetements'         => 'vetements',
        'accessoires'       => 'accessoires',
        'coffrets_cadeaux'  => 'coffrets-cadeaux',
    ];
    $image_url = function ($value) {
        if (is_array($value)) {
            $value = $value['url'] ?? '';
        } elseif (is_numeric($value)) {
            $value = wp_get_attachment_image_url((int) $value, 'large') ?: '';
        }
        return esc_url_raw((string) $value);
    };

    $heroes = [];
    foreach ($hero_keys as $field_key => $slug) {
        $heroes[$slug] = [
            'label' => sanitize_text_field((string) get_field('catalogue_hero_' . $field_key . '_label', $page->ID)),
            'title' => sanitize_text_field((string) get_field('catalogue_hero_' . $field_key . '_title', $page->ID)),
            'description' => sanitize_textarea_field((string) get_field('catalogue_hero_' . $field_key . '_description', $page->ID)),
            'image' => $image_url(get_field('catalogue_hero_' . $field_key . '_image', $page->ID)),
        ];
    }

    return rest_ensure_response(['heroes' => $heroes]);
}

function headless_kids_hero_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-enfants', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'kids_hero_settings_not_found',
            'La page publiée « Réglages enfants » est introuvable.',
            ['status' => 404]
        );
    }

    $image = get_field('kids_hero_image', $page->ID);
    if (is_array($image)) {
        $image = $image['url'] ?? '';
    } elseif (is_numeric($image)) {
        $image = wp_get_attachment_image_url((int) $image, 'large') ?: '';
    }

    return rest_ensure_response([
        'title_line_1' => sanitize_text_field((string) get_field('kids_hero_title_line_1', $page->ID)),
        'title_line_2' => sanitize_text_field((string) get_field('kids_hero_title_line_2', $page->ID)),
        'image'        => esc_url_raw((string) $image),
    ]);
}

function headless_contact_info_settings()
{
    if (!function_exists('get_field')) {
        return new WP_Error(
            'acf_not_active',
            'Advanced Custom Fields doit être activé pour afficher ces réglages.',
            ['status' => 503]
        );
    }

    $page = get_page_by_path('reglages-contact', OBJECT, 'page');
    if (!$page || $page->post_status !== 'publish') {
        return new WP_Error(
            'contact_info_settings_not_found',
            'La page publiée « Réglages contact » est introuvable.',
            ['status' => 404]
        );
    }

    $fields = [
        'phone_kicker', 'phone', 'phone_href', 'phone_note',
        'email_kicker', 'email', 'email_note',
        'whatsapp_kicker', 'whatsapp_title', 'whatsapp_description', 'whatsapp_button_text', 'whatsapp_url',
        'faq_kicker', 'faq_title',
        'faq_1_label', 'faq_1_url', 'faq_2_label', 'faq_2_url',
        'faq_3_label', 'faq_3_url', 'faq_4_label', 'faq_4_url',
        'faq_all_text', 'faq_all_url',
    ];
    $url_fields = ['phone_href', 'whatsapp_url', 'faq_1_url', 'faq_2_url', 'faq_4_url', 'faq_all_url'];

    $content = [];
    foreach ($fields as $field) {
        $value = (string) get_field('contact_' . $field, $page->ID);
        $content[$field] = in_array($field, $url_fields, true)
            ? esc_url_raw($value)
            : sanitize_textarea_field($value);
    }
    // Autorise l’ancre interne #boutique pour la FAQ sur la boutique locale.
    $content['faq_3_url'] = sanitize_text_field((string) get_field('contact_faq_3_url', $page->ID));

    return rest_ensure_response($content);
}
