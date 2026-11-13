import { useDispatch, useSelector } from "react-redux";

import { cartActions, selectReceptionMode } from "../../slices/cartSlice";
import { showToast } from "../../slices/toastSlice";
import { selectShippingRateThunk } from "../../thunkActionsCreator/cartThunks";
import { DELIVERY_MODES, rateMatchesDeliveryMode } from "../../utils/deliveryModes";
import { formatPrice } from "../../utils/formatPrice";
import { PICKUP_ADDRESS } from "../../utils/pickup";

export default function ShippingMethods() {
  const dispatch = useDispatch();
  const packages = useSelector((state) => state.cart.shipping_rates);
  const needsShipping = useSelector((state) => state.cart.needs_shipping);
  const loading = useSelector((state) => state.cart.loading);
  const selectedMode = useSelector(selectReceptionMode);

  if (!needsShipping) return null;

  const ratesFor = (mode) => packages.map((pkg) =>
    pkg.shipping_rates.find((rate) => rateMatchesDeliveryMode(rate, mode)),
  );

  const selectMode = async (mode) => {
    const rates = ratesFor(mode);
    dispatch(cartActions.setReceptionMode(mode));
    try {
      if (packages.length && rates.every(Boolean)) {
        for (let index = 0; index < packages.length; index += 1) {
          await dispatch(selectShippingRateThunk({
            packageId: packages[index].package_id,
            rateId: rates[index].rate_id,
          })).unwrap();
        }
      }
    } catch (message) {
      dispatch(cartActions.setReceptionMode(selectedMode));
      dispatch(showToast(message));
    }
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="mb-3 text-sm leading-none font-semibold text-ink">Mode de réception</legend>
      {DELIVERY_MODES.map(({ id, label }) => {
        const rates = ratesFor(id);
        const available = packages.length > 0 && rates.every(Boolean);
        const price = available ? rates.reduce((total, rate) => total + Number(rate.price) + Number(rate.taxes), 0) : null;
        return (
          <label key={id} className="flex cursor-pointer items-start gap-3 rounded-control border-[1.5px] border-line bg-white px-4 py-3.5 transition-colors hover:border-line-strong has-checked:border-secondary">
            <input
              type="radio"
              name="shipping-mode"
              checked={selectedMode === id}
              disabled={loading}
              onChange={() => selectMode(id)}
              className="mt-px size-4.5 shrink-0 cursor-pointer accent-secondary"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm leading-tight font-semibold text-ink">{label}</span>
              {id === "pickup" && <span className="text-caption text-ink-muted">{PICKUP_ADDRESS}</span>}
            </span>
            <span className={`shrink-0 text-sm leading-tight ${price === 0 ? "font-semibold text-success" : "text-ink"}`}>
              {price === null ? "À confirmer" : price === 0 ? "Gratuit" : formatPrice(price, rates[0])}
            </span>
          </label>
        );
      })}
      <p className="text-caption text-ink-muted">Les tarifs et la disponibilité sont confirmés selon l’adresse à l’étape suivante.</p>
    </fieldset>
  );
}
