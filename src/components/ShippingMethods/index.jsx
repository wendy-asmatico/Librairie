import { useDispatch, useSelector } from "react-redux";

import { showToast } from "../../slices/toastSlice";
import { selectShippingRateThunk } from "../../thunkActionsCreator/cartThunks";
import { decodeHtml } from "../../utils/decodeHtml";
import { formatPrice } from "../../utils/formatPrice";

// Adresse du point de retrait, ou délai annoncé pour une livraison.
const describeRate = (rate) =>
  rate.meta_data?.find(({ key }) => key === "pickup_address")?.value ||
  rate.description ||
  rate.delivery_time;

export default function ShippingMethods() {
  const dispatch = useDispatch();
  const packages = useSelector((state) => state.cart.shipping_rates);
  const needsShipping = useSelector((state) => state.cart.needs_shipping);

  if (!needsShipping) return null;

  if (packages.length === 0) {
    return (
      <p className="text-caption text-ink-muted">
        Les modes de livraison vous seront proposés à l’étape suivante.
      </p>
    );
  }

  const selectRate = (packageId, rateId) =>
    dispatch(selectShippingRateThunk({ packageId, rateId }))
      .unwrap()
      .catch((message) => dispatch(showToast(message)));

  return packages.map((shippingPackage) => (
    <fieldset
      key={shippingPackage.package_id}
      className="flex min-w-0 flex-col gap-2.5"
    >
      <legend className="mb-3 text-sm leading-none font-semibold text-ink">
        Mode de réception
        {packages.length > 1 && ` — ${decodeHtml(shippingPackage.name)}`}
      </legend>
      {shippingPackage.shipping_rates.map((rate) => {
        const price = Number(rate.price) + Number(rate.taxes);
        const description = describeRate(rate);
        return (
          <label
            key={rate.rate_id}
            className="flex cursor-pointer items-start gap-3 rounded-control border-[1.5px] border-line bg-white px-4 py-3.5 transition-colors hover:border-line-strong has-checked:border-secondary"
          >
            <input
              type="radio"
              name={`shipping-rate-${shippingPackage.package_id}`}
              value={rate.rate_id}
              checked={rate.selected}
              onChange={() =>
                selectRate(shippingPackage.package_id, rate.rate_id)
              }
              className="mt-px size-4.5 shrink-0 cursor-pointer accent-secondary"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm leading-tight font-semibold text-ink">
                {decodeHtml(rate.name)}
              </span>
              {description && (
                <span className="text-caption text-ink-muted">
                  {decodeHtml(description)}
                </span>
              )}
            </span>
            <span
              className={`shrink-0 text-sm leading-tight font-semibold ${
                price ? "text-ink" : "text-success"
              }`}
            >
              {price ? formatPrice(price, rate) : "Gratuit"}
            </span>
          </label>
        );
      })}
    </fieldset>
  ));
}
