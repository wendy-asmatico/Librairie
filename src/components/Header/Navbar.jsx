import useRayonNav from "./useRayonNav";

export default function Navbar() {
  const { items, isActive, goTo } = useRayonNav();

  return (
    <nav className="bg-[#EEF4EC] border-t border-emerald-100/60 hidden md:block py-1" aria-label="Rayons">
      <ul className="max-w-7xl mx-auto px-6 flex justify-center gap-2 text-sm font-semibold text-gray-800 list-none m-0">
        {items.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => goTo(item)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-lg border-none cursor-pointer font-semibold transition-colors ${
                  active
                    ? "bg-[#DCE7D8] text-[#2A3B28] font-bold"
                    : "bg-transparent text-gray-800 hover:text-[#785E1A]"
                }`}
              >
                <span>{item.label}</span>
                {item.chevron && <span className="text-[10px]">▾</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
