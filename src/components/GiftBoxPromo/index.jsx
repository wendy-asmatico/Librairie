import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import giftBoxImage from "../../assets/images/coffret-cadeau.webp";
import { setFilters } from "../../slices/filtersSlice";

const actionClassName =
  "flex h-12 items-center justify-center rounded-control px-4 text-sm font-semibold whitespace-nowrap shadow-raised transition-colors sm:h-11.5 sm:px-5";

/*
 * Bandeau « Coffrets Cadeaux ». Sur mobile, l'image coiffe la carte ; dès `sm`,
 * elle occupe la droite du bandeau et un dégradé fond le texte dans la photo.
 */
export default function GiftBoxPromo() {
  const dispatch = useDispatch();

  // Même filtrage que la recherche du header : le catalogue s'ouvre sur les coffrets.
  const browseGiftBoxes = () =>
    dispatch(
      setFilters({ category: "", min_price: "", max_price: "", search: "coffret" }),
    );

  return (
    <section
      aria-labelledby="gift-box-title"
      className="relative mt-7 overflow-hidden rounded-card bg-sand sm:mt-10 sm:max-w-190"
    >
      <img
        src={giftBoxImage}
        alt=""
        width="567"
        height="412"
        loading="lazy"
        decoding="async"
        className="aspect-2/1 w-full object-cover object-[50%_55%] sm:absolute sm:inset-y-0 sm:right-0 sm:aspect-auto sm:h-full sm:w-[58%]"
      />
      <div className="relative flex flex-col gap-4 px-4.5 pt-4.5 pb-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:bg-linear-to-r sm:from-sand sm:from-42% sm:via-sand/85 sm:via-55% sm:to-sand/0 sm:to-80% sm:px-7 sm:py-5.5">
        <div className="flex flex-col gap-1.5">
          <h2
            id="gift-box-title"
            className="font-serif text-[1.375rem] leading-tight font-semibold text-forest sm:text-2xl"
          >
            Coffrets Cadeaux
          </h2>
          <p className="text-sm text-pretty text-ink">
            Offrez un présent soigné dans les moindres détails.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Link
            to="/catalogue"
            onClick={browseGiftBoxes}
            className={`${actionClassName} bg-secondary text-white hover:bg-secondary-hover`}
          >
            Regarder nos coffrets cadeaux
          </Link>
          <Link
            to="/contact"
            className={`${actionClassName} bg-white text-secondary hover:bg-mint`}
          >
            Créer un coffret personnalisé
          </Link>
        </div>
      </div>
    </section>
  );
}
