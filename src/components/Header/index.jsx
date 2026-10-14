import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Autocomplete from "../Autocomplete";
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
  const [isHidden, setIsHidden] = useState(false);


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const logoUrl = useSelector((state) => state.site.logoUrl);
  const isAuthentificated = useSelector((state) => state.user?.token);

  const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const cartBadgeValue = cartCount > 9 ? "9+" : String(cartCount);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const updateScroll = () => {
      const y = window.scrollY;
      if (y <= 0) {
        setIsHidden(false);
        lastScrollY = 0;
        ticking = false;
        return;
      }
      const delta = y - lastScrollY;
      if (Math.abs(delta) > 10) {
        setIsHidden(delta > 0);
        lastScrollY = y;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white shadow-xs transition-transform duration-300 ${isHidden ? "-translate-y-full" : "translate-y-0"}`}>
        <TopBar />

        {/* Section centrale : Logo + Recherche + Actions */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logoLocal} alt="Logo" className="h-30 w-auto object-contain" />
            <span className="flex flex-col">
              <small className="font-sans text-[10px] text-[#8C6D23] tracking-widest uppercase mt-1">
                LIBRAIRIE & BOUTIQUE ISLAMIQUE
              </small>
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl items-stretch h-11 relative">
            <div className="flex-1 relative [&_input]:w-full [&_input]:h-full [&_input]:bg-[#FAF8F5] [&_input]:border [&_input]:border-r-0 [&_input]:border-gray-200 [&_input]:rounded-l-lg [&_input]:px-4 [&_input]:text-sm [&_input]:outline-none">
              <Autocomplete placeholder="Rechercher un livre, un Coran, un tapis, un coffret..." />
            </div>
            <button
              type="submit"
              className="bg-[#785E1A] hover:bg-[#624c14] text-white px-5 rounded-r-lg flex items-center justify-center transition-colors shrink-0 border border-l-0 border-[#785E1A]"
            >
              <img src={searchIcon} alt="" className="w-5 h-5 filter invert" />
            </button>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {isAuthentificated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 text-gray-900 font-medium hover:text-[#785E1A]">
                  <img src={peopleIcon} alt="" className="w-5 h-5" />
                  <span className="text-sm font-semibold">Mon Compte</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/connexion");
                    dispatch(logout());
                  }}
                  className="flex cursor-pointer items-center rounded-md border border-line p-1.5 transition-colors hover:bg-mint-soft"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <img src={logoutIcon} alt="" className="size-4" />
                </button>
              </div>
            ) : (
              <Link to="/connexion" className="hidden sm:flex items-center gap-2 text-gray-900 font-medium hover:text-[#785E1A]">
                <img src={peopleIcon} alt="" className="w-5 h-5" />
                <span className="text-sm font-semibold">Mon Compte</span>
              </Link>
            )}

            <Link to="/wishlist" className="relative p-1 text-gray-900 hover:text-[#785E1A]">
              <img src={heartIcon} alt="" className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#785E1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/panier" className="flex items-center gap-2 bg-[#B2D1A7] hover:bg-primary-hover text-white font-bold px-4 py-2 rounded-xl transition-colors">
              <div className="relative">
                <img src={bagIcon} alt="" className="w-5 h-5 brightness-0 invert" />
                <span className="absolute -top-2 -right-2 bg-[#785E1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartBadgeValue}
                </span>
              </div>
              <span className="uppercase text-xs tracking-wider font-extrabold">PANIER</span>
            </Link>

            <button className="md:hidden text-2xl p-1 text-gray-800 bg-transparent border-none cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
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