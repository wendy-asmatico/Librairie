import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { BRAND } from "../../brand";
import logoRound from "../../assets/maktaba/logo-round.jpg";
import icStar from "../../assets/maktaba/ic-star.svg";
import icPin from "../../assets/maktaba/ic-pin.svg";
import icClock from "../../assets/maktaba/ic-clock.svg";
import icPhone from "../../assets/maktaba/ic-phone-dark.svg";
import icChat from "../../assets/maktaba/ic-chat.svg";

// Liens « Rayons & Produits » → slugs des rayons (cf. RAYONS dans brand.js)
const LINKS = [
  { label: "Livres du Saint Coran & Tafsir", slug: "livres-coran" },
  { label: "Recueils de Hadiths & Fiqh classique", slug: "livres-coran" },
  { label: "Vêtements pudiques Homme & Femme", slug: "vetements" },
  { label: "Tapis d'artisanat & Parfums de Dubaï", slug: "accessoires" },
  { label: "Univers Éducatif & Éveil Enfants", slug: "enfants" },
  { label: "Coffrets Cadeaux Ciselés sur Mesure", slug: "coffrets-cadeaux" },
];

const SERVICES = [
  { label: "Retrait gratuit à notre boutique", to: "/contact" },
  { label: "Modalités et délais d'expédition", to: "/cgv" },
  { label: "Suivre l'état de ma commande", to: "/profile" },
  { label: "Devis & Coffrets sur mesure pro/famille", to: "/contact" },
  { label: "Centre d'Aide & Foire aux questions", to: "/contact" },
];

const LINK =
  "block cursor-pointer bg-transparent p-0 text-left text-sm leading-[22px] text-ink transition-colors hover:text-gold";

export default function Footer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openRayon = (slug) => {
    dispatch(setFilters({ category: slug, search: "" }));
    navigate("/catalogue");
  };

  return (
    <footer className="flex w-full flex-col gap-8 bg-white px-4 pt-8 pb-6 font-sans lg:gap-10 lg:px-12 lg:pt-10 lg:pb-7">
      <div className="grid gap-7 min-[700px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="block size-8 overflow-hidden rounded-full bg-[#e9f0e5]">
              <img src={logoRound} alt="" className="block size-full object-cover" />
            </span>
            <span className="font-serif text-[22px] leading-[30px] font-bold text-forest">{BRAND.shortName}</span>
          </div>
          <p className="text-sm leading-[22.75px] text-ink">Librairie et boutique Islamique</p>
          <div className="inline-flex items-center gap-2 self-start rounded-lg bg-white p-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <span className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <img key={i} src={icStar} alt="" className="block h-[11.083px] w-[11.667px]" />
              ))}
            </span>
            <span className="text-[11px] leading-4 font-semibold tracking-[0.66px] text-[#161d17]">
              4.9/5 sur Google (380+ avis)
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <h4 className="text-base leading-6 font-bold text-forest">Rayons &amp; Produits</h4>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {LINKS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => openRayon(item.slug)}
                  className={LINK}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <h4 className="text-base leading-6 font-bold text-forest">Services &amp; Commandes</h4>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {SERVICES.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={LINK}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <h4 className="text-base leading-6 font-bold text-forest">Contact &amp; Librairie</h4>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-start gap-1">
              <img src={icPin} alt="" className="mt-[3px] block h-[15.333px] w-[10.667px]" />
              <div className="flex flex-col gap-[3.5px]">
                <span className="text-sm leading-[22px] text-ink">{BRAND.address}</span>
                <span className="text-xs leading-[18px] font-semibold text-forest">(Retrait en magasin disponible)</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <img src={icClock} alt="" className="block size-[13.333px]" />
              <span className="text-sm leading-[22px] text-ink">{BRAND.hours}</span>
            </div>
            <a href={BRAND.phoneHref} className="flex items-center gap-1">
              <img src={icPhone} alt="" className="block size-3" />
              <span className="text-sm leading-[22px] text-ink">{BRAND.phone}</span>
            </a>
            <a
              href={BRAND.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-forest px-6 py-2 transition-colors hover:bg-[#1c2a19]"
            >
              <img src={icChat} alt="" className="block size-[13.333px]" />
              <span className="text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-white">
                WhatsApp Direct Libraire
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[rgba(196,200,190,0.3)] pt-[17px] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs leading-[18px] text-ink [&_a:hover]:text-gold">
          <span>© {new Date().getFullYear()} {BRAND.shortName}. Tous droits réservés.</span>
          <Link to="/mentions-legales">Mentions Légales</Link>
          <Link to="/cgv">CGV &amp; Rétractation</Link>
          <Link to="/cgu">Politique de Confidentialité RGPD</Link>
        </div>
        <span className="text-[11px] leading-4 font-semibold tracking-[0.66px] text-muted">
          Paiements certifiés : CB • VISA • MASTERCARD • APPLE PAY • PAYPAL
        </span>
      </div>
    </footer>
  );
}
