import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import WishlistButton from "../WishlistButton";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";
import icHeart from "../../assets/maktaba/ic-heart-card.svg";
import icHeartActive from "../../assets/maktaba/ic-heart-card-active.svg";
import icStar from "../../assets/maktaba/ic-star-green.svg";
import icBag from "../../assets/maktaba/ic-bag-small.svg";

const PLACEHOLDER =
  "https://placeholder.pics/svg/300/E9F0E5/747870/Maktaba%20El%20Hikma";

// Pastille « En stock » : point de couleur + libellé
const STOCK =
  "inline-flex shrink-0 items-center gap-1 font-sans text-[11px] leading-[18px] font-medium before:size-2 before:rounded-full before:bg-current before:content-[''] md:text-xs";

export default function CatalogueCard({ product }) {
  const dispatch = useDispatch();
  const [itemVariation, setItemVariation] = useState({});
  const [adding, setAdding] = useState(false);

  const name = decodeHtml(product.name || "");
  // Libellé au-dessus du titre : catégorie, sinon marque
  const labelSource = product.categories?.[0]?.name || product.brands?.[0]?.name;
  const category = labelSource ? decodeHtml(labelSource) : null;
  const image = product.images?.[0];
  const rating = Number(product.average_rating) || 0;
  const reviewCount = Number(product.review_count) || 0;
  const price = formatPrice(product.prices?.price, product.prices);
  const regularPrice = formatPrice(product.prices?.regular_price, product.prices);
  const onSale = product.on_sale && regularPrice && regularPrice !== price;

  // Variante par défaut : premier terme de chaque attribut (même logique
  // que ProductCard), modifiable via les petits sélecteurs de la carte.
  useEffect(() => {
    if (!product.attributes) return;
    const defaults = {};
    product.attributes.forEach((attribute) => {
      if (attribute.terms.length > 0) {
        defaults[attribute.name] = attribute.terms[0].name;
      }
    });
    setItemVariation(defaults);
  }, [product]);

  function isInStock() {
    if (product.is_in_stock === false) return false;
    const variation = product.variations?.find((variation) =>
      variation.attributes.every(
        (attribute) => itemVariation[attribute.name] === attribute.value,
      ),
    );
    return variation ? variation.is_in_stock !== false : true;
  }

  const inStock = isInStock();

  const handleAdd = async () => {
    setAdding(true);
    const result = await dispatch(
      addProductToCart({
        productId: product.id,
        quantity: 1,
        variation: itemVariation,
      }),
    );
    setAdding(false);
    if (addProductToCart.fulfilled.match(result)) {
      dispatch(showToast(`${name} ajouté au panier`));
    } else {
      dispatch(showToast(result.payload || "Erreur lors de l'ajout au panier"));
    }
  };

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_28px_-14px_rgba(45,63,40,0.35)]">
      <div className="relative aspect-[278/384] overflow-hidden bg-[#e9f0e5]">
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={image?.thumbnail || image?.src || PLACEHOLDER}
            srcSet={image?.srcset || undefined}
            sizes="(min-width: 1024px) 280px, 50vw"
            alt={image?.alt || name}
            loading="lazy"
            className="block size-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
          />
        </Link>

        <div className="absolute top-3 right-3 z-[1]">
          <WishlistButton
            product={product}
            iconInactive={icHeart}
            iconActive={icHeartActive}
            className="block size-9 cursor-pointer rounded-full bg-white/95 p-[9px] object-contain shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] transition hover:scale-[1.08] hover:bg-white [&.active]:bg-cream"
          />
        </div>

        {onSale && <span className="absolute top-3 left-3 rounded-full bg-cream px-2 py-0.5 font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">
            Promo
          </span>}

        {reviewCount > 0 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded px-2 py-0.5 bg-white/90 backdrop-blur-[2px] font-sans text-xs leading-[18px] font-semibold text-sage">
            <img src={icStar} alt="" className="block h-[11.083px] w-[11.667px]" />
            {rating.toFixed(1)} ({reviewCount} avis)
          </span>
        )}
      </div>

      <div className="flex min-h-[170px] flex-1 flex-col p-3 md:min-h-[198px] md:p-4">
        {category && (
          <span className="pt-[4.5px] font-sans text-[10px] leading-4 font-semibold tracking-[0.55px] text-muted uppercase md:text-[11px]">
            {category}
          </span>
        )}
        <h3 className="mt-1 pt-[1.5px] pb-2 font-sans text-sm leading-5 font-bold md:text-base md:leading-6">
          <Link
            to={`/product/${product.slug}`}
            className="line-clamp-2 text-forest-deep transition-colors hover:text-gold"
          >
            {name}
          </Link>
        </h3>

        {product.attributes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.attributes.map((attribute) => (
              <select
                key={attribute.name}
                aria-label={attribute.name}
                className="max-w-full rounded-md border border-line bg-[#f8fbf6] px-2 py-1 text-xs text-ink"
                value={itemVariation[attribute.name] || ""}
                onChange={(e) =>
                  setItemVariation((prev) => ({
                    ...prev,
                    [attribute.name]: e.target.value,
                  }))
                }
              >
                {attribute.terms.map((term) => (
                  <option key={term.name} value={term.name}>
                    {term.name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex flex-wrap items-baseline gap-1.5 font-serif text-lg leading-[26px] font-bold text-forest-deep md:text-[22px] md:leading-[30px]">
            {price || "Prix indisponible"}
            {onSale && (
              <span className="font-sans text-xs font-medium text-muted line-through">
                {regularPrice}
              </span>
            )}
          </span>
          {product.low_stock_remaining ? (
            <span className={`${STOCK} text-[#ba1a1a]`}>
              Plus que {product.low_stock_remaining}
            </span>
          ) : (
            <span
              className={`${STOCK} ${inStock ? "text-stock" : "text-muted"}`}
            >
              {inStock ? "En stock" : "Rupture"}
            </span>
          )}
        </div>

        <button
          type="button"
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-sage px-2 py-2.5 text-center font-sans text-xs leading-[18px] font-semibold tracking-[0.52px] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:bg-line disabled:text-muted md:text-[13px]"
          onClick={handleAdd}
          disabled={!inStock || adding}
        >
          {inStock && <img src={icBag} alt="" className="block h-[13.333px] w-[10.667px]" />}
          {!inStock ? "Rupture de stock" : adding ? "Ajout…" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}
