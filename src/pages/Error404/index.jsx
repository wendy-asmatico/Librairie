import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Seo from "../../components/Seo";
import { setFilters } from "../../slices/filtersSlice";
import { RAYONS } from "../../brand";
import icBook from "../../assets/images/ic-book.svg";

// Page 404 — pas de maquette dédiée : reprend les couleurs, polices et
// boutons des maquettes de Lisa (Catalogue, Contact)
export default function Error404() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openRayon = (slug) => {
    dispatch(setFilters({ category: slug, search: "" }));
    navigate("/catalogue");
  };

  return (
    <section
      aria-labelledby="error-404-title"
      className="relative w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#fff_0%,var(--color-ivory)_55%,var(--color-mint-soft)_100%)] px-4 py-16 font-sans lg:px-12 lg:py-24"
    >
      <Seo title="Page introuvable" noIndex />

      <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
        <p
          aria-hidden="true"
          className="flex items-center gap-3 font-serif text-[96px] leading-none font-bold text-gold select-none lg:gap-5 lg:text-[160px]"
        >
          <span>4</span>
          <span className="flex size-[78px] translate-y-[0.2em] items-center justify-center rounded-full border-2 border-cream bg-white shadow-[0_8px_24px_rgba(119,90,25,0.12)] lg:size-[128px]">
            <img src={icBook} alt="" width="12.8333" height="9.33333" className="h-[26px] w-[36px] lg:h-[42px] lg:w-[58px]" />
          </span>
          <span>4</span>
        </p>

        <span className="mt-8 inline-flex rounded-full bg-leaf-soft px-3 py-1 text-xs leading-4 font-semibold tracking-[0.6px] text-stock uppercase lg:mt-10">
          Erreur 404
        </span>

        <h1
          id="error-404-title"
          className="mt-4 font-serif text-[28px] leading-9 font-bold text-forest-deep lg:text-[40px] lg:leading-[52px]"
        >
          Cette page s’est égarée
        </h1>
        <p className="mt-3 max-w-[480px] text-sm leading-[22px] text-pretty text-[#444841] lg:text-base lg:leading-[26px]">
          La page que vous cherchez n’existe pas ou a été déplacée. Retournez à
          l’accueil ou parcourez nos rayons : nos livres vous attendent.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 min-[480px]:w-auto min-[480px]:flex-row">
          <Link
            to="/"
            className="flex h-12.5 items-center justify-center rounded-control bg-secondary px-6.5 text-sm font-bold text-white transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Retour à l’accueil
          </Link>
          <Link
            to="/catalogue"
            className="flex h-12.5 items-center justify-center rounded-control border border-gold bg-white px-6.5 text-sm font-bold text-gold transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Voir le catalogue
          </Link>
        </div>

        <nav aria-label="Nos rayons" className="mt-12 w-full border-t border-line pt-8">
          <p className="text-xs leading-4 font-semibold tracking-[0.6px] text-muted uppercase">
            Ou explorez nos rayons
          </p>
          <ul className="mt-4 flex list-none flex-wrap justify-center gap-2">
            {RAYONS.map((rayon) => (
              <li key={rayon.key}>
                <button
                  type="button"
                  onClick={() => openRayon(rayon.slug)}
                  className="cursor-pointer rounded-full border border-line-strong bg-white px-4 py-2 text-sm leading-5 font-medium text-forest transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {rayon.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
