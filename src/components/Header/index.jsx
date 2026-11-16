import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Autocomplete from "../Autocomplete";
import { openModal } from "../../slices/modalSlice";
import { logout } from "../../slices/userSlice";

import logoLocal from "/logo.png";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import TopBar from "./topbar";

import searchIcon from "./search.svg";
import heartIcon from "./heart.svg";
import bagIcon from "./bag.svg";
import peopleIcon from "./people.svg";
import logoutIcon from "../../assets/admin/ic-logout.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const logoUrl = useSelector((state) => state.site.logoUrl);
  const isAuthentificated = useSelector((state) => state.user?.token);

  const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const cartBadgeValue = cartCount > 9 ? "9+" : String(cartCount);

  return (
    <>
      <header className="relative z-50 bg-white shadow-xs">
        <TopBar />

        {/* Section centrale : Logo + Recherche + Actions */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-gutter md:gap-6">
          <Link to="/" className="flex min-w-0 items-center gap-3 shrink-0">
            <img src={logoLocal} alt="Accueil Maktaba El Hikma" className="h-20 w-auto object-contain md:h-30" />
            <span className="hidden xl:flex flex-col">
              <small className="font-sans text-[10px] text-[#8C6D23] tracking-widest uppercase mt-1">
                LIBRAIRIE & BOUTIQUE ISLAMIQUE
              </small>
            </span>
          </Link>

          <div className="hidden md:flex min-w-0 flex-1 max-w-xl items-stretch h-11 relative">
            <div className="flex-1 relative [&_input]:w-full [&_input]:h-full [&_input]:bg-[#FAF8F5] [&_input]:border [&_input]:border-r-0 [&_input]:border-gray-200 [&_input]:rounded-l-lg [&_input]:px-4 [&_input]:text-sm [&_input]:outline-none">
              <Autocomplete placeholder="Rechercher un livre, un Coran, un tapis, un coffret..." />
            </div>
            <button
              type="submit"
              aria-label="Rechercher"
              className="bg-[#785E1A] hover:bg-[#624c14] text-white px-5 rounded-r-lg flex items-center justify-center transition-colors shrink-0 border border-l-0 border-[#785E1A]"
            >
              <img src={searchIcon} alt="" className="w-5 h-5 filter invert" />
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0 md:gap-6">
            {isAuthentificated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex min-h-11 min-w-11 items-center justify-center gap-2 text-gray-900 font-medium hover:text-[#785E1A]">
                  <img src={peopleIcon} alt="" className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="sr-only text-sm font-semibold md:not-sr-only">Mon Compte</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/");
                    dispatch(logout());
                  }}
                  className="hidden md:flex cursor-pointer items-center rounded-md border border-line p-1.5 transition-colors hover:bg-mint-soft"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <img src={logoutIcon} alt="" className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center gap-2 text-gray-900 font-medium hover:text-[#785E1A] bg-transparent p-0 border-none cursor-pointer"
                onClick={() => dispatch(openModal({ name: "auth", props: { view: "login" } }))}
              >
                <img src={peopleIcon} alt="" className="w-6 h-6 md:w-5 md:h-5" />
                <span className="sr-only text-sm font-semibold md:not-sr-only">Mon Compte</span>
              </button>
            )}

            <Link
              to={token ? "/profile?section=wishlist" : "/catalogue"}
              aria-label={token ? "Ma liste d'envies" : "Voir le catalogue"}
              className="relative hidden md:block p-1 text-gray-900 hover:text-[#785E1A]"
            >
              <img src={heartIcon} alt="" className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#785E1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/panier" className="group hidden md:flex items-center gap-2 bg-[#B2D1A7] text-forest hover:bg-primary-hover hover:text-white font-bold px-4 py-2 rounded-xl transition-colors">
              <div className="relative">
                <img src={bagIcon} alt="" className="w-5 h-5 group-hover:brightness-0 group-hover:invert" />
                <span className="absolute -top-2 -right-2 bg-[#785E1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartBadgeValue}
                </span>
              </div>
              <span className="uppercase text-xs tracking-wider font-extrabold">PANIER</span>
            </Link>

            <button type="button" className="flex min-h-11 min-w-11 items-center justify-center md:hidden text-2xl p-1 text-gray-800 bg-transparent border-none cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu" aria-expanded={menuOpen} aria-controls="menu-mobile">
              ☰
            </button>
          </div>
        </div>

        <Navbar />

        <MobileMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          cartBadgeValue={cartBadgeValue}
          token={token}
          onLogout={() => dispatch(logout())}
        />
      </header>
    </>
  );
}