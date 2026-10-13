import { Link } from "react-router-dom";

// `items` : [{ label, to }] ; le dernier élément désigne la page courante.
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
        {items.map(({ label, to }, index) => {
          const isCurrentPage = index === items.length - 1;
          return (
            <li key={label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isCurrentPage ? (
                <span aria-current="page" className="font-medium text-ink">
                  {label}
                </span>
              ) : (
                <Link to={to} className="transition-colors hover:text-secondary">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
