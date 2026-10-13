import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import QuantityStepper from "../QuantityStepper";
import { TrashIcon } from "../Icons";
import useDebouncedCallback from "../../hooks/useDebouncedCallback";
import {
  cartItemsRestoreRequested,
  toRestorableCartItem,
} from "../../slices/cartSlice";
import { showToast } from "../../slices/toastSlice";
import {
  CART_EXTENSION_NAMESPACE,
  deleteProductFromCart,
  toggleGiftWrapThunk,
  updateCartItemQuantityThunk,
} from "../../thunkActionsCreator/cartThunks";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";
import { getProductPath, shortenProductName } from "../../utils/product";

// Les clics successifs sur +/− sont regroupés en une seule requête.
const QUANTITY_COMMIT_DELAY = 400;

function StockStatus({ item }) {
  if (item.show_backorder_badge) {
    return <span className="text-secondary">Sur commande</span>;
  }
  if (item.low_stock_remaining) {
    return (
      <span className="text-secondary">
        Plus que {item.low_stock_remaining} en stock
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-success">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      En stock
    </span>
  );
}

/*
 * Ligne d'article. Une seule structure, deux mises en page :
 * - mobile : vignette à gauche ; catégorie et corbeille, descriptif, puis
 *   quantité et total côte à côte, enfin l'emballage cadeau ;
 * - à partir de `md` : colonnes Article / Quantité / Total / Retirer, alignées
 *   sur l'en-tête de la liste (le bloc quantité-total passe en `contents`).
 */
export default function CartProduct({ item, giftWrapPrice }) {
  const dispatch = useDispatch();
  const [draftQuantity, setDraftQuantity] = useState(null);

  const name = decodeHtml(item.name);
  const quantity = draftQuantity ?? item.quantity;
  const image = item.images?.[0];
  const productPath = item.permalink ? getProductPath(item) : null;
  const limits = item.quantity_limits;
  const extension = item.extensions?.[CART_EXTENSION_NAMESPACE];
  const variationLabel = item.variation
    ?.map(
      ({ attribute, value }) =>
        `${decodeHtml(attribute)}\u00A0: ${decodeHtml(value)}`,
    )
    .join(" · ");

  const reportFailure = (message) => dispatch(showToast(message));

  const commitQuantity = useDebouncedCallback((nextQuantity) => {
    if (nextQuantity !== item.quantity) {
      dispatch(
        updateCartItemQuantityThunk({
          itemKey: item.key,
          quantity: nextQuantity,
        }),
      )
        .unwrap()
        .catch(reportFailure);
    }
    setDraftQuantity(null);
  }, QUANTITY_COMMIT_DELAY);

  const changeQuantity = (nextQuantity) => {
    setDraftQuantity(nextQuantity);
    commitQuantity(nextQuantity);
  };

  const removeItem = async () => {
    commitQuantity.cancel();
    const restorableItem = toRestorableCartItem({ ...item, quantity });
    try {
      await dispatch(deleteProductFromCart({ itemKey: item.key })).unwrap();
      dispatch(
        showToast({
          message: `«\u00A0${shortenProductName(name)}\u00A0» a été retiré du panier.`,
          action: {
            label: "Annuler",
            intent: cartItemsRestoreRequested([restorableItem]),
          },
        }),
      );
    } catch (message) {
      reportFailure(message);
    }
  };

  const toggleGiftWrap = (event) => {
    dispatch(
      toggleGiftWrapThunk({
        itemKey: item.key,
        giftWrap: event.target.checked,
      }),
    )
      .unwrap()
      .catch(reportFailure);
  };

  const Media = productPath ? Link : "div";
  // Placement en propriétés longues (start/end) : un raccourci `*-span-*`
  // responsive réinitialiserait le point de départ posé pour le mobile.
  const desktopColumnClassName = "md:row-start-1 md:row-end-4 md:self-center";

  return (
    <li
      aria-busy={item._optimistic || undefined}
      className={`grid grid-cols-[clamp(5.25rem,24vw,6.5rem)_minmax(0,1fr)_auto] grid-rows-[auto_auto_auto_1fr] content-start gap-x-3.5 gap-y-1.5 border-b border-line pt-4.5 pb-2.5 md:grid-cols-[6.5rem_minmax(0,1fr)_8.75rem_6.875rem_2.75rem] md:grid-rows-[auto_auto_1fr] md:gap-x-5 md:gap-y-2 md:py-6 ${
        item._optimistic ? "opacity-60" : ""
      }`}
    >
      <Media
        {...(productPath && { to: productPath, tabIndex: -1 })}
        aria-hidden="true"
        className="col-start-1 row-start-1 row-end-5 aspect-5/6 self-start overflow-hidden rounded-xl bg-mint-soft md:row-end-4"
      >
        {image && (
          <img
            src={image.thumbnail || image.src}
            srcSet={image.srcset || undefined}
            sizes="104px"
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        )}
      </Media>

      {extension?.category && (
        <p className="col-start-2 row-start-1 self-center text-2xs font-semibold tracking-widest text-secondary uppercase">
          {decodeHtml(extension.category)}
        </p>
      )}

      <button
        type="button"
        aria-label={`Retirer ${name} du panier`}
        onClick={removeItem}
        disabled={item._optimistic}
        className={`col-start-3 row-start-1 -my-3 -mr-3 flex size-11 items-center justify-center self-center rounded-full bg-transparent text-ink-muted transition-colors enabled:hover:bg-mint enabled:hover:text-danger disabled:cursor-not-allowed md:col-start-5 md:m-0 ${desktopColumnClassName}`}
      >
        <TrashIcon size={18} strokeWidth={1.9} />
      </button>

      <div className="col-start-2 col-end-4 row-start-2 flex min-w-0 flex-col gap-1.5 md:col-end-3">
        {productPath ? (
          <Link
            to={productPath}
            className="text-md leading-snug font-semibold text-pretty text-ink transition-colors hover:text-secondary md:text-base"
          >
            {name}
          </Link>
        ) : (
          <span className="text-md leading-snug font-semibold text-ink md:text-base">
            {name}
          </span>
        )}
        {variationLabel && (
          <p className="text-caption text-ink-muted">{variationLabel}</p>
        )}
        <p className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-caption text-ink-soft">
          {item.prices && (
            <span className="font-semibold">
              <span className="sr-only">Prix unitaire : </span>
              {formatPrice(item.prices.price, item.prices)}
            </span>
          )}
          <StockStatus item={item} />
        </p>
      </div>

      <div className="col-start-2 col-end-4 row-start-3 mt-1.5 flex items-center justify-between gap-3 md:contents">
        {limits?.editable === false ? (
          <p
            className={`text-caption text-ink-soft md:col-start-3 md:justify-self-center ${desktopColumnClassName}`}
          >
            Quantité&nbsp;: {quantity}
          </p>
        ) : (
          <QuantityStepper
            value={quantity}
            min={limits?.minimum ?? 1}
            max={limits?.maximum ?? Infinity}
            step={limits?.multiple_of ?? 1}
            onChange={changeQuantity}
            label={`Quantité pour ${name}`}
            disabled={item._optimistic}
            className={`md:col-start-3 md:justify-self-center ${desktopColumnClassName}`}
          />
        )}
        <p
          className={`font-serif text-lg font-semibold whitespace-nowrap text-ink md:col-start-4 md:text-right ${desktopColumnClassName}`}
        >
          <span className="sr-only">Total : </span>
          {item.prices
            ? formatPrice(Number(item.prices.price) * quantity, item.prices)
            : "—"}
        </p>
      </div>

      {extension && giftWrapPrice !== null && (
        <label className="col-start-2 col-end-4 row-start-4 flex min-h-11 w-max cursor-pointer items-center gap-2.5 self-start text-caption font-medium text-ink md:col-end-3 md:row-start-3 md:mt-1 md:min-h-0">
          <input
            type="checkbox"
            checked={extension.gift_wrap}
            onChange={toggleGiftWrap}
            className="size-5 shrink-0 cursor-pointer accent-secondary md:size-4.5"
          />
          Emballage cadeau
          <span className="text-secondary">
            +{formatPrice(giftWrapPrice, item.prices)}
          </span>
        </label>
      )}
    </li>
  );
}
