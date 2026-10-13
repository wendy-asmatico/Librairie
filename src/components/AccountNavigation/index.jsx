import { Link } from "react-router-dom";
import {
  HeartIcon,
  MapPinIcon,
  PackageIcon,
  UserIcon,
  ViewGridIcon,
} from "../Icons";

const sections = [
  { id: "overview", label: "Vue d'ensemble", Icon: ViewGridIcon },
  { id: "profile", label: "Mes informations", Icon: UserIcon },
  { id: "addresses", label: "Mes adresses", Icon: MapPinIcon },
  { id: "orders", label: "Mes commandes", Icon: PackageIcon },
];

export default function AccountNavigation({ activeSection, onSelect }) {
  return (
    <aside aria-label="Navigation du compte" className="min-w-0">
      <nav className="flex gap-1 overflow-x-auto border-b border-line pb-2 lg:sticky lg:top-6 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
        {sections.map(({ id, label, Icon }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect(id)}
              className={`flex shrink-0 items-center gap-3 rounded-control px-3 py-3 text-left text-sm font-medium transition-colors ${
                active
                  ? "bg-forest text-white"
                  : "text-ink-soft hover:bg-mint hover:text-forest"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
        <Link
          to="/wishlist"
          className="flex shrink-0 items-center gap-3 rounded-control px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-mint hover:text-forest"
        >
          <HeartIcon size={18} />
          Mes favoris
        </Link>
      </nav>
    </aside>
  );
}