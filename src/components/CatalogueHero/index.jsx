import heroImage from "../../assets/maktaba/hero.jpg";
import icArrow from "../../assets/maktaba/ic-arrow.svg";
import icBook from "../../assets/maktaba/ic-book.svg";

const BTN =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg px-6 py-4 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] transition-colors";

// Bannière du catalogue — maquette « Livres » de Lisa (node 195:36)
export default function CatalogueHero({ onDiscover, onBrowse }) {
  return (
    <section className="relative flex min-h-[470px] items-center overflow-hidden px-4 py-10 lg:min-h-[564px] lg:px-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 size-full object-cover object-[70%_40%]"
        />
        {/* Dégradé blanc à gauche → transparent (maquette) */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.6)_100%)] lg:bg-[linear-gradient(90deg,#fff_0%,rgba(121,65,0,0.1)_52.266%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1184px] flex-col items-start">
        <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-leaf-soft px-4 py-1 font-sans text-[11px] leading-4 font-semibold tracking-[0.55px] text-[#0d200a] uppercase">
          <span className="size-2 rounded-full bg-sage" />
          Nouvel arrivage — Livres et coran
        </span>

        <h1 className="mb-4 font-serif text-[31px] leading-[1.2] font-bold tracking-[-1px] text-black lg:text-[40px] lg:leading-[50px]">
          Tafsir Ibn Kathir
          <br />
          &amp; Récits Prophétiques
        </h1>

        <p className="mb-7 max-w-[576px] font-sans text-sm leading-[22px] text-black lg:text-base lg:leading-[26px]">
          Une sélection rigoureuse d&apos;ouvrages vérifiés avec soin. Profitez de nos
          raretés littéraires, coffrets exclusifs et pièces d&apos;exception pour
          illuminer votre foyer et nourrir votre quête de savoir.
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={onDiscover}
            className={`${BTN} bg-sage text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-forest`}
          >
            Découvrir les Nouveautés
            <img src={icArrow} alt="" className="size-[9.333px]" />
          </button>
          <button
            type="button"
            onClick={onBrowse}
            className={`${BTN} bg-white text-gold shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-cream`}
          >
            <img src={icBook} alt="" className="h-[9.333px] w-[12.833px]" />
            Voir le Rayon Livres
          </button>
        </div>
      </div>
    </section>
  );
}
