import { MinusIcon, PlusIcon } from "../Icons";

const stepButtonClassName =
  "flex h-full w-11 items-center justify-center bg-transparent text-ink transition-colors enabled:hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40";

export default function QuantityStepper({
  value,
  min = 1,
  max = Infinity,
  step = 1,
  onChange,
  label,
  disabled = false,
  className = "",
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex h-11 w-max items-center rounded-control border-[1.5px] border-line-strong md:h-11.5 ${className}`}
    >
      <button
        type="button"
        aria-label="Diminuer la quantité"
        disabled={disabled || value - step < min}
        onClick={() => onChange(value - step)}
        className={stepButtonClassName}
      >
        <MinusIcon />
      </button>
      {/* <output> est une région live : chaque nouvelle quantité est annoncée. */}
      <output className="min-w-7 text-center text-md font-semibold">{value}</output>
      <button
        type="button"
        aria-label="Augmenter la quantité"
        disabled={disabled || value + step > max}
        onClick={() => onChange(value + step)}
        className={stepButtonClassName}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
