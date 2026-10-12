import "./index.css";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setFilters } from "../../slices/filtersSlice";
import { BRAND } from "../../brand";
import logoRound from "../../assets/maktaba/logo-round.jpg";
import icStar from "../../assets/maktaba/ic-star.svg";
import icPin from "../../assets/maktaba/ic-pin.svg";
import icClock from "../../assets/maktaba/ic-clock.svg";
import icPhone from "../../assets/maktaba/ic-phone-dark.svg";
import icChat from "../../assets/maktaba/ic-chat.svg";

const RAYONS = [
  { label: "Livres du Saint Coran & Tafsir", match: /livre|coran/i },
  { label: "Recueils de Hadiths & Fiqh classique", match: /hadith|fiqh|livre/i },
  { label: "Vêtements pudiques Homme & Femme", match: /v[eê]tement/i },
  { label: "Tapis d'artisanat & Parfums de Dubaï", match: /tapis|parfum/i },
  { label: "Univers Éducatif & Éveil Enfants", match: /enfant/i },
  { label: "Coffrets Cadeaux Ciselés sur Mesure", match: /coffret/i },
];

const SERVICES = [
  { label: "Retrait gratuit à notre boutique", to: "/contact" },
  { label: "Modalités et délais d'expédition", to: "/cgv" },
  { label: "Suivre l'état de ma commande", to: "/profile" },
  { label: "Devis & Coffrets sur mesure pro/famille", to: "/contact" },
  { label: "Centre d'Aide & Foire aux questions", to: "/contact" },
];

export default function Footer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.items);

  const openRayon = (match) => {
    const cat = categories.find((c) => match.test(`${c.slug} ${c.name}`));
    dispatch(setFilters({ category: cat ? String(cat.id) : "", search: "" }));
    navigate("/catalogue");
  };

  return (
    <footer className="mk-footer">
      <div className="mk-footer__grid">
        <div className="mk-footer__col">
          <div className="mk-footer__brand">
            <span className="mk-footer__logo">
              <img src={logoRound} alt="" />
            </span>
            <span className="mk-footer__name">{BRAND.shortName}</span>
          </div>
          <p className="mk-footer__text">Librairie et boutique Islamique</p>
          <div className="mk-footer__rating">
            <span className="mk-footer__stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <img key={i} src={icStar} alt="" />
              ))}
            </span>
            <span>4.9/5 sur Google (380+ avis)</span>
          </div>
        </div>

        <div className="mk-footer__col">
          <h4 className="mk-footer__title">Rayons &amp; Produits</h4>
          <ul className="mk-footer__list">
            {RAYONS.map((item) => (
              <li key={item.label}>
                <button type="button" onClick={() => openRayon(item.match)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mk-footer__col">
          <h4 className="mk-footer__title">Services &amp; Commandes</h4>
          <ul className="mk-footer__list">
            {SERVICES.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mk-footer__col">
          <h4 className="mk-footer__title">Contact &amp; Librairie</h4>
          <div className="mk-footer__contact">
            <div className="mk-footer__contact-row mk-footer__contact-row--top">
              <img src={icPin} alt="" className="mk-footer__pin" />
              <div>
                <span className="mk-footer__contact-text">{BRAND.address}</span>
                <span className="mk-footer__contact-note">(Retrait en magasin disponible)</span>
              </div>
            </div>
            <div className="mk-footer__contact-row">
              <img src={icClock} alt="" className="mk-footer__icon" />
              <span className="mk-footer__contact-text">{BRAND.hours}</span>
            </div>
            <a href={BRAND.phoneHref} className="mk-footer__contact-row">
              <img src={icPhone} alt="" className="mk-footer__icon mk-footer__icon--sm" />
              <span className="mk-footer__contact-text">{BRAND.phone}</span>
            </a>
            <a
              href={BRAND.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mk-footer__whatsapp"
            >
              <img src={icChat} alt="" />
              <span>WhatsApp Direct Libraire</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mk-footer__bottom">
        <div className="mk-footer__legal">
          <span>© {new Date().getFullYear()} {BRAND.shortName}. Tous droits réservés.</span>
          <Link to="/mentions-legales">Mentions Légales</Link>
          <Link to="/cgv">CGV &amp; Rétractation</Link>
          <Link to="/cgu">Politique de Confidentialité RGPD</Link>
        </div>
        <span className="mk-footer__payments">
          Paiements certifiés : CB • VISA • MASTERCARD • APPLE PAY • PAYPAL
        </span>
      </div>
    </footer>
  );
}
