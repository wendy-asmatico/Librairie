import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { addProductToCart } from "../../thunkActionsCreator/cartThunks";
import { showToast } from "../../slices/toastSlice";
import AverageRating from "../AverageRating";
import Seo from "../Seo";
import WishlistButton from "../WishlistButton";
import Breadcrumb from "../Breadcrumb"; // Ton composant existant
import { decodeHtml } from "../../utils/decodeHtml.js";

// Icônes Wishlist (ajuste le chemin si besoin)
import icHeart from "../../assets/images/ic-heart-card.svg";
import icHeartActive from "../../assets/images/ic-heart-card-active.svg";

export default function Product({ product }) {
  const dispatch = useDispatch();
  const [itemVariation, setItemVariation] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Vérification du stock (Produit simple ou Déclinaison)
  function checkInStock(targetProduct) {
    if (!targetProduct) return false;

    if (targetProduct.variations?.length > 0 && Object.keys(itemVariation).length > 0) {
      const variation = targetProduct.variations.find((v) =>
        v.attributes?.every((attr) => itemVariation[attr.name] === attr.value),
      );
      if (variation) return variation.is_in_stock ?? variation.stock_status === "instock";
    }

    return targetProduct.is_in_stock ?? targetProduct.stock_status === "instock";
  }

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product || !product.attributes) return;

    const defaults = {};
    product.attributes.forEach((attribute) => {
      if (attribute.terms?.length > 0) {
        defaults[attribute.name] = attribute.terms[0].name;
      }
    });

    setItemVariation(defaults);
  }, [product]);

  const handleAddToCart = async () => {
    if (product && product.id) {
      const result = await dispatch(
        addProductToCart({
          productId: product.id,
          quantity: quantity,
          variation: itemVariation,
        }),
      );
      if (addProductToCart.fulfilled?.match(result)) {
        dispatch(showToast(`${decodeHtml(product.name)} ajouté au panier`));
      } else {
        dispatch(
          showToast(result.payload || "Erreur lors de l'ajout au panier"),
        );
      }
    }
  };

  function changeVariation(name, value) {
    setItemVariation((prev) => ({ ...prev, [name]: value }));
  }

  // Informations produit et formatage WooCommerce
  const productImages = product?.images || [];
  const mainImage = productImages[activeImageIndex]?.src || null;
  const inStock = checkInStock(product);

  const rawPrice = product?.prices?.price
    ? parseFloat(product.prices.price) / (10 ** (product.prices.currency_minor_units ?? 2))
    : 0;
  const formattedPrice = rawPrice > 0 ? rawPrice.toFixed(2).replace(".", ",") : "--,--";
  const currencySymbol = product?.prices?.currency_symbol || "€";

  const specifications = product?.specifications || [];
  const categoriesList = product?.categories || [];
  const primaryCategoryName = product?.category_name || "Catalogue";

  // Formatage des données au format attendu par TON composant Breadcrumb : [{ label, to }]
  const breadcrumbItems = [
    { label: "Accueil", to: "/" },
    ...(categoriesList.length > 0
      ? categoriesList.map((cat) => ({
          label: decodeHtml(cat.name),
          to: cat.slug ? `/catalogue?category=${encodeURIComponent(cat.slug)}` : "/catalogue",
        }))
      : [{ label: primaryCategoryName, to: "/catalogue" }]),
    { label: decodeHtml(product?.name || "") },
  ];

  return (
    <div className="min-h-screen bg-white text-ink font-sans pb-16">
      <Seo
        title={decodeHtml(product?.name || "")}
        description={product?.short_description || product?.description}
        image={product?.images?.[0]?.src}
        url={typeof window !== "undefined" ? window.location.href : ""}
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          name: decodeHtml(product?.name || ""),
          description: product?.short_description || product?.description,
          image: product?.images?.[0]?.src,
          offers: {
            "@type": "Offer",
            priceCurrency: product?.prices?.currency_code || "EUR",
            price: rawPrice > 0 ? rawPrice.toFixed(2) : undefined,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }}
      />

      {/* Ton fil d'Ariane existant */}
      <div className="max-w-7xl mx-auto px-gutter py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-gutter pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Galerie d'images */}
          <div className="lg:col-span-6 space-y-4 relative">
            <div className="relative aspect-square w-full rounded-card overflow-hidden bg-sand border border-line">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={decodeHtml(product?.name || "")}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-caption">
                  Aucune image disponible
                </div>
              )}

              {/* Bouton Wishlist */}
              <div className="absolute top-2 right-2 z-[1]">
                <WishlistButton
                  product={product}
                  iconInactive={icHeart}
                  iconActive={icHeartActive}
                  className="block size-7 cursor-pointer rounded-full bg-white/95 p-1.5 object-contain shadow-xs transition hover:scale-105 hover:bg-white [&.active]:bg-cream"
                />
              </div>
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, index) => (
                  <button
                    key={img.id || index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square rounded-control overflow-hidden border-2 transition-all ${
                      index === activeImageIndex
                        ? "border-forest opacity-100 shadow-card"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={`${decodeHtml(product?.name || "")} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-2xs font-semibold tracking-widest text-muted uppercase">
                {primaryCategoryName}
              </span>
              <h1 className="text-title font-serif font-medium text-ink mt-1 mb-2">
                {decodeHtml(product?.name || "")}
              </h1>
              
              <div className="flex items-center space-x-2">
                <AverageRating
                  avgRating={product?.average_rating ?? 0}
                  totalReviews={product?.review_count ?? 0}
                />
              </div>
            </div>

            {/* Prix & Statut du stock */}
            <div className="flex items-baseline justify-between pt-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-amount font-bold text-ink">
                  {formattedPrice} {currencySymbol}
                </span>
                <span className="text-2xs text-muted uppercase font-medium">TTC</span>
              </div>

              {inStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-2xs font-medium bg-mint text-stock border border-line">
                  <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                  En Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-2xs font-medium bg-sand text-danger">
                  Rupture de stock
                </span>
              )}
            </div>

            <p className="text-2xs text-ink-muted leading-relaxed">
              Retrait disponible en magasin.
            </p>

            {/* Description courte WooCommerce */}
            {product?.short_description && (
              <div
                className="text-caption text-ink-soft leading-relaxed space-y-2 border-t pt-4 border-line"
                dangerouslySetInnerHTML={{
                  __html: decodeHtml(product.short_description),
                }}
              />
            )}

            {/* Variations */}
            {product?.attributes?.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-line">
                {product.attributes.map((attribute) => (
                  <div key={attribute.name} className="flex flex-col space-y-1.5">
                    <label htmlFor={attribute.name} className="text-2xs font-semibold text-ink-soft">
                      {attribute.name}
                    </label>
                    <select
                      name={attribute.name}
                      value={itemVariation[attribute.name] || ""}
                      onChange={(e) => changeVariation(attribute.name, e.target.value)}
                      className="w-full border border-line rounded-control py-2 px-3 text-caption bg-white focus:outline-none focus:ring-2 focus:ring-forest"
                    >
                      {attribute.terms?.map((term) => (
                        <option key={term.name} value={term.name}>
                          {term.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Quantité & Ajouter au Panier */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center border border-line rounded-control bg-mint-soft">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-ink-soft hover:text-ink transition"
                >
                  -
                </button>
                <span className="px-3 py-2 text-caption font-medium text-ink">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-ink-soft hover:text-ink transition"
                >
                  +
                </button>
              </div>

              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-forest hover:bg-forest-deep text-white font-medium py-3 px-6 rounded-control shadow-raised transition flex items-center justify-center space-x-2 text-caption"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Ajouter à mon panier</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-line text-muted cursor-not-allowed font-medium py-3 px-6 rounded-control text-caption"
                >
                  Rupture de stock
                </button>
              )}
            </div>

            {/* Spécifications dynamiques */}
            {specifications.length > 0 && (
              <div className="bg-mint-soft p-4 rounded-card border border-line space-y-3 mt-6">
                <h3 className="text-caption font-semibold text-ink border-b border-line pb-2">
                  Spécifications de l'Édition
                </h3>
                <dl className="divide-y divide-line text-2xs">
                  {specifications.map((spec, i) => (
                    <div key={i} className="py-1.5 flex justify-between">
                      <dt className="text-ink-muted">{spec.name}</dt>
                      <dd className="font-medium text-ink text-right ml-4">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

          </div>
        </div>

        {/* Description complète WooCommerce */}
        {product?.description && (
          <section className="mt-16 border-t border-line pt-10">
            <h2 className="text-title font-serif font-medium text-ink mb-4">
              Description du produit
            </h2>
            <div
              className="prose prose-sm max-w-none text-ink-soft space-y-4 font-sans"
              dangerouslySetInnerHTML={{
                __html: decodeHtml(product.description),
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
}