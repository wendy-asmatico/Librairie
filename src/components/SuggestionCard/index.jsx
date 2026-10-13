import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { PlusIcon } from "../Icons";
import { showToast } from "../../slices/toastSlice";
import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";
import { getProductPath, shortenProductName } from "../../utils/product";

const actionClassName =
  "flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-sage px-3.5 text-caption font-semibold text-ink transition-colors hover:bg-sage-hover sm:h-10.5 sm:px-4";

// Carte produit compacte, ajout au panier en un geste. Un produit à options
// (taille, coloris...) renvoie vers sa fiche pour être configuré.
export default function SuggestionCard({ product }) {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const name = decodeHtml(product.name);
  const image = product.images?.[0];
  const category = product.categories?.[0]?.name;
  const productPath = getProductPath(product);
  const { prices } = product;
  const isQuickAddable =
    product.is_purchasable && product.is_in_stock && !product.has_options;

  const addToCart = async () => {
    setIsAdding(true);
    try {
      await dispatch(
        addProductToCart({ productId: product.id, quantity: 1 }),
      ).unwrap();
      dispatch(
        showToast(`«\u00A0${shortenProductName(name)}\u00A0» a été ajouté au panier.`),
      );
    } catch (message) {
      dispatch(showToast(message));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="flex flex-1 flex-col overflow-hidden rounded-card bg-white shadow-card">
      <div className="relative aspect-4/3 overflow-hidden bg-line">
        {image && (
          <img
            src={image.src}
            srcSet={image.srcset || undefined}
            sizes="(min-width: 640px) 300px, 76vw"
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-4.5">
        {category && (
          <p className="text-2xs font-medium tracking-wider text-ink-muted uppercase">
            {decodeHtml(category)}
          </p>
        )}
        <h3 className="flex-1 text-sm leading-snug font-semibold text-pretty text-ink sm:text-md">
          <Link to={productPath} className="transition-colors hover:text-secondary">
            {name}
          </Link>
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2.5">
          <p className="font-serif text-lg leading-none font-semibold whitespace-nowrap text-ink sm:text-xl">
            {prices.price_range && (
              <span className="mr-1 font-sans text-caption font-medium text-ink-muted">
                dès
              </span>
            )}
            {formatPrice(prices.price_range?.min_amount ?? prices.price, prices)}
          </p>
          {isQuickAddable ? (
            <button
              type="button"
              onClick={addToCart}
              disabled={isAdding}
              aria-label={`Ajouter ${name} au panier`}
              className={`${actionClassName} disabled:cursor-wait disabled:opacity-60`}
            >
              <PlusIcon size={14} strokeWidth={2.4} />
              Ajouter
            </button>
          ) : (
            <Link
              to={productPath}
              aria-label={`Choisir les options de ${name}`}
              className={actionClassName}
            >
              Choisir
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
