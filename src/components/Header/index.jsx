import "./index.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Autocomplete from "../Autocomplete";
import { logout } from "../../slices/userSlice";
import { openModal } from "../../slices/modalSlice";
import { setFilters } from "../../slices/filtersSlice";
import { fetchCategoriesThunk } from "../../thunkActionsCreator/categoriesThunks";
import { BRAND } from "../../brand";

import logo from "../../assets/maktaba/logo.png";
import icGift from "../../assets/maktaba/ic-gift.svg";
import icPhone from "../../assets/maktaba/ic-phone.svg";
import icWhatsapp from "../../assets/maktaba/ic-whatsapp.svg";
import icSearch from "../../assets/maktaba/ic-search.svg";
import icUser from "../../assets/maktaba/ic-user.svg";
import icHeart from "../../assets/maktaba/ic-heart.svg";
import icBag from "../../assets/maktaba/ic-bag.svg";
import icChevron from "../../assets/maktaba/ic-chevron.svg";

// Menu de la maquette : chaque rayon pointe vers la catégorie WooCommerce
// dont le nom/slug correspond (sinon vers tout le catalogue).
const NAV = [
  { key: "home", label: "Accueil", to: "/" },
  { key: "new", label: "Nouveautés", sort: true },
  { key: "books", label: "Livres & Coran", match: /livre|coran/i, chevron: true },
  { key: "clothes", label: "Vêtements", match: /v[eê]tement/i, chevron: true },
  { key: "accessories", label: "Accessoires", match: /accessoire/i, chevron: true },
  { key: "kids", label: "Enfants", match: /enfant/i },
  { key: "gifts", label: "Coffrets Cadeaux", match: /coffret/i },
];

const badge = (n) => (n > 9 ? "9+" : String(n));

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state) => state.user.token);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const categories = useSelector((state) => state.categories.items);
  const filters = useSelector((state) => state.filters);

  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoriesThunk());
  }, [dispatch, categories.length]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const categoryFor = (item) =>
    item.match ? categories.find((cat) => item.match.test(`${cat.slug} ${cat.name}`)) : null;

  const isActive = (item) => {
    if (item.to) return location.pathname === item.to;
    if (location.pathname !== "/catalogue") return false;
    const cat = categoryFor(item);
    if (item.sort) return !filters.category && !filters.search;
    return !!cat && filters.category === String(cat.id);
  };

  const goTo = (item) => {
    closeMenu();
    if (item.to) {
      navigate(item.to);
      return;
    }
    const cat = categoryFor(item);
    dispatch(
      setFilters({
        category: cat ? String(cat.id) : "",
        search: "",
        ...(item.sort ? { orderby: "date", order: "desc" } : {}),
      }),
    );
    navigate("/catalogue");
  };

  const openAccount = () => {
    closeMenu();
    if (token) navigate("/profile");
    else dispatch(openModal({ name: "auth", props: { view: "login" } }));
  };

  return (
    <header className="mk-header">
      <div className="mk-header__topbar">
        <div className="mk-header__topbar-left">
          <img src={icGift} alt="" className="mk-header__topbar-icon" />
          <span>
            Livraison sous 1 semaine ou <strong>Retrait gratuit en boutique</strong>
          </span>
          <span className="mk-header__sep" aria-hidden="true">
            |
          </span>
          <span className="mk-header__hide-sm">Paiement 100% sécurisé</span>
        </div>
        <div className="mk-header__topbar-right">
          <a href={BRAND.phoneHref} className="mk-header__topbar-link">
            <img src={icPhone} alt="" className="mk-header__topbar-icon mk-header__topbar-icon--sm" />
            <span>Service client : {BRAND.phone}</span>
          </a>
          <a
            href={BRAND.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mk-header__topbar-link mk-header__topbar-link--gold"
          >
            <img src={icWhatsapp} alt="" className="mk-header__topbar-icon" />
            <span>WhatsApp Conseil Direct</span>
          </a>
        </div>
      </div>

      <div className="mk-header__main">
        <button
          type="button"
          className="mk-header__burger"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="mk-header__brand" aria-label={`${BRAND.name} — accueil`}>
          <span className="mk-header__logo">
            <img src={logo} alt={BRAND.name} />
          </span>
          <span className="mk-header__tagline">Librairie &amp; boutique islamique</span>
        </Link>

        <div className="mk-header__search">
          <Autocomplete placeholder="Rechercher un livre, un Coran, un tapis, un coffret..." />
          <Link to="/catalogue" className="mk-header__search-btn" aria-label="Rechercher">
            <img src={icSearch} alt="" />
          </Link>
        </div>

        <div className="mk-header__actions">
          <button type="button" className="mk-header__account" onClick={openAccount}>
            <img src={icUser} alt="" />
            <span>Mon Compte</span>
          </button>

          <Link
            to="/wishlist"
            className="mk-header__wish"
            aria-label={`Coups de cœur (${wishlistItems.length})`}
          >
            <img src={icHeart} alt="" />
            <span className="mk-header__badge mk-header__badge--gold">
              {badge(wishlistItems.length)}
            </span>
          </Link>

          <Link to="/panier" className="mk-header__cart" aria-label={`Panier (${cartCount})`}>
            <span className="mk-header__cart-icon">
              <img src={icBag} alt="" />
              <span className="mk-header__badge mk-header__badge--cream">{badge(cartCount)}</span>
            </span>
            <span className="mk-header__cart-label">Panier</span>
          </Link>
        </div>
      </div>

      <nav className="mk-header__nav" aria-label="Rayons">
        <ul>
          {NAV.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`mk-header__nav-link${isActive(item) ? " is-active" : ""}`}
                aria-current={isActive(item) ? "page" : undefined}
                onClick={() => goTo(item)}
              >
                {item.label}
                {item.chevron && <img src={icChevron} alt="" className="mk-header__chevron" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu latéral mobile */}
      <div
        className={`mk-drawer__overlay${menuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <aside
        className={`mk-drawer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen ? "" : undefined}
      >
        <div className="mk-drawer__head">
          <span className="mk-drawer__title">Menu</span>
          <button type="button" className="mk-drawer__close" onClick={closeMenu} aria-label="Fermer le menu">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <ul className="mk-drawer__links">
          {NAV.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={isActive(item) ? "is-active" : ""}
                onClick={() => goTo(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <Link to="/blog" onClick={closeMenu}>
              Blog
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>
          </li>
        </ul>
        <div className="mk-drawer__footer">
          <button type="button" className="mk-drawer__btn" onClick={openAccount}>
            {token ? "Mon compte" : "Se connecter"}
          </button>
          {token && (
            <button
              type="button"
              className="mk-drawer__btn mk-drawer__btn--logout"
              onClick={() => {
                closeMenu();
                dispatch(logout());
              }}
            >
              Déconnexion
            </button>
          )}
        </div>
      </aside>
    </header>
  );
}
