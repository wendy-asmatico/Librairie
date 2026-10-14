import icStore from "../../assets/images/ic-store.svg";
import icBox from "../../assets/images/ic-box.svg";
import icLock from "../../assets/images/ic-lock.svg";
import icSupport from "../../assets/images/ic-support.svg";

const ITEMS = [
  { label: "Retrait Gratuit en Boutique", icon: icStore, size: "h-[18px] w-[20.094px]" },
  { label: "Livraison Soignée", icon: icBox, size: "size-5" },
  { label: "Paiement 100% sécurisé", icon: icLock, size: "h-[21px] w-4" },
  { label: "Conseil & Accompagnement", icon: icSupport, size: "h-[18px] w-5" },
];

export default function Trust() {
  return (
    <section className="bg-white" aria-label="Nos engagements">
      <ul className="mx-auto grid max-w-[1109px] list-none grid-cols-2 gap-x-4 gap-y-3 px-4 py-[18px] lg:flex lg:min-h-[77px] lg:items-center lg:justify-between lg:p-0">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-3.5">
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