import { decodeHtml } from "../../utils/decodeHtml";
import "./index.css";

// Bannière du catalogue : reprend l'image de la catégorie sélectionnée
// (WooCommerce) et retombe sur un fond vert sauge sinon.
export default function CatalogueHero({ category, onDiscover, onBrowse }) {
  const image = category?.image?.src;
  const title = category
    ? decodeHtml(category.name)
    : "Livres, Corans & trésors de la librairie";

  return (
    <section
      className={`catalogue-hero${image ? " catalogue-hero--image" : ""}`}
      style={image ? { "--hero-image": `url(${image})` } : undefined}
    >
      <div className="catalogue-hero__content">
        <span className="catalogue-hero__badge">
          {category ? "Rayon" : "Nouvel arrivage — Livres et Coran"}
        </span>
        <h1 className="catalogue-hero__title">{title}</h1>
        <p className="catalogue-hero__text">
          Une sélection rigoureuse d&apos;ouvrages vérifiés avec soin. Profitez
          de nos raretés littéraires, coffrets exclusifs et pièces
          d&apos;exception.
        </p>
        <div className="catalogue-hero__actions">
          <button type="button" className="catalogue-hero__btn" onClick={onDiscover}>
            Découvrir les nouveautés
          </button>
          <button
            type="button"
            className="catalogue-hero__btn catalogue-hero__btn--light"
            onClick={onBrowse}
          >
            Voir tout le catalogue
          </button>
        </div>
      </div>
    </section>
  );
}
