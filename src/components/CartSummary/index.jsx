import { Link } from "react-router-dom";

import CartTotals from "../CartTotals";
import Coupon from "../Coupon";
import ShippingMethods from "../ShippingMethods";
import { LockIcon, ReturnIcon } from "../Icons";

// `checkoutLinkRef` permet au panier de savoir si le bouton de validation est
// visible, pour afficher ou non la barre de commande mobile. En position
// collante, le bloc reste près du haut de l'écran : le header se masque quand
// on fait défiler la page vers le bas.
export default function CartSummary({ checkoutLinkRef }) {
  return (
    <aside
      aria-labelledby="cart-summary-title"
      className="flex min-w-0 flex-col gap-6 rounded-2xl bg-mint px-[clamp(1.125rem,3vw,1.75rem)] py-[clamp(1.375rem,3vw,1.875rem)] lg:sticky lg:top-6"
    >
      <h2
        id="cart-summary-title"
        className="font-serif text-2xl leading-tight font-semibold text-forest"
      >
        Récapitulatif
      </h2>

      <ShippingMethods />
      <Coupon />
      <CartTotals />

      <Link
        ref={checkoutLinkRef}
        to="/commande"
        className="flex h-14.5 items-center justify-center gap-2.5 rounded-control bg-secondary text-md font-bold tracking-wide text-white transition-colors hover:bg-secondary-hover"
      >
        <LockIcon size={17} />
        Valider ma commande
      </Link>

      <ul className="flex flex-col gap-3 border-t border-line-strong pt-4.5 text-caption text-ink-soft">
        <li className="flex items-center gap-2.5">
          <LockIcon size={17} strokeWidth={1.9} className="shrink-0 text-secondary" />
          Paiement 100&nbsp;% sécurisé
        </li>
        <li className="flex items-center gap-2.5">
          <ReturnIcon size={17} strokeWidth={1.9} className="shrink-0 text-secondary" />
          Retours sous 14 jours
        </li>
      </ul>
    </aside>
  );
}
