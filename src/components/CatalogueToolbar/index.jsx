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

export default function CatalogueToolbar() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);
  const [priceOpen, setPriceOpen] = useState(false);
  const priceRef = useRef(null);

  const hasPrice = filters.min_price !== "" || filters.max_price !== "";
  const hasActiveFilters =
    filters.category ||
    filters.search ||
    hasPrice ||
    filters.orderby !== "date" ||
    filters.order !== "desc";

  // Ferme le panneau prix au clic extérieur / Échap
  useEffect(() => {
    if (!priceOpen) return;
    const onClick = (e) => {
      if (priceRef.current && !priceRef.current.contains(e.target)) {
        setPriceOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setPriceOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [priceOpen]);

  const selectCategory = (id) =>
    dispatch(setFilters({ category: id ? String(id) : "" }));

  const handleSort = (e) => {
    const [orderby, order] = e.target.value.split("-");
    dispatch(setFilters({ orderby, order }));
  };

  const reset = () =>
    dispatch(
      setFilters({
        category: "",
        search: "",
        min_price: "",
        max_price: "",
        orderby: "date",
        order: "desc",
      }),
    );

  return (
    <div className="catalogue-toolbar">
      <div
        className="catalogue-toolbar__chips"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        <button
          type="button"
          className={`catalogue-chip${!filters.category ? " is-active" : ""}`}
          aria-pressed={!filters.category}
          onClick={() => selectCategory("")}
        >
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`catalogue-chip${filters.category === String(cat.id) ? " is-active" : ""}`}
            aria-pressed={filters.category === String(cat.id)}
            onClick={() => selectCategory(cat.id)}
          >
            {decodeHtml(cat.name)}
          </button>
        ))}
      </div>

      <div className="catalogue-toolbar__controls">
        <div className="catalogue-toolbar__price" ref={priceRef}>
          <button
            type="button"
            className={`catalogue-control${hasPrice ? " is-active" : ""}`}
            aria-expanded={priceOpen}
            aria-controls="catalogue-price-panel"
            onClick={() => setPriceOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Prix
            {hasPrice && (
              <span className="catalogue-control__value">
                {filters.min_price || 0}–{filters.max_price || 1000} €
              </span>
            )}
          </button>
          {priceOpen && (
            <div id="catalogue-price-panel" className="catalogue-toolbar__panel">
              <PriceRangeSlider onApply={() => {}} />
            </div>
          )}
        </div>

        <label className="catalogue-control catalogue-control--select">
          <span className="catalogue-control__label">Trier :</span>
          <select value={`${filters.orderby}-${filters.order}`} onChange={handleSort}>
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button type="button" className="catalogue-toolbar__reset" onClick={reset}>
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
