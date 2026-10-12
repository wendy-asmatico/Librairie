import "./index.css";

const ITEMS = [
  {
    label: "Retrait gratuit en boutique",
    icon: (
      <>
        <path d="M4 10v10h16V10" />
        <path d="M3 10l2-6h14l2 6" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  {
    label: "Livraison soignée",
    icon: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
  },
  {
    label: "Paiement 100% sécurisé",
    icon: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  },
  {
    label: "Conseil & accompagnement",
    icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  },
];

export default function CatalogueTrust() {
  return (
    <ul className="catalogue-trust" aria-label="Nos engagements">
      {ITEMS.map((item) => (
        <li key={item.label} className="catalogue-trust__item">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {item.icon}
          </svg>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
