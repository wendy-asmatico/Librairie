import { useEffect, useState } from "react";
import icStore from "../../assets/images/ic-store.svg";
import icBox from "../../assets/images/ic-box.svg";
import icLock from "../../assets/images/ic-lock.svg";
import icSupport from "../../assets/images/ic-support.svg";

const DEFAULT_ITEMS = [
  { label: "Retrait Gratuit en Boutique", icon: icStore, size: "h-[18px] w-[20.094px]" },
  { label: "Livraison Soignée", icon: icBox, size: "size-5" },
  { label: "Paiement 100% sécurisé", icon: icLock, size: "h-[21px] w-4" },
  { label: "Conseil & Accompagnement", icon: icSupport, size: "h-[18px] w-5" },
];

export default function Trust() {
  const [items, setItems] = useState(DEFAULT_ITEMS);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/trust-settings`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Impossible de charger les engagements ACF.");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.items)) return;
        setItems((currentItems) =>
          currentItems.map((item, index) => ({
            ...item,
            label: data.items[index]?.trim() || item.label,
          })),
        );
      })
      .catch(() => {
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="bg-white" aria-label="Nos engagements">
      <ul className="mx-auto grid max-w-[1109px] list-none grid-cols-2 gap-x-4 gap-y-3 px-4 py-[18px] lg:flex lg:min-h-[77px] lg:items-center lg:justify-between lg:p-0">
        {items.map((item) => (
          <li key={item.icon} className="flex items-center gap-3.5">
            <img src={item.icon} alt="" className={`block shrink-0 ${item.size}`} />
            <span className="font-sans text-[13px] leading-[1.35] font-bold text-gold lg:text-base lg:leading-6 lg:whitespace-nowrap">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}