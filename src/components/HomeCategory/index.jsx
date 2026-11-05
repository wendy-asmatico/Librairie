import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useRayonNav from "../Header/useRayonNav";

import livresImg from "../../assets/images/livres.jpg";
import vetementsImg from "../../assets/images/vetement.png";
import accessoiresImg from "../../assets/images/accessoire.png";
import enfantsImg from "../../assets/images/enfant.jpg";

const DEFAULT_CONTENT = {
  eyebrow: "LIBRAIRIE · VÊTEMENTS · CADEAUX",
  title: "Des produits qui ont du sens",
  description:
    "Commandez en ligne, faites-vous livrer ou retirez votre commande directement en boutique.",
  primary_button_text: "Voir les nouveautés",
  primary_button_url: "/catalogue",
  secondary_button_text: "Composer un coffret",
  secondary_button_url: "/coffrets",
  books_label: "Livres",
  books_image: livresImg,
  clothing_label: "Vêtements",
  clothing_image: vetementsImg,
  accessories_label: "Accessoires",
  accessories_image: accessoiresImg,
  children_label: "Enfants",
  children_image: enfantsImg,
};

function CategoryCard({ label, image, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-48 sm:h-56 w-full cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0 text-left shadow-xs transition-all duration-300 hover:shadow-md"
    >
      <img
        src={image}
        alt={label}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-5 py-2 font-serif text-sm font-bold text-gray-900 shadow-xs backdrop-blur-xs transition-colors group-hover:bg-white">
        <span>{label}</span>
        <span className="text-base transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  );
}

export default function HomeCategories() {
  const { items, goTo } = useRayonNav();
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/home-categories-settings`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger les réglages HomeCategories.");
        return response.json();
      })
      .then((data) => {
        setContent((current) =>
          Object.fromEntries(
            Object.keys(current).map((key) => [key, data[key]?.trim?.() || current[key]]),
          ),
        );
      })
      .catch(() => {
        // Conserve la présentation actuelle si WordPress/ACF est indisponible.
      });

    return () => controller.abort();
  }, []);

  const navigateToRayon = (slug) => {
    const item = items.find((rayon) => rayon.slug === slug);
    if (item) goTo(item);
  };

  const categoriesLeft = [
    { key: "books", slug: "livres-coran" },
    { key: "clothing", slug: "vetements" },
  ];
  const categoriesRight = [
    { key: "accessories", slug: "accessoires" },
    { key: "children", slug: "enfants" },
  ];

  const renderCategory = ({ key, slug }) => (
    <CategoryCard
      key={key}
      label={content[`${key}_label`]}
      image={content[`${key}_image`]}
      onClick={() => navigateToRayon(slug)}
    />
  );

  return (
    <section className="max-w-7xl mx-auto font-sans">
     
      {/* 2. Grand Cadre Principal avec Bords Arrondis et Liseré Doré */}
      <div className="bg-[#FAFDF9] border border-[#775A19]/30 rounded-[2.5rem] p-6 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          <div className="flex flex-col gap-6">
            {categoriesLeft.map(renderCategory)}
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
              {content.eyebrow}
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D3F28] leading-tight mb-4">
              {content.title}
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
              {content.description}
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3.5 mb-8">
              <Link
                to={content.primary_button_url}
                className="bg-[#B1D2AA] hover:bg-[#a1c49a] text-[#2A3B28] font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-xs"
              >
                {content.primary_button_text}
              </Link>
              <Link
                to={content.secondary_button_url}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors text-sm shadow-xs"
              >
                {content.secondary_button_text}
              </Link>
            </div>

            {/* Petits puces dorés d'ornement en bas */}
            <div className="flex items-center gap-2 text-[#775A19]/60 text-[10px]">
              <span>◆</span>
              <span>◆</span>
              <span>◆</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {categoriesRight.map(renderCategory)}
          </div>

        </div>
      </div>
    </section>
  );
}