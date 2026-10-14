import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import KidsHero from "../../components/KidsHero";
import KidsFilters from "../../components/KidsFilters";
import CatalogueCard from "../../components/CatalogueCard";
import Gift from "../../components/Gift";
import Loader from "../../components/Loader";
import Seo from "../../components/Seo";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import icArrow from "../../assets/images/ic-arrow-gold.svg";

const KIDS = "enfants";
const PER_PAGE = 8;

// Couleurs de la maquette « Catalogue Enfants » : bouton de filtre et carte produit par rayon
const ACCENTS = {
  "livres-coran": { border: "border-[#74b885]", label: "text-[#74b885]" },
  vetements: { border: "border-[#ebc85a]", label: "text-[#d9a91e]" },
  accessoires: { border: "border-[#d9751d]", label: "text-[#d9751d]" },
  "coffrets-cadeaux": { border: "border-[#ff8383]", label: "text-[#d35454]" },
};
const DEFAULT_ACCENT = ACCENTS["livres-coran"];

const FILTERS = [
  { key: "all", label: "Tout", title: "Tous les articles", pill: "bg-[#efaeff] text-[#a548bd] lg:text-sm lg:uppercase lg:tracking-normal", orderby: "menu_order", order: "asc" },
  { key: "new", label: "Nouveautés", title: "Nouveautés", pill: "bg-[#a2c7ff] text-[#5474a4]", orderby: "date", order: "desc" },
  { key: "livres-coran", label: "Livres", title: "Livres", pill: "bg-[#a6ff8b] text-[#599c45]" },
  { key: "vetements", label: "Vêtements", title: "Vêtements", pill: "bg-[#fffb7e] text-[#8f8c25]" },
  { key: "accessoires", label: "Accessoires", title: "Accessoires", pill: "bg-[#ffc64a] text-[#866215]" },
  { key: "coffrets-cadeaux", label: "Coffrets cadeaux", title: "Coffrets cadeaux", pill: "bg-[#ff8383] text-[#8e2828]" },
];

// Paramètres Store API : rayon Enfants, croisé (ET) avec le rayon choisi
const queryFor = (filter, page) => ({
  category: filter.orderby ? KIDS : `${KIDS},${filter.key}`,
  ...(filter.orderby ? {} : { category_operator: "and" }),
  orderby: filter.orderby || "date",
  order: filter.order || "desc",
  page,
  per_page: PER_PAGE,
});

// Produits du rayon Enfants, chargés ici (et non dans le store) pour ne pas
// écraser la liste du catalogue
async function fetchKidsProducts(query, signal) {
  const params = new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)]),
  );
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/products?${params}`,
    { signal },
  );
  if (!response.ok) throw new Error("Impossible de récupérer les produits.");
  return {
    data: await response.json(),
    totalPages: parseInt(response.headers.get("X-WP-TotalPages"), 10) || 1,
  };
}

// Page Enfants — maquettes de Lisa « Catalogue Enfants » (135:2) et « Enfants — mobile » (243:2)
export default function Kids() {
  const dispatch = useDispatch();
  const [active, setActive] = useState("all");
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const categories = useSelector((state) => state.categories.items);
  const listingRef = useRef(null);

  const filter = FILTERS.find((f) => f.key === active);
  const hasMore = currentPage < totalPages;

  const load = (page, signal) => {
    setLoading(true);
    setError(false);
    return fetchKidsProducts(queryFor(filter, page), signal)
      .then(({ data, totalPages: pages }) => {
        setItems((prev) => (page === 1 ? data : [...prev, ...data]));
        setCurrentPage(page);
        setTotalPages(pages);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoriesThunk());
  }, [dispatch, categories.length]);

  useEffect(() => {
    const controller = new AbortController();
    setItems([]);
    load(1, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Rayon racine d'un produit (hors « Enfants ») pour choisir ses couleurs
  const accentOf = (product) => {
    for (const cat of product.categories || []) {
      let node = categories.find((c) => c.id === cat.id || c.slug === cat.slug);
      while (node?.parent) node = categories.find((c) => c.id === node.parent);
      const slug = node?.slug || cat.slug;
      if (slug !== KIDS && ACCENTS[slug]) return ACCENTS[slug];
    }
    return DEFAULT_ACCENT;
  };

  const select = (key) => {
    setActive(key);
    if (listingRef.current?.getBoundingClientRect().top < 0) {
      listingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) load(currentPage + 1);
  };

  return (
    <div className="w-full bg-white">
      <Seo title="Enfants" />
      <KidsHero />

      <div className="relative z-[1] bg-white pt-[11px] pb-4 lg:-mt-[35px] lg:bg-transparent lg:pt-0 lg:pb-0">
        <KidsFilters items={FILTERS} active={active} onSelect={select} />
      </div>
      <div className="hidden h-[32px] bg-mint lg:-mt-[18px] lg:block" aria-hidden="true" />

      <section
        ref={listingRef}
        aria-labelledby="kids-title"
        className="scroll-mt-[180px] bg-[radial-gradient(ellipse_at_50%_47%,#fff_0%,#fff6c5_100%)] px-4 pt-5 pb-10 lg:px-12 lg:pt-10 lg:pb-14"
      >
        <header className="mx-auto max-w-[1184px] pb-5 lg:pb-7">
          <h2
            id="kids-title"
            className="pt-1.5 font-['Roboto',sans-serif] text-[28px] leading-9 font-bold tracking-[-0.4px] text-gold lg:text-[40px] lg:leading-[52px]"
          >
            {filter.title}
          </h2>
          <p className="mt-1 font-sans text-sm leading-[22px] text-[#444841]">
            Les indispensables adoptés par nos petits lecteurs et visiteurs.
          </p>
        </header>

        {!loading && items.length === 0 ? (
          <div className="mx-auto flex max-w-[1184px] flex-col items-center gap-2 rounded-2xl border border-dashed border-[#ebc85a] bg-white px-4 py-14 text-center">
            <p className="font-serif text-xl font-semibold text-forest-deep">
              {error ? "Impossible de charger les articles pour le moment." : "Aucun article dans cette sélection pour l’instant."}
            </p>
            <p className="font-sans text-sm text-muted">Essayez une autre catégorie.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-[1184px] grid-cols-2 gap-x-3 gap-y-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-[52px]">
            {items.map((product) => (
              <CatalogueCard key={"kids " + product.id} product={product} accent={accentOf(product)} kids />
            ))}
          </div>
        )}
        {loading && <Loader size="lg" />}

        {items.length > 0 && (
          <div className="mt-10 flex justify-center lg:mt-[68px]">
            <button
              type="button"
              className="inline-flex h-[25px] cursor-pointer items-center gap-2.5 rounded-[17px] bg-white px-[18px] font-sans text-[15px] leading-4 font-semibold tracking-[0.55px] text-gold uppercase transition-colors hover:bg-cream disabled:cursor-default disabled:hover:bg-white"
              onClick={loadMore}
              disabled={!hasMore || loading}
              aria-label={hasMore ? "Afficher la page suivante" : "Dernière page"}
            >
              Page {currentPage} / {totalPages}
              {hasMore && <img src={icArrow} alt="" className="block h-3 w-3.5" />}
            </button>
          </div>
        )}
      </section>

      <Gift />
    </div>
  );
}
