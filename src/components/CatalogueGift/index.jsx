import { Link } from "react-router-dom";
import coffretsImage from "../../assets/maktaba/coffrets.jpg";
import motif from "../../assets/maktaba/coffrets-motif.svg";
import icBadge from "../../assets/maktaba/ic-badge-star.svg";
import "./index.css";

// Bloc « Coffrets Cadeaux » — maquette de Lisa (nodes 195:439 + 195:300)
export default function CatalogueGift({ onSelect }) {
  return (
    <section className="catalogue-gift">
      <div className="catalogue-gift__visual">
        <img src={coffretsImage} alt="Coffret cadeau : Coran, citadelle du musulman, parfum et tasbih" />
      </div>
      <div className="catalogue-gift__panel">
        <img src={motif} alt="" className="catalogue-gift__motif" aria-hidden="true" />
        <div className="catalogue-gift__content">
          <span className="catalogue-gift__badge">
            <img src={icBadge} alt="" />
            Service personnalisé &amp; cadeaux uniques
          </span>
          <h2 className="catalogue-gift__title">Coffrets Cadeaux</h2>
          <p className="catalogue-gift__text">
            Offrez un présent soigné dans les moindres détails.
          </p>
          <div className="catalogue-gift__actions">
            <button type="button" className="catalogue-gift__btn" onClick={onSelect}>
              Regarder nos coffrets cadeaux
            </button>
            <Link className="catalogue-gift__btn catalogue-gift__btn--light" to="/contact">
              Créer un coffret cadeau personnalisé
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
