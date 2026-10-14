// Boutons de filtre colorés de la page Enfants — maquettes 137:623 (ordinateur) et 243:41 (mobile)
export default function KidsFilters({ items, active, onSelect }) {
  return (
    <nav aria-label="Filtrer les articles enfants" className="px-4 lg:px-12">
      <ul className="mx-auto grid max-w-[955px] list-none grid-cols-3 gap-2 lg:flex lg:gap-[11px] lg:rounded-[20px] lg:bg-white/70">
        {items.map((item) => {
          const current = item.key === active;
          return (
            <li key={item.key} className="lg:w-[150px] lg:shrink-0">
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                aria-pressed={current}
                className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-lg px-1 font-sans text-xs leading-[18px] font-semibold whitespace-nowrap min-[400px]:text-[13px] lg:tracking-[0.52px] transition-[filter,box-shadow] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:h-[44px] lg:px-4 ${item.pill} ${
                  current ? "shadow-[inset_0_0_0_2px_currentColor]" : ""
                }`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
