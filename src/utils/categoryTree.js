import { decodeHtml } from "./decodeHtml";
import { RAYONS } from "../brand";

// Catégorie par défaut de WooCommerce, inutile côté boutique
const HIDDEN = ["uncategorized", "non-classe"];
const rank = (cat) => {
  const i = RAYONS.findIndex((r) => r.slug === cat.slug);
  return i === -1 ? RAYONS.length : i;
};

// Outils pour la hiérarchie catégories / sous-catégories WooCommerce
// (champ `parent` de la Store API, 0 = catégorie de premier niveau).
export function childrenOf(categories, parentId) {
  // Ordre de la maquette pour les rayons, puis alphabétique
  return categories
    .filter((cat) => Number(cat.parent || 0) === Number(parentId) && !HIDDEN.includes(cat.slug))
    .sort(
      (a, b) =>
        rank(a) - rank(b) || decodeHtml(a.name).localeCompare(decodeHtml(b.name), "fr"),
    );
}

// Le filtre peut contenir un ID ou un slug de catégorie
export function isSelected(cat, value) {
  return !!value && (String(cat.id) === String(value) || cat.slug === value);
}

export function findCategory(categories, value) {
  return categories.find((cat) => isSelected(cat, value));
}

// Chemin de la racine jusqu'à la catégorie (pour le fil d'Ariane)
export function categoryPath(categories, id) {
  const path = [];
  let current = findCategory(categories, id);
  while (current) {
    path.unshift(current);
    current = Number(current.parent) ? findCategory(categories, current.parent) : null;
  }
  return path;
}
