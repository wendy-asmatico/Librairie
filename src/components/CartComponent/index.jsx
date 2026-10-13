import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import CartProduct from "../CartProduct";
import CartSummary from "../CartSummary";
import StickyCheckoutBar from "../StickyCheckoutBar";
import { ArrowLeftIcon } from "../Icons";
import useInView from "../../hooks/useInView";
import {
  cartItemsRestoreRequested,
  selectCartItems,
  selectGiftWrapPrice,
  toRestorableCartItem,
} from "../../slices/cartSlice";
import { showToast } from "../../slices/toastSlice";
import { emptyCartThunk } from "../../thunkActionsCreator/cartThunks";

// Articles du panier et récapitulatif : côte à côte à partir de `lg`,
// empilés en dessous.
export default function CartComponent() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const giftWrapPrice = useSelector(selectGiftWrapPrice);
  const [checkoutLinkRef, isCheckoutLinkInView] = useInView();

  const emptyCart = async () => {
    const restorableItems = items.map(toRestorableCartItem);
    try {
      await dispatch(emptyCartThunk()).unwrap();
      dispatch(
        showToast({
          message: "Votre panier a été vidé.",
          action: {
            label: "Annuler",
            intent: cartItemsRestoreRequested(restorableItems),
          },
        }),
      );
    } catch (message) {
      dispatch(showToast(message));
    }
  };

  return (
    <div className="mt-[clamp(0.5rem,3vw,2rem)] grid items-start gap-y-[clamp(1.75rem,4vw,2.5rem)] lg:grid-cols-[minmax(0,1fr)_21.25rem] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_26.25rem] xl:gap-x-12">
      <div className="min-w-0">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[minmax(0,1fr)_8.75rem_6.875rem_2.75rem] gap-5 border-b border-line pb-3.5 text-xs leading-none font-semibold tracking-widest text-ink-muted uppercase md:grid"
        >
          <span>Article</span>
          <span className="text-center">Quantité</span>
          <span className="text-right">Total</span>
        </div>

        <ul aria-label="Articles du panier">
          {items.map((item) => (
            <CartProduct key={item.key} item={item} giftWrapPrice={giftWrapPrice} />
          ))}
        </ul>

        <div className="mt-[clamp(0.75rem,2vw,1.375rem)] flex flex-wrap items-center justify-between gap-x-3.5 gap-y-2">
          <Link
            to="/catalogue"
            className="flex min-h-11 items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-secondary"
          >
            <ArrowLeftIcon size={15} strokeWidth={2.2} />
            Continuer mes achats
          </Link>
          <button
            type="button"
            onClick={emptyCart}
            className="min-h-11 bg-transparent px-1 text-sm font-medium whitespace-nowrap text-ink-muted underline underline-offset-4 transition-colors hover:text-danger"
          >
            Vider le panier
          </button>
        </div>
      </div>

      <CartSummary checkoutLinkRef={checkoutLinkRef} />
      <StickyCheckoutBar visible={!isCheckoutLinkInView} />
    </div>
  );
}
