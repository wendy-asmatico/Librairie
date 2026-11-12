<?php

const HEADLESS_PICKUP_ADDRESS = '14 Boulevard de la Sagesse, 13002 Marseille';

function headless_delivery_rate($destination, $weight_kg, $missing_weight = false, $quote = false)
{
    if (get_woocommerce_currency() !== 'EUR') {
        return new WP_Error('delivery_currency_unavailable', 'Le tarif de livraison est disponible uniquement en euros.', ['status' => 503]);
    }
    $postcode = preg_replace('/\s+/', '', strtoupper((string) ($destination['postcode'] ?? '')));
    if (($destination['country'] ?? '') !== 'FR' || !preg_match('/^\d{5}$/', $postcode)
        || (int) $postcode < 1000 || (int) $postcode > 95999) {
        return new WP_Error('delivery_unavailable', 'La livraison à domicile est disponible uniquement en France métropolitaine.', ['status' => 400]);
    }

    $gross = $quote || $missing_weight ? 5 : ($weight_kg <= 1 ? 3 : ($weight_kg <= 2 ? 5 : 7));
    if (!wc_tax_enabled()) {
        return new WP_Error('delivery_tax_unavailable', 'La TVA à 20 % sur la livraison doit être configurée.', ['status' => 503]);
    }
    $matching_rates = array_filter(WC_Tax::get_rates_for_tax_class(''), function ($rate) {
        return $rate->tax_rate_country === 'FR'
            && (float) $rate->tax_rate === 20.0
            && $rate->tax_rate_shipping === '1';
    });
    if (count($matching_rates) !== 1) {
        return new WP_Error('delivery_tax_unavailable', 'Configurez un seul taux de TVA français à 20 % applicable à la livraison.', ['status' => 503]);
    }
    $rate = reset($matching_rates);
    $net = round($gross / 1.2, wc_get_price_decimals());
    return new WC_Shipping_Rate(
        'headless_home_delivery',
        'Livraison à domicile',
        $net,
        [$rate->tax_rate_id => $gross - $net],
        'flat_rate'
    );
}

add_filter('woocommerce_package_rates', function ($rates, $package) {
    foreach ($rates as $rate) {
        if ($rate->get_method_id() === 'local_pickup') {
            $rate->add_meta_data('pickup_address', HEADLESS_PICKUP_ADDRESS);
        }
    }
    $weight = 0;
    $missing_weight = false;
    foreach ($package['contents'] as $item) {
        if (!$item['data']->needs_shipping()) {
            continue;
        }
        $product_weight = $item['data']->get_weight();
        if ($product_weight === '' || !is_numeric($product_weight) || (float) $product_weight <= 0) {
            $missing_weight = true;
        } else {
            $weight += wc_get_weight((float) $product_weight, 'kg') * $item['quantity'];
        }
    }
    $delivery = headless_delivery_rate($package['destination'], $weight, $missing_weight);
    if (!is_wp_error($delivery)) {
        $rates[$delivery->get_id()] = $delivery;
    }
    return $rates;
}, 20, 2);
