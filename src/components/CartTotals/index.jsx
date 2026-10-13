import { useSelector } from "react-redux";

import { selectCartSummary } from "../../slices/cartSlice";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";
import { pluralize } from "../../utils/pluralize";

function TotalsRow({ label, value, className = "", valueClassName = "text-ink" }) {
  return (
    <div className={`flex justify-between gap-3 ${className}`}>
      <dt>{label}</dt>
      <dd className={`font-semibold whitespace-nowrap ${valueClassName}`}>
        {value}
      </dd>
    </div>
  );
}

function ShippingRow({ shipping: { label, amount }, currency }) {
  const [value, valueClassName] =
    amount === null
      ? ["Calculée à l’étape suivante", "font-normal text-ink-muted"]
      : amount === 0
        ? ["Gratuit", "text-success"]
        : [formatPrice(amount, currency), "text-ink"];

  return (
    <TotalsRow
      label={decodeHtml(label)}
      value={value}
      valueClassName={valueClassName}
    />
  );
}

export default function CartTotals() {
  const summary = useSelector(selectCartSummary);
  if (!summary) return null;

  const { currency, itemCount, subtotal, fees, discounts, shipping, total } =
    summary;

  return (
    <div className="border-t border-line-strong pt-5">
      <dl className="flex flex-col gap-3 text-sm text-ink-soft">
        <TotalsRow
          label={`Sous-total (${pluralize(itemCount, "article")})`}
          value={formatPrice(subtotal, currency)}
        />
        {fees.map(({ key, name, amount }) => (
          <TotalsRow
            key={key}
            label={decodeHtml(name)}
            value={formatPrice(amount, currency)}
          />
        ))}
        {discounts.map(({ code, amount }) => (
          <TotalsRow
            key={code}
            label={`Remise ${code.toUpperCase()}`}
            value={`−${formatPrice(amount, currency)}`}
            className="text-success"
            valueClassName="text-success"
          />
        ))}
        {shipping && <ShippingRow shipping={shipping} currency={currency} />}
      </dl>

      <dl className="mt-4.5 border-t border-line-strong pt-4.5">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="flex flex-col gap-1.5">
            <span className="text-md leading-none font-bold text-ink">Total</span>
            <span className="text-xs leading-none text-ink-muted">TVA incluse</span>
          </dt>
          <dd className="font-serif text-amount font-semibold whitespace-nowrap text-ink">
            {formatPrice(total, currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
