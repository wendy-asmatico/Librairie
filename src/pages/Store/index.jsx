import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Feed from "../../components/Feed";
import CatalogueHero from "../../components/CatalogueHero";
import Trust from "../../components/Trust";
import CatalogueToolbar from "../../components/CatalogueToolbar";
import Gift from "../../components/Gift";
import CatalogueCategories from "../../components/CatalogueCategories";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import { setFilters } from "../../slices/filtersSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import { categoryPath, findCategory } from "../../utils/categoryTree";
import { rayonBySlug } from "../../brand";

export default function Store() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const categories = useSelector((state) => state.categories.items);
  const { list, loading } = useSelector((state) => state.products);
  const listingRef = useRef(null);
  const previousCategory = useRef(filters.category);

  const category = findCategory(categories, filters.category);
  const rayon = !category ? rayonBySlug(filters.category) : null;
  const categorySlug = rayon?.slug || categoryPath(categories, filters.category)[0]?.slug;
  const total = list?.total;

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoriesThunk());
  }, [dispatch, categories.length]);

  // Un changement de rayon affiche sa bannière avant les résultats filtrés.
  useEffect(() => {
    if (previousCategory.current !== filters.category) {
      previousCategory.current = filters.category;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filters.category]);

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
  const title = filters.search
    ? `Résultats pour « ${filters.search} »`
    : category
      ? decodeHtml(category.name)
      : rayon
        ? rayon.label
        : "Nos Livres";

  return (
    <div className="w-full bg-ivory pb-10">
      <CatalogueHero
        categorySlug={categorySlug}
        onDiscover={showNewest}
        onBrowse={showBooks}
        onScrollToListing={scrollToListing}
      />
      <Trust />

      <section
        id="catalogue-listing"
        ref={listingRef}
        aria-labelledby="catalogue-title"
        className="scroll-mt-[180px] overflow-x-clip bg-mint px-4 pt-8 lg:px-12 lg:pt-10"
      >
        <header className="mx-auto flex max-w-[1184px] flex-wrap items-end justify-between gap-4 pb-7">
          <div>
            <h2
              id="catalogue-title"
              className="pt-1.5 font-serif text-[30px] leading-[1.3] font-bold tracking-[-0.4px] text-sage lg:text-[40px] lg:leading-[52px]"
            >
              {title}
            </h2>
            <p className="mt-1 font-sans text-sm leading-[22px] text-ink">
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

      <Gift />
    </div>
  );
}
