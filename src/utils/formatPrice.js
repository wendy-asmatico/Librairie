const formatters = new Map();

const getFormatter = (currency, fractionDigits) => {
  const cacheKey = `${currency}:${fractionDigits}`;
  if (!formatters.has(cacheKey)) {
    formatters.set(
      cacheKey,
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    );
  }
  return formatters.get(cacheKey);
};

/**
 * Formate un montant de la Store API WooCommerce, exprimé en unités mineures :
 * formatPrice("3490", cart.totals) → « 34,90 € ».
 * `currency` accepte tout objet Store API portant `currency_code` et
 * `currency_minor_unit` (totaux, prix d'un article, tarif de livraison...).
 */
export function formatPrice(amount, currency = {}) {
  const { currency_code: code = "EUR", currency_minor_unit: minorUnit = 2 } =
    currency;
  return getFormatter(code, minorUnit).format(Number(amount) / 10 ** minorUnit);
}
