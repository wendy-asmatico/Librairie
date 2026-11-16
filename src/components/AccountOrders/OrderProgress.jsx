import { CheckIcon, MapPinIcon, PackageIcon, TruckIcon } from "../Icons";
import { getOrderProgress } from "./progress";

export default function OrderProgress({ order }) {
  const progress = getOrderProgress(order);

  if (!progress) {
    return (
      <div className="rounded-xl border border-line bg-mint/30 px-5 py-4 text-sm text-ink-muted">
        {["pending", "failed"].includes(order.status)
          ? "Le suivi sera disponible après confirmation du paiement."
          : ["on-hold", "on_hold"].includes(order.status)
            ? "Votre commande est en attente. Le suivi sera disponible après sa confirmation."
            : "Le suivi de progression n’est pas disponible pour cette commande."}
      </div>
    );
  }

  const { steps, current, message } = progress;
  return (
    <div className="rounded-xl border border-[#b1d2aa] px-4 py-5 sm:px-6">
      <ol className="grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const reached = index <= current;
          const Icon = index === 1
            ? PackageIcon
            : index === 2 && order.delivery_mode !== "pickup"
              ? TruckIcon
              : order.delivery_mode === "pickup" && index === steps.length - 1
                ? MapPinIcon
                : CheckIcon;
          return (
            <li key={step} aria-current={index === current ? "step" : undefined} className="min-w-0">
              <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${reached ? "bg-[#b1d2aa] text-white" : "bg-[#f0f0ee] text-[#9b9e9a]"} ${index === current ? "ring-4 ring-[#dcebd7]" : ""}`}>
                <Icon size={18} />
              </span>
              <span className={`mt-2 block text-xs sm:text-sm ${reached ? "font-semibold text-forest" : "text-ink-muted"}`}>
                {step}
              </span>
              <span className="sr-only">{index === current ? " — étape actuelle" : index < current ? " — étape atteinte" : " — à venir"}</span>
            </li>
          );
        })}
      </ol>
      <div
        role="progressbar"
        aria-label="Progression de la commande"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`Étape ${current + 1} sur ${steps.length} : ${steps[current]}`}
        className="mt-5 h-2 overflow-hidden rounded-full bg-[#e6e5e0]"
      >
        <div className="h-full rounded-full bg-[#755b1a]" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
      <p className="mt-5 text-sm text-ink-muted">{message}</p>
    </div>
  );
}
