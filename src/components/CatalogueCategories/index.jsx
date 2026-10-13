import { useDispatch, useSelector } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import { categoryPath, childrenOf, isSelected } from "../../utils/categoryTree";
import { rayonBySlug } from "../../brand";
import "./index.css";

// Navigation par catégories et sous-catégories au-dessus de la grille :
// fil d'Ariane de la catégorie courante + ses sous-catégories (ou les
// catégories principales quand aucune n'est sélectionnée).
export default function CatalogueCategories() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);
  const current = useSelector((state) => state.filters.category);

  if (categories.length === 0) return null;

  const path = current ? categoryPath(categories, current) : [];
  const rayon = current && path.length === 0 ? rayonBySlug(current) : null;
  const currentCat = path[path.length - 1];
  let options = currentCat ? childrenOf(categories, currentCat.id) : childrenOf(categories, 0);
  // Feuille : on propose les catégories sœurs
  if (currentCat && options.length === 0) {
    options = childrenOf(categories, currentCat.parent || 0);
  }

  const select = (id) => dispatch(setFilters({ category: id ? String(id) : "" }));

  return (
    <nav className="catalogue-cats" aria-label="Catégories">
      {rayon && (
        <ol className="catalogue-cats__crumbs">
          <li>
            <button type="button" onClick={() => select("")}>
              Tout le catalogue
            </button>
          </li>
          <li>
            <span aria-hidden="true">›</span>
            <strong aria-current="page">{rayon.label}</strong>
          </li>
        </ol>
      )}

      {path.length > 0 && (
        <ol className="catalogue-cats__crumbs">
          <li>
            <button type="button" onClick={() => select("")}>
              Tout le catalogue
            </button>
          </li>
          {path.map((cat, i) => (
            <li key={cat.id}>
              <span aria-hidden="true">›</span>
              {i === path.length - 1 ? (
                <strong aria-current="page">{decodeHtml(cat.name)}</strong>
              ) : (
                <button type="button" onClick={() => select(cat.id)}>
                  {decodeHtml(cat.name)}
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {options.length > 0 && (
        <div className="catalogue-cats__chips">
          {!currentCat && (
            <button type="button" className="catalogue-cats__chip is-active" onClick={() => select("")}>
              Tout
            </button>
          )}
          {options.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`catalogue-cats__chip${isSelected(cat, current) ? " is-active" : ""}`}
              aria-pressed={isSelected(cat, current)}
              onClick={() => select(cat.id)}
            >
              {decodeHtml(cat.name)}
              {typeof cat.count === "number" && (
                <span className="catalogue-cats__count">{cat.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
