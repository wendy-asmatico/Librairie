import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-[#EEF4EC] border-t border-emerald-100/60 hidden md:block py-1">
      <div className="max-w-7xl mx-auto px-6 flex  gap-2 text-sm font-semibold text-gray-800">
        <Link to="/" className="bg-[#DCE7D8] text-[#2A3B28] px-4 py-1.5 rounded-lg font-bold">
          Accueil
        </Link>
        <Link to="/nouveautes" className="px-4 py-1.5 hover:text-[#785E1A] transition-colors">
          Nouveautés
        </Link>
        <div className="px-4 py-1.5 hover:text-[#785E1A] cursor-pointer flex items-center gap-1">
          <span>Livres & Coran</span>
          <span className="text-[10px]">▾</span>
        </div>
        <div className="px-4 py-1.5 hover:text-[#785E1A] cursor-pointer flex items-center gap-1">
          <span>Vêtements</span>
          <span className="text-[10px]">▾</span>
        </div>
        <div className="px-4 py-1.5 hover:text-[#785E1A] cursor-pointer flex items-center gap-1">
          <span>Accessoires</span>
          <span className="text-[10px]">▾</span>
        </div>
        <Link to="/enfants" className="px-4 py-1.5 hover:text-[#785E1A] transition-colors">
          Enfants
        </Link>
        <Link to="/coffrets" className="px-4 py-1.5 hover:text-[#785E1A] transition-colors">
          Coffrets Cadeaux
        </Link>
      </div>
    </nav>
  );
}