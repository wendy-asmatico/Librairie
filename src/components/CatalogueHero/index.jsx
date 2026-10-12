import heroImage from "../../assets/maktaba/hero.jpg";
import icArrow from "../../assets/maktaba/ic-arrow.svg";
import icBook from "../../assets/maktaba/ic-book.svg";
import "./index.css";

// Bannière du catalogue — maquette « Livres » de Lisa (node 195:36)
export default function CatalogueHero({ onDiscover, onBrowse }) {
  return (
    <section className="catalogue-hero">
      <div className="catalogue-hero__bg" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
      <div className="catalogue-hero__content">
        <span className="catalogue-hero__badge">
          <span className="catalogue-hero__dot" />
          Nouvel arrivage — Livres et coran
        </span>
        <h1 className="catalogue-hero__title">
          Tafsir Ibn Kathir
          <br />
          &amp; Récits Prophétiques
        </h1>
        <p className="catalogue-hero__text">
          Une sélection rigoureuse d&apos;ouvrages vérifiés avec soin. Profitez de nos
          raretés littéraires, coffrets exclusifs et pièces d&apos;exception pour
          illuminer votre foyer et nourrir votre quête de savoir.
        </p>
        <div className="catalogue-hero__actions">
          <button type="button" className="catalogue-hero__btn" onClick={onDiscover}>
            Découvrir les Nouveautés
            <img src={icArrow} alt="" className="catalogue-hero__arrow" />
          </button>
          <button
            type="button"
            className="catalogue-hero__btn catalogue-hero__btn--light"
            onClick={onBrowse}
          >
            <img src={icBook} alt="" className="catalogue-hero__book" />
            Voir le Rayon Livres
          </button>
        </div>
      </div>
    </section>
  );
}
