// Petits utilitaires d'affichage du tableau de bord
export const isPickup = (order) =>
  (order.shipping_lines || []).some((line) =>
    /local_pickup|pickup_location/.test(line.method_id || ""),
  );

export const money = (value, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(value) || 0);

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export const longDate = (date) =>
  date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export const percent = (value) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1).replace(".", ",")} %`;

export const initials = (first = "", last = "") =>
  `${first.trim()[0] || ""}${last.trim()[0] || ""}`.toUpperCase() || "?";

export const customerName = (order) => {
  const { first_name = "", last_name = "" } = order.billing || {};
  if (!first_name && !last_name) return "Client invité";
  return `${first_name} ${last_name ? `${last_name[0]}.` : ""}`.trim();
};

// Évolution en % entre deux périodes (null si pas de base de comparaison)
export const evolution = (current, previous) =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

const AVATAR_BG = ["bg-cream", "bg-leaf", "bg-mint", "bg-line"];
export const avatarBg = (seed = 0) => AVATAR_BG[Math.abs(seed) % AVATAR_BG.length];
