import { Link } from "react-router-dom";

import { BagIcon } from "../Icons";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 px-2 py-[clamp(3rem,8vw,5rem)] text-center">
      <span
        aria-hidden="true"
        className="flex size-18 items-center justify-center rounded-full bg-mint text-leaf"
      >
        <BagIcon size={30} strokeWidth={1.8} />
      </span>
      <h2 className="font-serif text-[1.625rem] leading-tight font-semibold text-forest">
        Votre panier est vide
      </h2>
      <p className="max-w-105 text-md leading-relaxed text-pretty text-ink-soft">
        Parcourez nos rayons pour retrouver livres, vêtements et coffrets.
      </p>
      <Link
        to="/catalogue"
        className="mt-2 flex h-12.5 items-center justify-center rounded-control bg-secondary px-6.5 text-sm font-bold text-white transition-colors hover:bg-secondary-hover"
      >
        Voir les nouveautés
      </Link>
    </div>
  );
}
