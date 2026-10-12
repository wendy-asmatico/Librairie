// Les prix de la Store API WooCommerce sont en unités mineures
// (ex. "3490" pour 34,90 €) avec currency_minor_unit pour la précision.
export function formatPrice(amount, prices = {}) {
  if (amount === undefined || amount === null || amount === "") return null;
  const minorUnit = prices.currency_minor_unit ?? 2;
  const value = Number(amount) / 10 ** minorUnit;
  if (Number.isNaN(value)) return null;

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: prices.currency_code || "EUR",
    }).format(value);
  } catch {
    return `${value.toFixed(minorUnit)} ${prices.currency_symbol || "€"}`;
  }
}
