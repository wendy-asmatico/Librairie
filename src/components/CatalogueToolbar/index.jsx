import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import PriceRangeSlider from "../PriceRangeSlider";
import "./index.css";

const SORTS = [
  { value: "date-desc", label: "Nouveautés" },
  { value: "popularity-desc", label: "Meilleures ventes" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "title-asc", label: "Nom : A à Z" },
];

// « Filtrer » + « Trier » (pastilles de la maquette mobile de Lisa)
export default function CatalogueToolbar() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activeCount =
    (filters.category ? 1 : 0) + (filters.min_price !== "" || filters.max_price !== "" ? 1 : 0);

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
    dispatch(setFilters({ category: "", search: "", min_price: "", max_price: "" }));

  return (
    <div className="catalogue-toolbar">
      <div className="catalogue-toolbar__filter" ref={ref}>
        <button
          type="button"
          className={`catalogue-pill${activeCount ? " is-active" : ""}`}
          aria-expanded={open}
          aria-controls="catalogue-filter-panel"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Filtrer
          {activeCount > 0 && <span className="catalogue-pill__count">{activeCount}</span>}
        </button>

        {open && (
          <div id="catalogue-filter-panel" className="catalogue-toolbar__panel">
            <p className="catalogue-toolbar__label">Rayon</p>
            <div className="catalogue-toolbar__cats">
              <button
                type="button"
                className={`catalogue-chip${!filters.category ? " is-active" : ""}`}
                onClick={() => dispatch(setFilters({ category: "" }))}
              >
                Tout
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`catalogue-chip${filters.category === String(cat.id) ? " is-active" : ""}`}
                  onClick={() => dispatch(setFilters({ category: String(cat.id) }))}
                >
                  {decodeHtml(cat.name)}
                </button>
              ))}
            </div>
            <p className="catalogue-toolbar__label">Prix (€)</p>
            <PriceRangeSlider onApply={() => {}} />
            {activeCount > 0 && (
              <button type="button" className="catalogue-toolbar__reset" onClick={reset}>
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      <label className="catalogue-pill catalogue-pill--select">
        <span>Trier :</span>
        <select value={`${filters.orderby}-${filters.order}`} onChange={handleSort}>
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
