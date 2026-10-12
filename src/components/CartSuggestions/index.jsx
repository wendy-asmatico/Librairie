import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import SuggestionCard from "../SuggestionCard";
import { selectCartItems } from "../../slices/cartSlice";
import { fetchSpotlightProductsThunk } from "../../thunkActionsCreator/spotlightThunks";

const SUGGESTION_COUNT = 4;

/*
 * « Complétez votre commande » : les ventes croisées que WooCommerce associe
 * aux articles du panier, à défaut les produits mis en avant. Grille dès `sm`,
 * carrousel à défilement horizontal en dessous.
 */
export default function CartSuggestions() {
  const dispatch = useDispatch();
  const crossSells = useSelector((state) => state.cart.cross_sells);
  const featuredProducts = useSelector((state) => state.spotlight.list.data);
  const cartItems = useSelector(selectCartItems);

  const shouldUseFeatured = crossSells.length === 0;

  useEffect(() => {
    if (shouldUseFeatured && featuredProducts.length === 0) {
      dispatch(fetchSpotlightProductsThunk());
    }
  }, [shouldUseFeatured, featuredProducts.length, dispatch]);

  const suggestions = useMemo(() => {
    const productIdsInCart = new Set(cartItems.map((item) => item.id));
    return (shouldUseFeatured ? featuredProducts : crossSells)
      .filter((product) => !productIdsInCart.has(product.id))
      .slice(0, SUGGESTION_COUNT);
  }, [shouldUseFeatured, featuredProducts, crossSells, cartItems]);

  if (suggestions.length === 0) return null;

  return (
    <section
      aria-labelledby="cart-suggestions-title"
      className="overflow-hidden bg-mint-soft"
    >
      <div className="mx-auto max-w-7xl px-gutter pt-[clamp(2.75rem,6vw,4rem)] pb-[clamp(3.25rem,7vw,4.75rem)]">
        <div className="mb-[clamp(1.25rem,3vw,1.875rem)] flex flex-col gap-2.5">
          <h2
            id="cart-suggestions-title"
            className="font-serif text-title font-semibold text-forest"
          >
            Complétez votre commande
          </h2>
          <p className="text-sm text-ink-soft">
            Quelques idées pour accompagner vos articles.
          </p>
        </div>
        <ul className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-3.5 overflow-x-auto overscroll-x-contain px-gutter pt-1 pb-3.5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(min(100%,15.625rem),1fr))] sm:gap-6 sm:overflow-visible sm:p-0">
          {suggestions.map((product) => (
            <li
              key={product.id}
              className="flex w-[min(76%,17.5rem)] shrink-0 snap-start sm:w-auto"
            >
              <SuggestionCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
