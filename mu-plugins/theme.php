<?php

add_action('init', function () {
    register_post_type('site_content', [
        'labels' => [
            'name'          => 'Contenus du site',
            'singular_name' => 'Contenu du site',
            'add_new_item'  => 'Ajouter un contenu',
            'edit_item'     => 'Modifier le contenu',
        ],
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'show_in_rest' => false,
        'supports'     => ['title'],
        'menu_icon'    => 'dashicons-layout',
    ]);
});

add_action('admin_init', function () {
    $homepage_content = get_posts([
        'post_type'      => 'site_content',
        'name'           => 'accueil',
        'post_status'    => 'publish',
        'numberposts'    => 1,
        'fields'         => 'ids',
        'suppress_filters' => true,
    ]);

    if (!$homepage_content) {
        wp_insert_post([
            'post_type'   => 'site_content',
            'post_name'   => 'accueil',
            'post_title'  => 'Accueil',
            'post_status' => 'publish',
        ]);
    }
});

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    $fields = [[
        'key'   => 'field_home_trust_tab',
        'label' => 'Engagements',
        'type'  => 'tab',
    ]];

    for ($index = 1; $index <= 4; $index++) {
        $fields[] = [
            'key'   => 'field_home_trust_item_' . $index,
            'label' => 'Engagement ' . $index,
            'name'  => 'home_trust_item_' . $index,
            'type'  => 'text',
        ];
    }

    $fields[] = [
        'key'   => 'field_home_categories_tab',
        'label' => 'Bloc catégories',
        'type'  => 'tab',
    ];
    $fields[] = [
        'key'   => 'field_home_categories_eyebrow',
        'label' => 'Accroche',
        'name'  => 'home_categories_eyebrow',
        'type'  => 'text',
    ];
    $fields[] = [
        'key'   => 'field_home_categories_title',
        'label' => 'Titre',
        'name'  => 'home_categories_title',
        'type'  => 'text',
    ];
    $fields[] = [
        'key'   => 'field_home_categories_description',
        'label' => 'Description',
        'name'  => 'home_categories_description',
        'type'  => 'textarea',
        'rows'  => 3,
    ];
    $fields[] = [
        'key'   => 'field_home_categories_cta_catalogue',
        'label' => 'Bouton catalogue',
        'name'  => 'home_categories_cta_catalogue',
        'type'  => 'text',
    ];
    $fields[] = [
        'key'   => 'field_home_categories_cta_gift',
        'label' => 'Bouton coffret',
        'name'  => 'home_categories_cta_gift',
        'type'  => 'text',
    ];

    foreach (['books' => 'Livres', 'clothing' => 'Vêtements', 'accessories' => 'Accessoires', 'children' => 'Enfants'] as $slug => $label) {
        $fields[] = [
            'key'   => 'field_home_category_' . $slug . '_label',
            'label' => 'Libellé — ' . $label,
            'name'  => 'home_category_' . $slug . '_label',
            'type'  => 'text',
        ];
        $fields[] = [
            'key'           => 'field_home_category_' . $slug . '_image',
            'label'         => 'Image — ' . $label,
            'name'          => 'home_category_' . $slug . '_image',
            'type'          => 'image',
            'return_format' => 'url',
            'preview_size'  => 'medium',
            'library'       => 'all',
        ];
    }

    acf_add_local_field_group([
        'key'      => 'group_site_homepage_content',
        'title'    => 'Accueil — Contenus',
        'fields'   => $fields,
        'location' => [[[
            'param'    => 'post_type',
            'operator' => '==',
            'value'    => 'site_content',
        ]]],
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/homepage-content', [
        'methods'             => 'GET',
        'callback'            => function () {
            $homepage_content = get_posts([
                'post_type'        => 'site_content',
                'name'             => 'accueil',
                'post_status'      => 'publish',
                'numberposts'      => 1,
                'fields'           => 'ids',
                'suppress_filters' => true,
            ]);
            $content_id = $homepage_content ? (int) $homepage_content[0] : 0;

            $trust_items = [];
            $category_copy = [];
            $category_cards = [];

            if ($content_id > 0 && function_exists('get_field')) {
                for ($index = 1; $index <= 4; $index++) {
                    $value = get_field('home_trust_item_' . $index, $content_id);
                    $trust_items[] = is_string($value) ? sanitize_text_field($value) : '';
                }

                foreach (['eyebrow', 'title', 'description', 'cta_catalogue', 'cta_gift'] as $key) {
                    $value = get_field('home_categories_' . $key, $content_id);
                    $category_copy[$key] = is_string($value)
                        ? ($key === 'description' ? sanitize_textarea_field($value) : sanitize_text_field($value))
                        : '';
                }

                foreach (['books', 'clothing', 'accessories', 'children'] as $slug) {
                    $label = get_field('home_category_' . $slug . '_label', $content_id);
                    $image = get_field('home_category_' . $slug . '_image', $content_id);
                    $category_cards[$slug] = [
                        'label' => is_string($label) ? sanitize_text_field($label) : '',
                        'image' => is_string($image) ? esc_url_raw($image) : '',
                    ];
                }
            }

            return rest_ensure_response([
                'trustItems'    => $trust_items,
                'categoryCopy'  => $category_copy,
                'categoryCards' => $category_cards,
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('custom/v1', '/theme-settings', [
        'methods'             => 'GET',
        'callback'            => function () {
            return rest_ensure_response(wp_get_global_settings());
        },
        'permission_callback' => '__return_true',
    ]);
});
