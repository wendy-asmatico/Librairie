import { useDispatch, useSelector } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import { categoryPath, childrenOf, isSelected } from "../../utils/categoryTree";
import { rayonBySlug } from "../../brand";

// Navigation par catégories et sous-catégories au-dessus de la grille :
// fil d'Ariane de la catégorie courante + ses sous-catégories (ou les
// catégories principales quand aucune n'est sélectionnée).
const CRUMB_BTN =
  "cursor-pointer font-sans text-[13px] leading-[18px] font-medium text-muted hover:text-gold hover:underline";

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

  const chip = (active) =>
    `inline-flex h-[34px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 font-sans text-[13px] font-semibold whitespace-nowrap transition-colors ${
      active ? "border-sage bg-sage text-white" : "border-line bg-white text-ink hover:bg-ivory"
    }`;

  const select = (id) => dispatch(setFilters({ category: id ? String(id) : "" }));

  return (
    <nav className="mx-auto mb-6 flex max-w-[1184px] flex-col gap-3" aria-label="Catégories">
      {rayon && (
        <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          <li className="flex items-center gap-1.5">
            <button type="button" className={CRUMB_BTN} onClick={() => select("")}>
              Tout le catalogue
            </button>
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-[13px] text-muted">›</span>
            <strong aria-current="page" className="font-sans text-[13px] leading-[18px] font-bold text-forest">{rayon.label}</strong>
          </li>
        </ol>
      )}

      {path.length > 0 && (
        <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          <li className="flex items-center gap-1.5">
            <button type="button" className={CRUMB_BTN} onClick={() => select("")}>
              Tout le catalogue
            </button>
          </li>
          {path.map((cat, i) => (
            <li key={cat.id} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-[13px] text-muted">›</span>
              {i === path.length - 1 ? (
                <strong aria-current="page" className="font-sans text-[13px] leading-[18px] font-bold text-forest">{decodeHtml(cat.name)}</strong>
              ) : (
                <button type="button" className={CRUMB_BTN} onClick={() => select(cat.id)}>
                  {decodeHtml(cat.name)}
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {options.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:p-0 [&::-webkit-scrollbar]:hidden">
          {!currentCat && (
            <button type="button" className={chip(true)} onClick={() => select("")}>
              Tout
            </button>
          )}
          {options.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={chip(isSelected(cat, current))}
              aria-pressed={isSelected(cat, current)}
              onClick={() => select(cat.id)}
            >
              {decodeHtml(cat.name)}
              {typeof cat.count === "number" && (
                <span
                  className={`inline-flex h-[18px] min-w-5 items-center justify-center rounded-full px-[5px] text-[11px] font-semibold ${
                    isSelected(cat, current) ? "bg-white/35 text-white" : "bg-mint text-muted"
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
