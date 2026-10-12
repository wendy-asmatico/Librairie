import { Link } from "react-router-dom";
import "./index.css";

// Bloc "Coffrets cadeaux" en bas du catalogue (cf. maquette de Lisa).
export default function CatalogueGift({ category, onSelect }) {
  const image = category?.image?.src;

  return (
    <section className="catalogue-gift">
      <div
        className="catalogue-gift__visual"
        style={image ? { "--gift-image": `url(${image})` } : undefined}
        aria-hidden="true"
      />
      <div className="catalogue-gift__content">
        <span className="catalogue-gift__badge">
          Service personnalisé & cadeaux uniques
        </span>
        <h2 className="catalogue-gift__title">Coffrets Cadeaux</h2>
        <p className="catalogue-gift__text">
          Offrez un présent soigné dans les moindres détails.
        </p>
        <div className="catalogue-gift__actions">
          <button
            type="button"
            className="catalogue-gift__btn"
            onClick={onSelect}
            disabled={!category}
          >
            Regarder nos coffrets cadeaux
          </button>
          <Link className="catalogue-gift__btn catalogue-gift__btn--light" to="/contact">
            Créer un coffret personnalisé
          </Link>
        </div>
      </div>
    </section>
  );
}
