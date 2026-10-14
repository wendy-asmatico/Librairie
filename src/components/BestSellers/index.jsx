import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CatalogueCard from "../CatalogueCard";
import { fetchBestSellersThunk } from "../../thunkActionsCreator/productsThunks";

export default function BestSellers() {
  const dispatch = useDispatch();
  const { bestSellers, loadingBestSellers } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchBestSellersThunk());
  }, [dispatch]);

  return (
    <section
      aria-labelledby="best-sellers-title"
      className="bg-primary px-4 py-12 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#775A19]">
              Les incontournables
            </p>
            <h2
              id="best-sellers-title"
              className="font-serif text-3xl font-bold text-[#2D3F28] sm:text-4xl"
            >
              Nos meilleures ventes
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
              Découvrez les articles préférés de nos clients.
            </p>
          </div>
          <Link
            to="/catalogue"
            className="rounded-xl border border-[#775A19]/30 px-5 py-3 text-sm font-semibold text-[#624c14] transition-colors hover:bg-white"
          >
            Tout le catalogue <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loadingBestSellers && bestSellers.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-600" role="status">
            Chargement de nos meilleures ventes…
          </p>
        ) : bestSellers.length > 0 ? (
          <div className="mx-auto grid w-full max-w-[1184px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 min-[1100px]:grid-cols-4 min-[1100px]:gap-x-6 min-[1100px]:gap-y-7">
            {bestSellers.map((product) => (
              <CatalogueCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-gray-600">
            Nos produits seront bientôt disponibles.
          </p>
        )}
      </div>
    </section>
  );
}