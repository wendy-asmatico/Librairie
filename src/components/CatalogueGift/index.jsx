import { Link } from "react-router-dom";
import coffretsImage from "../../assets/maktaba/coffrets.jpg";
import motif from "../../assets/maktaba/coffrets-motif.svg";
import icBadge from "../../assets/maktaba/ic-badge-star.svg";

const BTN =
  "flex h-16 w-full cursor-pointer items-center justify-center rounded-xl px-6 text-center font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors";

// Bloc « Coffrets Cadeaux » — maquette de Lisa (nodes 195:439 + 195:300)
export default function CatalogueGift({ onSelect }) {
  return (
    <section className="grid bg-sage lg:min-h-[552px] lg:grid-cols-[59.7%_1fr]">
      <div className="relative min-h-[260px] overflow-hidden">
        <img
          src={coffretsImage}
          alt="Coffret cadeau : Coran, citadelle du musulman, parfum et tasbih"
          className="absolute inset-0 block size-full object-cover"
        />
      </div>

      <div className="relative flex items-center overflow-hidden px-4 py-8 lg:px-6 lg:py-10">
        <img src={motif} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        <div className="relative flex w-full max-w-[477px] flex-col items-start">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-[#261900] uppercase">
            <img src={icBadge} alt="" className="block size-[11.667px]" />
            Service personnalisé &amp; cadeaux uniques
          </span>
          <h2 className="mt-2 mb-1 font-serif text-[32px] leading-[1.3] font-bold tracking-[-0.4px] text-white lg:text-[40px] lg:leading-[52px]">
            Coffrets Cadeaux
          </h2>
          <p className="font-sans text-sm leading-[22px] text-forest-deep lg:text-base lg:leading-[26px]">
            Offrez un présent soigné dans les moindres détails.
          </p>
          <div className="mt-7 flex w-full flex-col gap-[22px] lg:mt-[62px]">
            <button
              type="button"
              onClick={onSelect}
              className={`${BTN} bg-gold text-white hover:bg-gold-dark lg:h-[95px]`}
            >
              Regarder nos coffrets cadeaux
            </button>
            <Link to="/contact" className={`${BTN} bg-white text-gold hover:bg-cream lg:h-[100px]`}>
              Créer un coffret cadeau personnalisé
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
