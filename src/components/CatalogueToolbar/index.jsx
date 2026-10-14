import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import { childrenOf, isSelected } from "../../utils/categoryTree";
import PriceRangeSlider from "../PriceRangeSlider";

const SORTS = [
  { value: "date-desc", label: "Nouveautés" },
  { value: "popularity-desc", label: "Meilleures ventes" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "title-asc", label: "Nom : A à Z" },
];

const PILL =
  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-white px-[13px] font-sans text-xs font-semibold whitespace-nowrap text-ink transition-colors hover:bg-mint";
const CHIP =
  "cursor-pointer rounded-full border px-3 font-sans font-semibold whitespace-nowrap transition-colors";
const chipClass = (active, small = false) =>
  `${CHIP} ${small ? "h-7 text-[11px]" : "h-8 text-xs"} ${
    active ? "border-sage bg-sage text-white" : "border-line bg-white text-ink hover:bg-mint"
  }`;
const LABEL =
  "mb-2 font-sans text-[11px] font-semibold tracking-[0.55px] text-muted uppercase [&:not(:first-child)]:mt-4";

// « Filtrer » + « Trier » (pastilles de la maquette mobile de Lisa)
export default function CatalogueToolbar() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.min_price !== "" || filters.max_price !== "" ? 1 : 0) +
    (filters.stock_status ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSort = (e) => {
    const [orderby, order] = e.target.value.split("-");
    dispatch(setFilters({ orderby, order }));
  };

  const reset = () =>
    dispatch(
      setFilters({ category: "", search: "", min_price: "", max_price: "", stock_status: "" }),
    );

  const chip = (cat, isChild = false) => (
    <button
      key={cat.id}
      type="button"
      className={chipClass(isSelected(cat, filters.category), isChild)}
      aria-pressed={isSelected(cat, filters.category)}
      onClick={() => dispatch(setFilters({ category: String(cat.id) }))}
    >
      {decodeHtml(cat.name)}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={ref}>
        <button
          type="button"
          className={`${PILL} ${activeCount ? "border-sage" : "border-line"}`}
          aria-expanded={open}
          aria-controls="catalogue-filter-panel"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-none stroke-current stroke-[1.8]">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Filtrer
          {activeCount > 0 && <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
              {activeCount}
            </span>}
        </button>

        {open && (
          <div id="catalogue-filter-panel" className="absolute top-[calc(100%+8px)] left-0 z-20 w-[min(360px,calc(100vw-32px))] rounded-xl border border-line bg-white p-4 shadow-[0_16px_32px_-16px_rgba(45,63,40,0.35)] md:right-0 md:left-auto [&_input[type=number]]:w-[72px] [&_input[type=number]]:rounded-md [&_input[type=number]]:border [&_input[type=number]]:border-line [&_input[type=number]]:px-2 [&_input[type=number]]:py-1.5 [&_input[type=number]]:text-[13px]">
            <p className={LABEL}>Catégories</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className={chipClass(!filters.category)}
                aria-pressed={!filters.category}
                onClick={() => dispatch(setFilters({ category: "" }))}
              >
                Tout
              </button>
            </div>
            <ul className="mt-2 flex max-h-[220px] list-none flex-col gap-2 overflow-y-auto">
              {childrenOf(categories, 0).map((parent) => {
                const subs = childrenOf(categories, parent.id);
                return (
                  <li key={parent.id}>
                    {chip(parent)}
                    {subs.length > 0 && (
                      <div className="mt-1.5 ml-3.5 flex flex-wrap gap-1.5 border-l-2 border-mint pl-2.5">{subs.map((sub) => chip(sub, true))}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className={LABEL}>Disponibilité</p>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="size-[18px] cursor-pointer accent-gold"
                checked={filters.stock_status === "instock"}
                onChange={(e) =>
                  dispatch(setFilters({ stock_status: e.target.checked ? "instock" : "" }))
                }
              />
              <span className="font-sans text-sm font-medium text-ink">En stock uniquement</span>
            </label>

            <p className={LABEL}>Prix (€)</p>
            <PriceRangeSlider onApply={() => {}} />
            {activeCount > 0 && (
              <button type="button" className="mt-4 w-full cursor-pointer rounded-lg bg-[#f5f4ee] p-2.5 font-sans text-[13px] font-semibold text-gold transition-colors hover:bg-cream" onClick={reset}>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <label className={`${PILL} border-line`}>
        <span>Trier :</span>
        <select
          value={`${filters.orderby}-${filters.order}`}
          onChange={handleSort}
          className="cursor-pointer bg-transparent font-sans text-xs font-semibold text-ink outline-none"
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
