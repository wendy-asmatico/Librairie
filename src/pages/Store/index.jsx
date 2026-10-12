import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Feed from "../../components/Feed";
import CatalogueHero from "../../components/CatalogueHero";
import CatalogueTrust from "../../components/CatalogueTrust";
import CatalogueToolbar from "../../components/CatalogueToolbar";
import CatalogueGift from "../../components/CatalogueGift";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import "./index.css";

export default function Store() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);
  const { list, loading } = useSelector((state) => state.products);
  const listingRef = useRef(null);
  const firstRender = useRef(true);

  const category = categories.find((cat) => String(cat.id) === filters.category);
  const giftCategory = categories.find((cat) => /coffret/i.test(cat.slug || cat.name));
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

  const showAll = () => {
    dispatch(
      setFilters({ category: "", search: "", min_price: "", max_price: "" }),
    );
    scrollToListing();
  };

  const showGifts = () => {
    if (!giftCategory) return;
    dispatch(setFilters({ category: String(giftCategory.id), search: "" }));
    scrollToListing();
  };

  const title = filters.search
    ? `Résultats pour « ${filters.search} »`
    : category
      ? decodeHtml(category.name)
      : "Notre catalogue";

  return (
    <main className="catalogue-page">
      <CatalogueHero category={category} onDiscover={showNewest} onBrowse={showAll} />
      <CatalogueTrust />

      <section className="catalogue-listing" ref={listingRef} aria-labelledby="catalogue-title">
        <header className="catalogue-listing__header">
          <h2 id="catalogue-title" className="catalogue-listing__title">
            {title}
          </h2>
          <p className="catalogue-listing__subtitle">
            {typeof total === "number" && !(loading && list.page === 1)
              ? `${total} article${total > 1 ? "s" : ""} sélectionné${total > 1 ? "s" : ""} avec soin`
              : "Une sélection d’ouvrages et d’articles choisis avec soin"}
          </p>
        </header>

        <CatalogueToolbar />
        <Feed />
      </section>

      <CatalogueGift category={giftCategory} onSelect={showGifts} />
    </main>
  );
}
