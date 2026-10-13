import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Feed from "../../components/Feed";
import CatalogueHero from "../../components/CatalogueHero";
import CatalogueTrust from "../../components/CatalogueTrust";
import CatalogueToolbar from "../../components/CatalogueToolbar";
import CatalogueGift from "../../components/CatalogueGift";
import CatalogueCategories from "../../components/CatalogueCategories";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import { findCategory } from "../../utils/categoryTree";
import { rayonBySlug } from "../../brand";
import "./index.css";

export default function Store() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);
  const { list, loading } = useSelector((state) => state.products);
  const listingRef = useRef(null);
  const firstRender = useRef(true);

  const category = findCategory(categories, filters.category);
  const rayon = !category ? rayonBySlug(filters.category) : null;
  const total = list?.total;

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoriesThunk());
  }, [dispatch, categories.length]);

  // Quand les filtres changent, on remonte au début de la liste
  // (et non tout en haut de la page) pour garder la barre de filtres visible.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = listingRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [filters]);

  const scrollToListing = () =>
    listingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const showNewest = () => {
    dispatch(setFilters({ category: "", orderby: "date", order: "desc" }));
    scrollToListing();
  };

  const showBooks = () => {
    dispatch(setFilters({ category: "livres-coran", search: "" }));
    scrollToListing();
  };

  const showGifts = () => {
    dispatch(setFilters({ category: "coffrets-cadeaux", search: "" }));
    scrollToListing();
  };

  const title = filters.search
    ? `Résultats pour « ${filters.search} »`
    : category
      ? decodeHtml(category.name)
      : rayon
        ? rayon.label
        : "Nos Livres";

  return (
    <main className="catalogue-page">
      <CatalogueHero onDiscover={showNewest} onBrowse={showBooks} />
      <CatalogueTrust />

      <section className="catalogue-listing" ref={listingRef} aria-labelledby="catalogue-title">
        <header className="catalogue-listing__header">
          <div>
            <h2 id="catalogue-title" className="catalogue-listing__title">
              {title}
            </h2>
            <p className="catalogue-listing__subtitle">
              {typeof total === "number" && !(loading && list.page === 1) && (category || rayon || filters.search)
                ? `${total} article${total > 1 ? "s" : ""}`
                : "Une sélection d’ouvrages"}
            </p>
          </div>
          <CatalogueToolbar />
        </header>

        <CatalogueCategories />
        <Feed />
      </section>

      <CatalogueGift onSelect={showGifts} />
    </main>
  );
}
