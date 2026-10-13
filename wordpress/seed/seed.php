<?php
/**
 * Données de démonstration Maktaba El Hikma (WordPress local uniquement).
 * Lancement : ./seed.sh   — relançable : les produits existants sont réutilisés.
 */
if (!defined('ABSPATH')) exit;

require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

mt_srand(42);
add_filter("pre_wp_mail", "__return_false"); // pas d'e-mails pendant le remplissage

function mk_term_id($slug) {
    $t = get_term_by('slug', $slug, 'product_cat');
    return $t ? (int) $t->term_id : 0;
}

function mk_image($file, $title) {
    $existing = get_page_by_title($title, OBJECT, 'attachment');
    if ($existing) return $existing->ID;
    $tmp = wp_tempnam($file);
    copy('/seed/images/' . $file, $tmp);
    $id = media_handle_sideload(['name' => $file, 'tmp_name' => $tmp], 0, $title);
    return is_wp_error($id) ? 0 : $id;
}

// [nom, slug catégorie, prix, stock, image, description courte]
$catalogue = [
    ['Le Coran — traduction en français', 'corans', '34.90', 2, 'le-coran-traduit-en-francais.jpg', 'Édition de référence, reliure rigide dorée.'],
    ['Vivre ensemble selon le Coran', 'tafsir', '18.00', 11, 'vivre-ensemble-selon-le-coran.jpg', 'Famille et éducation à la lumière du Coran.'],
    ['Le Sahîh d\'Al-Bukhârî (arabe-français)', 'hadiths-fiqh', '59.00', 3, 'sahih-al-bukhari.jpg', 'Tome 1, hadiths 1 à 2046.'],
    ['La Voie du Musulman', 'hadiths-fiqh', '22.00', 4, 'la-voie-du-musulman.jpg', 'Minhaj al-Muslim, nouvelle édition revue et corrigée.'],
    ['Les fondements de l\'Islam', 'hadiths-fiqh', '15.00', 14, 'les-fondements-de-l-islam.jpg', 'En questions-réponses.'],
    ['L\'invocation tirée du Coran et de la Sunna', 'invocations-douas', '9.90', 25, 'l-invocation.jpg', 'Arabe, français et phonétique.'],
    ['Aie confiance en Allah', 'invocations-douas', '14.90', 18, 'aie-confiance-en-allah.jpg', 'Il est avec toi.'],
    ['Ne sois pas triste', 'invocations-douas', '19.90', 5, 'ne-sois-pas-triste.jpg', 'Du Dr Aidh El-Qarni.'],
    ['Ce que le monde doit à l\'Islam', 'sira-histoire', '24.90', 12, 'ce-que-le-monde-doit-a-l-islam.jpg', 'La dette cachée envers la civilisation islamique.'],
    ['Sagesses d\'Islam', 'sira-histoire', '12.50', 9, 'sagesses-d-islam.jpg', 'Les plus belles paroles du Coran et du Prophète.'],
    ['L\'Islam — fondements, pratiques, civilisations', 'sira-histoire', '29.00', 6, 'l-islam-fondements-pratiques.jpg', 'Un panorama richement illustré.'],
    ['À la découverte de l\'Islam et des musulmans', 'enfants', '16.90', 7, 'a-la-decouverte-de-l-islam.jpg', 'L\'abécédaire pour les plus jeunes.'],
    ['Qamis Saoudien Blanc Écru', 'vetements-homme', '49.00', 3, 'qamis-saoudien.jpg', 'Coupe saoudienne, tissu léger.'],
    ['Tasbih en pierres naturelles', 'tasbih', '12.00', 20, 'tasbih.jpg', '99 perles, pompon en soie.'],
    ['Coffret Cadeau Noor', 'coffrets-cadeaux', '65.00', 4, 'coffret-cadeau-noor.jpg', 'Coran relié, citadelle du musulman, parfum et tasbih.'],
];

