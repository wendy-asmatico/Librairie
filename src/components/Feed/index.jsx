import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../../components/Loader";
import { fetchProductsThunk } from "../../thunkActionsCreator/productsThunks";
import CatalogueCard from "../CatalogueCard";
import icArrow from "../../assets/maktaba/ic-arrow-gold.svg";

const STATE =
  "mx-auto flex max-w-[1184px] flex-col items-center gap-2 rounded-2xl border border-dashed border-sage bg-white px-4 py-14 text-center";

export default function Feed() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);
  const { list, loading, error } = useSelector((state) => state.products);
  const items = list?.data || [];
  const currentPage = list?.page || 1;
  const perPage = list?.perPage || 20;
  // totalPages vient des en-têtes X-WP-TotalPages ; repli sur l'ancienne
  // heuristique si l'API ne les renvoie pas.
  const hasMore = list?.totalPages
    ? currentPage < list.totalPages
    : items.length > 0 && items.length % perPage === 0;
  const loadMoreRef = useRef(null);

  const loadMoreProducts = () => {
    if (hasMore && !loading) {
      dispatch(
        fetchProductsThunk({
          ...filters,
          page: currentPage + 1,
          per_page: perPage,
        }),
      );
    }
  };

  if (!loading && error && items.length === 0) {
    return (
      <div className={STATE} role="alert">
        <p className="font-sans text-sm text-muted">Impossible de charger les produits pour le moment.</p>
        <button
          type="button"
          className="h-11 cursor-pointer rounded-full border border-sage bg-white px-[22px] font-sans text-sm font-semibold text-forest transition-colors hover:bg-mint"
          onClick={() =>
            dispatch(fetchProductsThunk({ ...filters, page: 1, per_page: perPage }))
          }
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className={STATE}>
        <p className="font-serif text-xl font-semibold text-forest-deep">Aucun article ne correspond à votre recherche.</p>
        <p className="font-sans text-sm text-muted">Essayez une autre catégorie ou élargissez la fourchette de prix.</p>
      </div>
    );
  }

  const totalPages = list?.totalPages || (hasMore ? currentPage + 1 : currentPage);

  return (
    <>
      <div className="mx-auto grid max-w-[1184px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 min-[1100px]:grid-cols-4 min-[1100px]:gap-x-6 min-[1100px]:gap-y-7">
        {items.map((product) => (
          <CatalogueCard key={"store " + product.id} product={product} />
        ))}
      </div>
      {loading && <Loader size="lg" />}
      {/* Pagination posée sur le fond clair, sous la section verte (maquette) */}
      <div
        ref={loadMoreRef}
        className="-mx-4 mt-[72px] flex justify-center bg-ivory py-10 lg:-mx-12 lg:mt-[100px] lg:pt-12 lg:pb-14"
      >
        <button
          type="button"
          className="inline-flex h-[25px] cursor-pointer items-center gap-2.5 rounded-[17px] bg-white px-[18px] font-sans text-[15px] leading-4 font-semibold tracking-[0.55px] text-gold uppercase transition-colors hover:bg-cream disabled:cursor-default disabled:hover:bg-white"
          onClick={loadMoreProducts}
          disabled={!hasMore || loading}
          aria-label={hasMore ? "Afficher la page suivante" : "Dernière page"}
        >
          Page {currentPage} / {totalPages}
          {hasMore && <img src={icArrow} alt="" className="block h-3 w-3.5" />}
        </button>
      </div>
    </>
  );
}
