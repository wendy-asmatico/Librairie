import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFilters } from "../../slices/filtersSlice";
import coffretsImage from "../../assets/images/coffrets.jpg";
import motif from "../../assets/images/coffrets-motif.svg";
import icBadge from "../../assets/images/ic-badge-star.svg";

const BTN =
  "flex h-16 w-full cursor-pointer items-center justify-center rounded-xl px-6 text-center font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors";

const DEFAULT_CONTENT = {
  eyebrow: "Service personnalisé & cadeaux uniques",
  title: "Coffrets Cadeaux",
  description: "Offrez un présent soigné dans les moindres détails.",
  primary_button_text: "Regarder nos coffrets cadeaux",
  secondary_button_text: "Créer un coffret cadeau personnalisé",
  secondary_button_url: "/contact",
  image_alt: "Coffret cadeau : Coran, citadelle du musulman, parfum et tasbih",
  image: coffretsImage,
};

// Bloc « Coffrets Cadeaux » — maquette de Lisa (nodes 195:439 + 195:300)
export default function Gift() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/gift-settings`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger les réglages Gift.");
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
        // Conserve l’affichage actuel si WordPress/ACF est indisponible.
      });

    return () => controller.abort();
  }, []);

  const browseGiftBoxes = () => {
    dispatch(
      setFilters({
        category: "coffrets-cadeaux",
        search: "",
        min_price: "",
        max_price: "",
        stock_status: "",
      }),
    );

    if (pathname === "/catalogue") {
      document
        .getElementById("catalogue-listing")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/catalogue");
    }
  };

  return (
    <section className="grid bg-sage lg:min-h-[400px] lg:grid-cols-[59.7%_1fr]">
      <div className="relative min-h-[260px] overflow-hidden">
        <img
          src={content.image}
          alt={content.image_alt}
          className="absolute inset-0 block size-full object-cover"
        />
      </div>

      <div className="relative flex items-center overflow-hidden px-4 py-8 lg:px-6 lg:py-10">
        <img src={motif} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        <div className="relative flex w-full max-w-[477px] flex-col items-start">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-[#261900] uppercase">
            <img src={icBadge} alt="" className="block size-[11.667px]" />
            {content.eyebrow}
          </span>
          <h2 className="mt-2 mb-1 font-serif text-[32px] leading-[1.3] font-bold tracking-[-0.4px] text-white lg:text-[40px] lg:leading-[52px]">
            {content.title}
          </h2>
          <p className="font-sans text-sm leading-[22px] text-forest-deep lg:text-base lg:leading-[26px]">
            {content.description}
          </p>
          <div className="mt-7 flex w-full flex-col gap-[22px] lg:mt-[64px]">
            <button
              type="button"
              onClick={browseGiftBoxes}
              className={`${BTN} bg-secondary text-white hover:bg-secondary-hover lg:h-[85px]`}
            >
              {content.primary_button_text}
            </button>
            <Link to={content.secondary_button_url} className={`${BTN} bg-white text-gold hover:bg-line lg:h-[85px]`}>
              {content.secondary_button_text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