$products = [];
foreach ($catalogue as [$name, $cat, $price, $stock, $img, $short]) {
    $found = get_page_by_title($name, OBJECT, 'product');
    $product = $found ? wc_get_product($found->ID) : new WC_Product_Simple();
    $product->set_name($name);
    $product->set_status('publish');
    $product->set_regular_price($price);
    $product->set_manage_stock(true);
    $product->set_stock_quantity($stock);
    $product->set_short_description($short);
    $product->set_category_ids(array_filter([mk_term_id($cat)]));
    if (!$product->get_image_id()) $product->set_image_id(mk_image($img, $name));
    $product->save();
    $products[] = $product;
    WP_CLI::log("Produit : $name");
}

// Clients
$people = [
    ['Amina', 'Benali'], ['Youssef', 'Karimi'], ['Sarah', 'Lahlou'], ['Ibrahim', 'Diallo'],
    ['Fatima', 'Zahra'], ['Mehdi', 'Rahmani'], ['Nadia', 'Haddad'], ['Karim', 'Toumi'],
    ['Leïla', 'Mansouri'], ['Omar', 'Chérif'], ['Inès', 'Bouaziz'], ['Hamza', 'Saïdi'],
];
$customers = [];
foreach ($people as $i => [$first, $last]) {
    $email = strtolower(remove_accents("$first.$last")) . '@exemple.fr';
    $user = get_user_by('email', $email);
    $id = $user ? $user->ID : wc_create_new_customer($email, '', wp_generate_password());
    if (is_wp_error($id)) continue;
    $registered = gmdate('Y-m-d H:i:s', time() - mt_rand(0, 55) * DAY_IN_SECONDS);
    wp_update_user(['ID' => $id, 'first_name' => $first, 'last_name' => $last, 'user_registered' => $registered]);
    $customers[] = ['id' => $id, 'first' => $first, 'last' => $last, 'email' => $email];
}

// Commandes sur les 60 derniers jours (seulement au premier lancement)
$already = wc_get_orders(['limit' => 1, 'return' => 'ids']);
if (empty($already)) {
    $statuses = ['completed', 'completed', 'completed', 'processing', 'processing', 'on-hold', 'cancelled'];
    for ($n = 0; $n < 140; $n++) {
        $c = $customers[array_rand($customers)];
        $order = wc_create_order(['customer_id' => $c['id']]);
        $lines = mt_rand(1, 3);
        for ($l = 0; $l < $lines; $l++) {
            $order->add_product($products[array_rand($products)], mt_rand(1, 2));
        }
        $address = [
            'first_name' => $c['first'], 'last_name' => $c['last'], 'email' => $c['email'],
            'address_1' => '14 Boulevard de la Sagesse', 'city' => 'Paris', 'postcode' => '75011', 'country' => 'FR',
        ];
        $order->set_address($address, 'billing');
        $order->set_address($address, 'shipping');

        $pickup = mt_rand(1, 100) <= 35;
        $ship = new WC_Order_Item_Shipping();
        $ship->set_method_title($pickup ? 'Retrait en boutique' : 'Colissimo');
        $ship->set_method_id($pickup ? 'local_pickup' : 'flat_rate');
        $ship->set_total($pickup ? '0' : '5.90');
        $order->add_item($ship);
        $order->set_payment_method_title('Carte bancaire');

        $daysAgo = (int) floor(pow(mt_rand(0, 1000) / 1000, 1.3) * 60);
        $date = time() - $daysAgo * DAY_IN_SECONDS - mt_rand(0, 10 * HOUR_IN_SECONDS);
        $order->set_date_created($date);
        $order->calculate_totals();
        $status = $daysAgo <= 3 ? (mt_rand(0, 1) ? 'processing' : 'completed') : $statuses[array_rand($statuses)];
        $order->set_status($status);
        if ($status !== 'cancelled') $order->set_date_paid($date);
        $order->save();
    }
    WP_CLI::log('140 commandes créées.');
} else {
    WP_CLI::log('Des commandes existent déjà : aucune nouvelle commande créée.');
}

// Les commandes payées ont décrémenté les stocks : on remet les quantités de démo
foreach ($catalogue as $i => $row) {
    $products[$i]->set_stock_quantity($row[3]);
    $products[$i]->save();
}

WP_CLI::success('Données de démonstration prêtes.');
