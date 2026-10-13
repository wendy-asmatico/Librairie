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
 * formatPrice("3490", cart.totals) → « 34,90 € ». Renvoie null si le montant
 * est absent ou invalide (un prix barré inexistant, par exemple).
 * `currency` accepte tout objet Store API portant `currency_code` et
 * `currency_minor_unit` (totaux, prix d'un article ou d'un produit...).
 */
export function formatPrice(amount, currency = {}) {
  if (amount === undefined || amount === null || amount === "") return null;
  const { currency_code: code = "EUR", currency_minor_unit: minorUnit = 2 } =
    currency;
  const value = Number(amount) / 10 ** minorUnit;
  if (Number.isNaN(value)) return null;

  try {
    return getFormatter(code, minorUnit).format(value);
  } catch {
    return `${value.toFixed(minorUnit)} ${currency.currency_symbol || "€"}`;
  }
}
