import livresImage from "../../assets/images/livres.jpg";
import vetementsImage from "../../assets/images/vetement.png";
import accessoiresImage from "../../assets/images/accessoire.png";
import coffretsImage from "../../assets/images/coffrets.jpg";
import Hero from "../HomeSlider/Hero";

const RAYON_HEROES = {
  "livres-coran": {
    label: "LIVRES & CORAN",
    title: "Des lectures qui nourrissent l’esprit",
    description: "Explorez notre sélection de Corans et d’ouvrages pour approfondir vos connaissances.",
    image: livresImage,
  },
  vetements: {
    label: "VÊTEMENTS",
    title: "L’élégance au quotidien",
    description: "Découvrez une sélection de vêtements confortables, choisis avec soin.",
    image: vetementsImage,
  },
  accessoires: {
    label: "ACCESSOIRES",
    title: "Les détails qui font la différence",
    description: "Retrouvez des accessoires et des idées utiles pour vous accompagner chaque jour.",
    image: accessoiresImage,
  },
  "coffrets-cadeaux": {
    label: "COFFRETS CADEAUX",
    title: "Offrez un cadeau plein de sens",
    description: "Composez une attention délicate avec nos coffrets et idées cadeaux.",
    image: coffretsImage,
  },
};

export default function CatalogueHero({ onDiscover, onBrowse, categorySlug, onScrollToListing }) {
  const rayon = RAYON_HEROES[categorySlug];

  if (!rayon) return <Hero onDiscover={onDiscover} onBrowse={onBrowse} />;

  return (
    <section className="relative isolate flex min-h-[360px] w-full items-center overflow-hidden bg-[#f4f1e8] font-sans sm:min-h-[420px] lg:min-h-[500px]">
      <img src={rayon.image} alt="" className="absolute inset-0 -z-20 size-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fffdf7] via-[#fffdf7]/90 via-45% to-[#fffdf7]/10" />
      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-12">
        <div className="max-w-xl">
          <p className="mb-5 inline-flex rounded-full bg-[#dce7d8] px-3.5 py-1.5 text-xs font-bold tracking-wide text-[#2a3b28]">
            {rayon.label}
          </p>
          <h1 className="mb-4 font-serif text-3xl leading-tight font-extrabold text-[#2d3f28] sm:text-4xl lg:text-5xl">
            {rayon.title}
          </h1>
          <p className="mb-8 max-w-lg text-sm leading-relaxed text-[#444841] sm:text-base">
            {rayon.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onScrollToListing}
              className="rounded-xl bg-[#b1d2aa] px-6 py-3.5 text-sm font-bold text-[#2a3b28] shadow-xs transition-colors hover:bg-[#a1c49a]"
            >
              Voir les articles
            </button>
            <button
              type="button"
              onClick={onDiscover}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 shadow-xs transition-colors hover:bg-gray-50"
            >
              Les nouveautés
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
