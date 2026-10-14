/**
 * Chemin de la fiche produit, à partir d'un produit (`slug`) ou d'un article de
 * panier Store API, qui ne porte que son `permalink`.
 */
export function getProductPath({ slug, permalink }) {
  const resolvedSlug =
    slug ?? new URL(permalink).pathname.split("/").filter(Boolean).at(-1);
  return `/product/${resolvedSlug}`;
}

// Nom court pour les messages : « Le Noble Coran (Arabe / Français) – Cuir »
// devient « Le Noble Coran ».
export function shortenProductName(name) {
  return name.split(/\s+[(–—]/)[0].trim();
}
