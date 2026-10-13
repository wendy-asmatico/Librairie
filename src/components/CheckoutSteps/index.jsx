import { Link } from "react-router-dom";
import { CheckIcon } from "../Icons";

const STEPS = [
  { label: "Panier", to: "/panier" },
  { label: "Livraison" },
  { label: "Paiement" },
];

// Progression du tunnel de commande ; `current` est l'index de l'étape en cours.
export default function CheckoutSteps({ current }) {
  return (
    <ol
      aria-label="Étapes de commande"
      className="flex min-w-0 items-center gap-[clamp(0.375rem,1.4vw,0.75rem)] text-caption font-semibold"
    >
      {STEPS.map(({ label, to }, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        return (
          <li
            key={label}
            aria-current={isCurrent ? "step" : undefined}
            className={`flex min-w-0 items-center gap-[clamp(0.375rem,1.4vw,0.75rem)] ${
              isDone || isCurrent ? "text-forest" : "text-ink-muted"
            }`}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className="h-px w-[clamp(0.625rem,3vw,2.25rem)] shrink bg-line-strong"
              />
            )}
            <span className="flex shrink-0 items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs ${
                  isDone || isCurrent
                    ? "bg-forest text-white"
                    : "border-[1.5px] border-line-strong"
                }`}
              >
                {isDone ? <CheckIcon size={14} strokeWidth={2.4} /> : index + 1}
              </span>
              {isDone && to ? (
                <Link to={to} className="transition-colors hover:text-secondary">
                  {label}
                </Link>
              ) : (
                label
              )}
              {isDone && <span className="sr-only">(étape terminée)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
