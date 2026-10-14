import { Link } from "react-router-dom";

import mapImage from "../../assets/contact/map.png";
import icPinGold from "../../assets/contact/ic-pin-gold.svg";
import icPin from "../../assets/contact/ic-pin.svg";
import icClock from "../../assets/contact/ic-clock.svg";
import icTruck from "../../assets/contact/ic-truck.svg";
import icMap from "../../assets/contact/ic-map.svg";
import icClockSage from "../../assets/contact/ic-clock-sage.svg";

const ADDRESS = "14 Boulevard de la Sagesse, 13002 Marseille";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

const BTN =
  "inline-flex items-center gap-1 rounded-lg px-7 py-2 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.52px] transition-colors";
const LINE = "font-sans text-sm leading-[22px] text-[#444841]";

// Bloc « Notre Boutique » — maquette de Lisa (node 175:253)
export default function ContactShop() {
  return (
    <section id="boutique" className="scroll-mt-40 bg-gold px-4 py-10 lg:px-12">
      <div className="mx-auto grid max-w-[1184px] gap-8 rounded-3xl bg-mint-soft p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-10 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col lg:col-span-6 lg:pt-[7px]">
          <p className="mb-1 flex items-center gap-1 font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">
            <img src={icPinGold} alt="" className="h-[13.333px] w-[9.333px]" />
            Lieu de rencontre &amp; retrait
          </p>
          <h2 className="mb-1 font-serif text-[28px] leading-[38px] font-bold text-sage">Notre Boutique</h2>

          <ul className="flex list-none flex-col gap-2">
            <li className="flex items-start gap-2">
              <img src={icPin} alt="" className="h-[17px] w-3 shrink-0" />
              <span className="flex flex-col">
                <span className={`${LINE} font-bold`}>{ADDRESS}</span>
                <span className="font-sans text-xs leading-[18px] text-[#444841]">
                  Métro National • Accès rapide
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <img src={icClock} alt="" className="size-[15px] shrink-0" />
              <span className={LINE}>Du Mardi au Dimanche : 10h30 – 19h30 sans interruption</span>
            </li>
            <li className="flex items-center gap-2">
              <img src={icTruck} alt="" className="h-3 w-[16.5px] shrink-0" />
              <span className={LINE}>Retrait express gratuit pour vos commandes passées sur le site</span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4 lg:mt-auto lg:pb-7">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className={`${BTN} bg-sage text-white hover:bg-sage-hover`}
            >
              <img src={icMap} alt="" className="size-3" />
              Nous trouver sur Google Maps
            </a>
            <Link
              to="/panier"
              className={`${BTN} bg-white text-sage shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-mint`}
            >
              <img src={icClockSage} alt="" className="size-[13.333px]" />
              Préparer mon retrait
            </Link>
          </div>
        </div>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Voir la boutique sur Google Maps"
          className="block h-[220px] overflow-hidden rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] sm:h-80 lg:col-span-6 lg:self-center"
        >
          <img src={mapImage} alt="" className="size-full object-cover" />
        </a>
      </div>
    </section>
  );
}
