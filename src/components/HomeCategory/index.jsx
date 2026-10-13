import { Link } from "react-router-dom";
import useRayonNav from "../Header/useRayonNav";

import livresImg from "../../assets/images/livres.jpg";
import vetementsImg from "../../assets/images/vetement.png";
import accessoiresImg from "../../assets/images/accessoire.png";
import enfantsImg from "../../assets/images/enfant.jpg";

export default function HomeCategories() {
  const { items, goTo } = useRayonNav();
  const navigateToRayon = (slug) => {
    const item = items.find((rayon) => rayon.slug === slug);
    if (item) goTo(item);
  };

  return (
    <section className="max-w-7xl mx-auto font-sans">
     
      {/* 2. Grand Cadre Principal avec Bords Arrondis et Liseré Doré */}
      <div className="bg-[#FAFDF9] border border-[#775A19]/30 rounded-[2.5rem] p-6 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Colonne Gauche : 2 Cartes Catégories (Livres & Vêtements) */}
          <div className="flex flex-col gap-6">
            {/* Carte Livres */}
            <button
              type="button"
              onClick={() => navigateToRayon("livres-coran")}
              className="group relative h-48 sm:h-56 w-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0 text-left shadow-xs transition-all duration-300 hover:shadow-md"
            >
              <img src={livresImg} alt="Livres & Coran" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs text-gray-900 font-serif font-bold text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-xs group-hover:bg-white transition-colors">
                <span>Livres</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Carte Vêtements */}
            <button
              type="button"
              onClick={() => navigateToRayon("vetements")}
              className="group relative h-48 sm:h-56 w-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0 text-left shadow-xs transition-all duration-300 hover:shadow-md"
            >
              <img src={vetementsImg} alt="Vêtements" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs text-gray-900 font-serif font-bold text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-xs group-hover:bg-white transition-colors">
                <span>Vêtements</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>

          {/* Colonne Centrale : Titre & Message de Marque */}
          <div className="flex flex-col items-center text-center px-2 py-4">
            {/* Séparateur motif islamique / Étoile dorée */}
            <div className="flex items-center gap-3 text-[#775A19] opacity-60 mb-4">
              <span className="h-px w-12 bg-[#775A19]" />
              <span className="text-lg">۞</span>
              <span className="h-px w-12 bg-[#775A19]" />
            </div>

            <span className="text-[11px] font-bold tracking-[0.2em] text-[#775A19] uppercase mb-2">
              LIBRAIRIE · VÊTEMENTS · CADEAUX
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D3F28] leading-tight mb-4">
              Des produits qui ont du sens
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
              Commandez en ligne, faites-vous livrer ou retirez votre commande directement en boutique.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3.5 mb-8">
              <Link
                to="/catalogue"
                className="bg-[#B1D2AA] hover:bg-[#a1c49a] text-[#2A3B28] font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-xs"
              >
                Voir les nouveautés
              </Link>
              <Link
                to="/coffrets"
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors text-sm shadow-xs"
              >
                Composer un coffret
              </Link>
            </div>

            {/* Petits puces dorés d'ornement en bas */}
            <div className="flex items-center gap-2 text-[#775A19]/60 text-[10px]">
              <span>◆</span>
              <span>◆</span>
              <span>◆</span>
            </div>
          </div>

          {/* Colonne Droite : 2 Cartes Catégories (Accessoires & Enfants) */}
          <div className="flex flex-col gap-6">
            {/* Carte Accessoires */}
            <button
              type="button"
              onClick={() => navigateToRayon("accessoires")}
              className="group relative h-48 sm:h-56 w-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0 text-left shadow-xs transition-all duration-300 hover:shadow-md"
            >
              <img src={accessoiresImg} alt="Accessoires" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs text-gray-900 font-serif font-bold text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-xs group-hover:bg-white transition-colors">
                <span>Accessoires</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Carte Enfants */}
            <button
              type="button"
              onClick={() => navigateToRayon("enfants")}
              className="group relative h-48 sm:h-56 w-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0 text-left shadow-xs transition-all duration-300 hover:shadow-md"
            >
              <img src={enfantsImg} alt="Enfants" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs text-gray-900 font-serif font-bold text-sm px-5 py-2 rounded-full flex items-center gap-2 shadow-xs group-hover:bg-white transition-colors">
                <span>Enfants</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}