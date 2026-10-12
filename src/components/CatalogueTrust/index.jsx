import icStore from "../../assets/maktaba/ic-store.svg";
import icBox from "../../assets/maktaba/ic-box.svg";
import icLock from "../../assets/maktaba/ic-lock.svg";
import icSupport from "../../assets/maktaba/ic-support.svg";
import "./index.css";

// Bandeau de réassurance — node 195:5
const ITEMS = [
  { label: "Retrait Gratuit en Boutique", icon: icStore, w: 20.094, h: 18 },
  { label: "Livraison Soignée", icon: icBox, w: 20, h: 20 },
  { label: "Paiement 100% sécurisé", icon: icLock, w: 16, h: 21 },
  { label: "Conseil & Accompagnement", icon: icSupport, w: 20, h: 18 },
];

export default function CatalogueTrust() {
  return (
    <section className="catalogue-trust" aria-label="Nos engagements">
      <ul className="catalogue-trust__list">
        {ITEMS.map((item) => (
          <li key={item.label} className="catalogue-trust__item">
            <img src={item.icon} alt="" style={{ width: item.w, height: item.h }} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
