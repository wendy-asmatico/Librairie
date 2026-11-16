import { useEffect, useState } from "react";
import hero from "../../assets/enfants/hero.jpg";
import clouds from "../../assets/enfants/clouds.svg";

const DEFAULT_CONTENT = {
  title_line_1: "L’ESPACE DES",
  title_line_2: "PETITS CROYANTS",
  image: hero,
};

// Bannière de la page Enfants — maquettes « Catalogue Enfants » (135:36) et « Enfants — mobile » (243:38)
export default function KidsHero() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/kids-hero-settings`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger la bannière Enfants.");
        return response.json();
      })
      .then((data) => {
        setContent((current) => ({
          title_line_1: data.title_line_1?.trim() || current.title_line_1,
          title_line_2: data.title_line_2?.trim() || current.title_line_2,
          image: data.image || current.image,
        }));
      })
      .catch(() => {
        // Garde la bannière actuelle si WordPress/ACF est indisponible.
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="relative h-[300px] overflow-hidden lg:h-[564px]">
      <img
        src={content.image}
        alt=""
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      {/* Voile sombre et nuages décoratifs, conservés sur toutes les tailles d’écran */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-[rgba(20,31,18,0.55)]" />
      <img
        src={clouds}
        alt=""
        width="391.257"
        height="86.5"
        className="absolute -bottom-1 left-0 h-[86.5px] w-full lg:h-[150px]"
      />

      <h1 className="absolute inset-x-4 top-[150px] text-center font-['Be_Vietnam_Pro',sans-serif] text-[32px] leading-[35px] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.45)] lg:top-[269px] lg:-translate-y-1/2 lg:text-[64px] lg:leading-[50px] lg:tracking-[-1px] lg:[text-shadow:none]">
        {content.title_line_1} <br className="lg:hidden" />
        {content.title_line_2}
      </h1>
    </section>
  );
}
