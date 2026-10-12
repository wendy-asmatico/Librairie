import "./index.css";

import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../../components/Loader";
import { fetchProductsThunk } from "../../thunkActionsCreator/productsThunks";
import CatalogueCard from "../CatalogueCard";
import icArrow from "../../assets/maktaba/ic-arrow-gold.svg";

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
      <div className="feed-state" role="alert">
        <p>Impossible de charger les produits pour le moment.</p>
        <button
          type="button"
          className="feed-more"
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
      <div className="feed-state">
        <p className="feed-state__title">Aucun article ne correspond à votre recherche.</p>
        <p>Essayez une autre catégorie ou élargissez la fourchette de prix.</p>
      </div>
    );
  }

  const totalPages = list?.totalPages || (hasMore ? currentPage + 1 : currentPage);

  return (
    <>
      <div className="feed-container">
        {items.map((product) => (
          <CatalogueCard key={"store " + product.id} product={product} />
        ))}
      </div>
      {loading && <Loader size="lg" />}
      <div className="feed-footer" ref={loadMoreRef}>
        <button
          type="button"
          className="feed-pagination"
          onClick={loadMoreProducts}
          disabled={!hasMore || loading}
          aria-label={hasMore ? "Afficher la page suivante" : "Dernière page"}
        >
          Page {currentPage} / {totalPages}
          {hasMore && <img src={icArrow} alt="" />}
        </button>
      </div>
    </>
  );
}
