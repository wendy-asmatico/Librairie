import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { LockIcon } from "../Icons";
import { selectCartSummary } from "../../slices/cartSlice";
import { formatPrice } from "../../utils/formatPrice";
import { pluralize } from "../../utils/pluralize";

// Hauteur dont les toasts se décalent pour rester au-dessus de la barre.
const TOAST_OFFSET = "calc(4rem + env(safe-area-inset-bottom))";

/*
 * Rappel du total et de la validation, fixé en bas d'écran sous `lg` quand le
 * bouton du récapitulatif sort de la vue. Une cale est ajoutée en fin de
 * document pour que la barre ne masque jamais le bas du pied de page.
 */
export default function StickyCheckoutBar({ visible }) {
  const summary = useSelector(selectCartSummary);
  const isShown = visible && summary !== null;

  useEffect(() => {
    if (!isShown) return;
    const root = document.documentElement;
    root.style.setProperty("--toast-offset", TOAST_OFFSET);
    return () => root.style.removeProperty("--toast-offset");
  }, [isShown]);

  return (
    <>
      {createPortal(
        <div
          aria-hidden="true"
          className="h-[calc(4.75rem+env(safe-area-inset-bottom))] lg:hidden"
        />,
        document.body,
      )}
      {isShown && (
        <div className="fixed inset-x-0 bottom-0 z-15 bg-white px-gutter pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-dock motion-safe:animate-rise-in lg:hidden">
          <div className="mx-auto flex max-w-180 items-center gap-4">
            <p className="flex shrink-0 flex-col gap-1">
              <span className="text-xs leading-none font-medium text-ink-muted">
                Total · {pluralize(summary.itemCount, "article")}
              </span>
              <span className="font-serif text-[1.375rem] leading-none font-semibold whitespace-nowrap text-ink">
                {formatPrice(summary.total, summary.currency)}
              </span>
            </p>
            <Link
              to="/commande"
              className="flex h-12.5 min-w-0 flex-1 items-center justify-center gap-2 rounded-control bg-secondary px-3 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-secondary-hover"
            >
              <LockIcon className="shrink-0" />
              Valider ma commande
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
