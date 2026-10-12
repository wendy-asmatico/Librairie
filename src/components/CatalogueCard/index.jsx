import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import WishlistButton from "../WishlistButton";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";
import "./index.css";

const PLACEHOLDER =
  "https://placeholder.pics/svg/300/E9F0E5/747870/Maktaba%20El%20Hikma";

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
    <article className="catalogue-card">
      <div className="catalogue-card__media">
        <Link
          to={`/product/${product.slug}`}
          className="catalogue-card__image-link"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={image?.thumbnail || image?.src || PLACEHOLDER}
            srcSet={image?.srcset || undefined}
            sizes="(min-width: 1024px) 280px, 50vw"
            alt={image?.alt || name}
            loading="lazy"
          />
        </Link>

        <div className="catalogue-card__wishlist">
          <WishlistButton product={product} />
        </div>

        {onSale && <span className="catalogue-card__badge">Promo</span>}

        {reviewCount > 0 && (
          <span className="catalogue-card__rating">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
            </svg>
            {rating.toFixed(1)}
            <span className="catalogue-card__rating-count">
              ({reviewCount} avis)
            </span>
          </span>
        )}
      </div>

      <div className="catalogue-card__body">
        {category && <span className="catalogue-card__category">{category}</span>}
        <h3 className="catalogue-card__title">
          <Link to={`/product/${product.slug}`}>{name}</Link>
        </h3>

        {product.attributes?.length > 0 && (
          <div className="catalogue-card__options">
            {product.attributes.map((attribute) => (
              <select
                key={attribute.name}
                aria-label={attribute.name}
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

        <div className="catalogue-card__price-row">
          <span className="catalogue-card__price">
            {price || "Prix indisponible"}
            {onSale && (
              <span className="catalogue-card__regular-price">{regularPrice}</span>
            )}
          </span>
          {product.low_stock_remaining ? (
            <span className="catalogue-card__stock catalogue-card__stock--low">
              Plus que {product.low_stock_remaining}
            </span>
          ) : (
            <span
              className={`catalogue-card__stock${inStock ? "" : " catalogue-card__stock--out"}`}
            >
              {inStock ? "En stock" : "Rupture"}
            </span>
          )}
        </div>

        <button
          type="button"
          className="catalogue-card__add"
          onClick={handleAdd}
          disabled={!inStock || adding}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8h14l-1 13H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {!inStock ? "Rupture de stock" : adding ? "Ajout…" : "Ajouter"}
        </button>
      </div>
    </article>
  );
}
