export const DELIVERY_MODES = [
  { id: "delivery", label: "Livraison à domicile" },
  { id: "pickup", label: "Retrait gratuit en boutique" },
  { id: "relay_mondial", label: "Point relais Mondial Relay" },
];

export function rateMatchesDeliveryMode(rate, mode) {
  if (mode === "pickup") return rate.method_id === "local_pickup";
  if (mode === "delivery") return rate.rate_id === "headless_home_delivery";
  return mode === "relay_mondial" && rate.rate_id === "headless_relay_mondial";
}

export function selectedDeliveryMode(packages) {
  if (!packages.length) return null;
  return DELIVERY_MODES.find(({ id }) =>
    packages.every((pkg) => pkg.shipping_rates.some((rate) => rate.selected && rateMatchesDeliveryMode(rate, id))),
  )?.id || null;
}
