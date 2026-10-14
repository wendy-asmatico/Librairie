import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import WishlistButton from "../WishlistButton";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";
import icHeart from "../../assets/images/ic-heart-card.svg";
import icHeartActive from "../../assets/images/ic-heart-card-active.svg";
import icStar from "../../assets/images/ic-star-green.svg";
import icBag from "../../assets/images/ic-bag-small.svg";

const PLACEHOLDER =
  "https://placeholder.pics/svg/300/E9F0E5/747870/Maktaba%20El%20Hikma";

// Pastille « En stock » : point de couleur + libellé
const STOCK =
  "inline-flex shrink-0 items-center gap-1 font-sans text-[11px] leading-[18px] font-medium before:size-2 before:rounded-full before:bg-current before:content-[''] md:text-xs";

// accent : couleurs de la carte par rayon (page Enfants) — { border, label }
// kids : gabarit plus grand de la maquette « Catalogue Enfants »
export default function CatalogueCard({ product, compact = false, accent = null, kids = false }) {
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
  <article
    className={`group relative flex min-w-0 flex-col overflow-hidden bg-white shadow-xs transition duration-200 hover:-translate-y-[2px] hover:shadow-md ${
      accent ? `rounded-2xl border ${accent.border}` : "rounded-xl"
    }`}
  >
    {/* Conteneur Image réduit */}
    <div
      className={`relative overflow-hidden bg-[#e9f0e5] ${
        compact ? "aspect-square" : kids ? "aspect-[278/385]" : "aspect-[4/3]"
      }`}
    >
      <Link
        to={`/product/${product.slug}`}
        className="absolute inset-0 block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={image?.thumbnail || image?.src || PLACEHOLDER}
          srcSet={image?.srcset || undefined}
          sizes="(min-width: 1024px) 240px, 40vw"
          alt={image?.alt || name}
          loading="lazy"
          className="block size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>

      {/* Bouton Favoris plus petit */}
      <div className="absolute top-2 right-2 z-[1]">
        <WishlistButton
          product={product}
          iconInactive={icHeart}
          iconActive={icHeartActive}
          className="block size-7 cursor-pointer rounded-full bg-white/95 p-1.5 object-contain shadow-xs transition hover:scale-105 hover:bg-white [&.active]:bg-cream"
        />
      </div>

      {onSale && (
        <span className="absolute top-2 left-2 rounded-full bg-cream px-1.5 py-0.5 font-sans text-[10px] font-bold text-gold uppercase">
          Promo
        </span>
      )}

      {reviewCount > 0 && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-white/90 backdrop-blur-xs px-1.5 py-0.5 font-sans text-[10px] font-semibold text-sage">
          <img src={icStar} alt="" className="block h-2.5 w-2.5" />
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>

    {/* Contenu Texte réduit */}
    <div className={`flex flex-1 flex-col ${kids ? "p-2.5 md:p-4" : "p-2.5 md:p-3"}`}>
      {category && (
        <span
          className={`font-sans font-semibold uppercase ${
            kids
              ? "text-[10px] leading-4 tracking-[0.55px] md:text-[11px]"
              : "text-[9px] tracking-wider md:text-[10px]"
          } ${accent ? accent.label : "text-muted"}`}
        >
          {category}
        </span>
      )}

      <h3
        className={`mt-0.5 font-sans font-bold ${
          kids ? "text-[13px] leading-[18px] md:mt-1 md:text-base md:leading-6" : "text-xs leading-snug md:text-sm"
        }`}
      >
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-forest-deep transition-colors hover:text-gold"
        >
          {name}
        </Link>
      </h3>

      {product.attributes?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {product.attributes.map((attribute) => (
            <select
              key={attribute.name}
              aria-label={attribute.name}
              className="max-w-full rounded border border-line bg-[#f8fbf6] px-1.5 py-0.5 text-[11px] text-ink"
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

      {/* Prix et Stock */}
      <div className={`mt-auto flex items-center justify-between gap-1 ${kids ? "pt-2 md:pt-6" : "pt-2"}`}>
        <span
          className={`inline-flex flex-wrap items-baseline gap-1 font-serif font-bold text-forest-deep ${
            kids ? "text-base md:text-[22px] md:leading-[30px]" : "text-base md:text-lg"
          }`}
        >
          {price || "Prix indisponible"}
          {onSale && (
            <span className="font-sans text-[10px] font-medium text-muted line-through">
              {regularPrice}
            </span>
          )}
        </span>
        {product.low_stock_remaining ? (
          <span className={`${STOCK} text-[10px] text-[#ba1a1a]`}>
            Reste {product.low_stock_remaining}
          </span>
        ) : (
          <span
            className={`${STOCK} text-[10px] ${
              inStock ? "text-stock" : "text-muted"
            }`}
          >
            {inStock ? "En stock" : "Rupture"}
          </span>
        )}
      </div>

      {/* Bouton Panier compact */}
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center justify-center gap-1.5 bg-sage px-2 text-center font-sans font-semibold text-white transition-colors hover:bg-forest disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ${
          kids
            ? "mt-2 rounded-lg py-2 text-xs md:mt-4 md:py-2.5 md:text-[13px] md:tracking-[0.52px]"
            : "mt-2 rounded-md py-1.5 text-xs"
        }`}
        onClick={handleAdd}
        disabled={!inStock || adding}
      >
        {inStock && <img src={icBag} alt="" className="block h-3 w-3" />}
        {!inStock
          ? "Rupture"
          : adding
          ? "Ajout…"
          : kids
          ? (
            <>
              Ajouter<span className="hidden md:inline">&nbsp;au panier</span>
            </>
          )
          : "Ajouter"}
      </button>
    </div>
  </article>
);
}
