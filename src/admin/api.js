// Accès à l'API WooCommerce d'administration (wc/v3) avec le jeton JWT
// de l'utilisateur connecté (plugin « JWT Authentication for WP-API »).
const API = `${import.meta.env.VITE_API_URL}/wp-json`;

export async function wcFetch(path, token, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ).toString();
  const response = await fetch(`${API}/wc/v3${path}${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status} sur ${path}`);
  }
  return {
    data,
    total: Number(response.headers.get("X-WP-Total")) || 0,
    totalPages: Number(response.headers.get("X-WP-TotalPages")) || 1,
  };
}

// Récupère toutes les pages d'une liste (plafonné pour rester raisonnable)
export async function wcFetchAll(path, token, params = {}, maxPages = 5) {
  const first = await wcFetch(path, token, { ...params, per_page: 100, page: 1 });
  let items = first.data || [];
  for (let page = 2; page <= Math.min(first.totalPages, maxPages); page++) {
    const next = await wcFetch(path, token, { ...params, per_page: 100, page });
    items = items.concat(next.data || []);
  }
  return { items, total: first.total };
}

// URL de l'administration WordPress (pages non encore refaites côté front)
export const WP_ADMIN_URL =
  import.meta.env.VITE_WP_ADMIN_URL || `${import.meta.env.VITE_API_URL}/wp-admin`;
