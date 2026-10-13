import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { decodeHtml } from "../../utils/decodeHtml";

export default function Hero({ onDiscover, onBrowse } = {}) {
  // 1. On récupère les produits et l'état de chargement depuis le store Redux
  const { list, loading } = useSelector((state) => state.products);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 2. On filtre pour n'avoir que les "nouveautés" ou les 5 derniers produits
  // (Adapte la logique si tu as un tag ou une catégorie spécifique pour les nouveautés)
  const noveltyProducts = list?.data?.slice(0, 5) || [];

  // 3. Rotation automatique toutes les 6 secondes
  useEffect(() => {
    if (noveltyProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % noveltyProducts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [noveltyProducts]);

  // Si les produits chargent encore ou s'il n'y a pas de produits
  if (loading && noveltyProducts.length === 0) {
    return (
      <div className="w-full min-h-[520px] lg:min-h-[580px] bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Chargement des nouveautés...</p>
        </div>
      </div>
    );
  }

  if (noveltyProducts.length === 0) {
    return null; // Pas de produit, on n'affiche rien ou un fallback
  }

  const currentProduct = noveltyProducts[currentIndex];

  // Image du produit ou fallback par défaut
  const productImage = currentProduct?.images?.[0]?.src || "/hero-default.jpg"; 

  return (
    <section className="relative w-full min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden font-sans bg-gray-50 transition-all duration-700 ease-in-out">
      {/* Background avec transition fluide au changement d'image */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentProduct?.id}
          src={productImage}
          alt={decodeHtml(currentProduct?.name)}
          className="w-full h-full object-cover object-center animate-[fadeIn_0.5s_ease-in-out]"
        />
        {/* Dégradé blanc/crème sur la gauche pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/65 via-30% md:via-10% to-transparent" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="max-w-xl">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 bg-[#DCE7D8] text-[#2A3B28] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2A3B28]" />
            <span>NOUVEAUTÉ EXCLUSIVE</span>
          </div>

          {/* Titre dynamique du produit */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] mb-4 line-clamp-3">
            {decodeHtml(currentProduct?.name)}
          </h1>

          {/* Description / Extrait du produit */}
          <div 
            className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 max-w-lg line-clamp-3"
            dangerouslySetInnerHTML={{ 
              __html: currentProduct?.description || "Découvrez notre toute dernière nouveauté de la boutique. Une pièce rigoureusement sélectionnée pour vous." 
            }}
          />

          {/* Boutons d'action */}
          <div className="flex flex-wrap items-center gap-4">
            {onDiscover ? (
              <button
                type="button"
                onClick={onDiscover}
                className="bg-[#B1D2AA] hover:bg-[#a1c49a] text-[#2A3B28] font-bold px-6 py-3.5 rounded-xl transition-colors text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Découvrir les Nouveautés</span>
                <span className="text-base">→</span>
              </button>
            ) : (
              <Link
                to={`/product/${currentProduct?.id}`}
                className="bg-[#B1D2AA] hover:bg-[#a1c49a] text-[#2A3B28] font-bold px-6 py-3.5 rounded-xl transition-colors text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Voir le Produit</span>
                <span className="text-base">→</span>
              </Link>
            )}

            {onBrowse ? (
              <button
                type="button"
                onClick={onBrowse}
                className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3.5 rounded-xl border border-gray-200 transition-colors text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Voir le Rayon Livres</span>
              </button>
            ) : (
              <Link
                to="/catalogue"
                className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3.5 rounded-xl border border-gray-200 transition-colors text-sm flex items-center gap-2 shadow-xs"
              >
                <span>Toutes les Nouveautés</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Indicateur de pagination (Carousel Dots) en bas au centre */}
      {noveltyProducts.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
          {noveltyProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all cursor-pointer ${
                index === currentIndex 
                  ? "w-6 h-2 bg-white" 
                  : "w-2 h-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Aller au produit ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}