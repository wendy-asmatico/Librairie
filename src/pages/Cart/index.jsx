import { useSelector } from "react-redux";

import Breadcrumb from "../../components/Breadcrumb";
import CartComponent from "../../components/CartComponent";
import CartSuggestions from "../../components/CartSuggestions";
import CheckoutSteps from "../../components/CheckoutSteps";
import EmptyCart from "../../components/EmptyCart";
import GiftBoxPromo from "../../components/GiftBoxPromo";
import Seo from "../../components/Seo";
import { selectCartItemCount } from "../../slices/cartSlice";
import { pluralize } from "../../utils/pluralize";

const BREADCRUMB = [{ label: "Accueil", to: "/" }, { label: "Mon panier" }];

export default function Cart() {
  const itemCount = useSelector(selectCartItemCount);
  const hasItems = useSelector((state) => state.cart.items.length > 0);

  return (
    <div className="bg-white text-ink">
      <Seo title="Mon panier" noIndex />

      <div className="mx-auto max-w-7xl px-gutter pt-[clamp(1rem,2vw,1.375rem)]">
        <Breadcrumb items={BREADCRUMB} />
      </div>

      <section
        aria-labelledby="cart-title"
        className="mx-auto max-w-7xl px-gutter pt-[clamp(1.125rem,3vw,1.625rem)] pb-[clamp(3rem,7vw,5rem)]"
      >
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-line pb-[clamp(1.25rem,3vw,1.75rem)]">
          <div className="flex flex-col gap-2.5">
            <p className="text-xs leading-none font-semibold tracking-widest text-secondary uppercase">
              Votre commande
            </p>
            <h1
              id="cart-title"
              className="font-serif text-display font-semibold text-forest"
            >
              Mon panier{" "}
              <span className="font-sans text-[clamp(0.9375rem,2.5vw,1.125rem)] font-medium text-ink-muted">
                ({pluralize(itemCount, "article")})
              </span>
            </h1>
          </div>
          <CheckoutSteps current={0} />
        </header>

        {hasItems ? (
          <>
            <CartComponent />
            <GiftBoxPromo />
          </>
        ) : (
          <EmptyCart />
        )}
      </section>

      <CartSuggestions />
    </div>
  );
}
