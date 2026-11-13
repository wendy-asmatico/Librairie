import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Autocomplete from "../Autocomplete";
import useRayonNav from "./useRayonNav";

export default function MobileMenu({ isOpen, onClose, cartBadgeValue, token, onLogout }) {
  const { items, isActive, goTo } = useRayonNav(onClose);
  const menuRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen || window.matchMedia("(min-width: 768px)").matches) return;
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (menuRef.current?.contains(document.activeElement) && previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        id="menu-mobile"
        ref={menuRef}
        className={`fixed top-0 right-0 z-50 w-4/5 max-w-xs h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col p-6 ${
          isOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-[#8C6D23]">MENU</span>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Fermer le menu" className="text-xl p-1 bg-transparent border-none">✕</button>
        </div>

        <div className="mb-6">
          <Autocomplete placeholder="Recherche..." />
        </div>

        <nav className="flex flex-col gap-4 font-medium text-gray-800 flex-1">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => goTo(item)}
              aria-current={isActive(item) ? "page" : undefined}
              className={`text-left bg-transparent border-none p-0 cursor-pointer ${
                isActive(item) ? "text-[#2A3B28] font-bold" : "text-gray-800 font-medium"
              }`}
            >
              {item.label}
            </button>
          ))}
          <Link to="/contact" onClick={onClose}>Contact</Link>
        </nav>

        <div className="border-t pt-4 space-y-3">
          <Link
            to="/panier"
            onClick={onClose}
            className="flex justify-between items-center bg-[#B1D2AA] p-3 rounded-lg font-bold text-[#2A3B28]"
          >
            <span>PANIER</span>
            <span>{cartBadgeValue}</span>
          </Link>
          {token && (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="text-red-600 font-medium text-left w-full bg-transparent border-none p-0"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </>
  );
}