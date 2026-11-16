import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchWishlistThunk } from "../../thunkActionsCreator/wishlistThunks";
import CatalogueCard from "../../components/CatalogueCard";
import Loader from "../../components/Loader";

export default function WishlistSection() {
  const dispatch = useDispatch();
  const isAuthentificated = useSelector((state) => state.user?.token);
  const { items, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthentificated) {
      dispatch(fetchWishlistThunk());
    }
  }, [dispatch, isAuthentificated]);

  return (
    <section className="space-y-6">
      {loading && (
        <div className="flex justify-center py-12">
          <Loader size="md" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-card bg-mint-soft border border-line p-8 text-center">
          <p className="text-caption text-ink-muted italic">
            Vous n'avez aucun favori pour le moment.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((product) => (
            <CatalogueCard key={product.id} product={product} compact />
          ))}
        </div>
      )}
    </section>
  );
}