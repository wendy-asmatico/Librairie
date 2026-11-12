import "./index.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../slices/toastSlice";
import {
  emptyCartThunk,
  updateCartCustomerThunk,
  selectShippingRateThunk,
} from "../../thunkActionsCreator/cartThunks";
import CartTotals from "../CartTotals";
import { PICKUP_ADDRESS } from "../../utils/pickup";
import {
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  fetchCurrentUserThunk,
} from "../../thunkActionsCreator/userThunks";
import { openModal } from "../../slices/modalSlice";

const addressFields = [
  { name: "first_name", label: "Prénom" },
  { name: "last_name", label: "Nom" },
  { name: "address_1", label: "Adresse", full: true },
  { name: "city", label: "Ville" },
  { name: "postcode", label: "Code postal" },
  { name: "country", label: "Pays (code, ex. FR)" },
];

function AddressFields({ address, onChange }) {
  return (
    <div className="checkout-form__grid">
      {addressFields.map(({ name, label, full }) => (
        <label key={name} className={`checkout-form__field${full ? " checkout-form__field--full" : ""}`}>
          <span>{label}</span>
          <input name={name} value={address[name]} onChange={onChange} required />
        </label>
      ))}
    </div>
  );
}

const initialAddress = (address, email) => ({
  first_name: address?.firstName || "",
  last_name: address?.lastName || "",
  address_1: address?.address1 || "",
  city: address?.city || "",
  postcode: address?.postcode || "",
  country: address?.country || "FR",
  email: email || "",
});

export default function CheckoutForm({ step, onStepChange }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const paymentForm = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(() =>
    initialAddress(user?.customer?.shipping, user?.profile?.email),
  );
  const [billingAddress, setBillingAddress] = useState(() =>
    initialAddress(user?.customer?.billing, user?.profile?.email),
  );
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState(() => {
    const selected = cart.shipping_rates.flatMap((pkg) =>
      pkg.shipping_rates.filter((rate) => rate.selected),
    );
    if (!selected.length) return null;
    if (selected.every((rate) => rate.method_id === "local_pickup")) return "pickup";
    if (selected.every((rate) => rate.rate_id === "headless_home_delivery")) return "delivery";
    return null;
  });
  const [confirmedRates, setConfirmedRates] = useState(null);
  const pickupSelected = deliveryMode === "pickup";

  useEffect(() => {
    if (deliveryMode !== null) return;
    const packages = cart.shipping_rates;
    if (!packages.length) return;
    const selected = packages.map((pkg) => pkg.shipping_rates.find((rate) => rate.selected));
    if (selected.some((rate) => !rate)) return;
    if (selected.every((rate) => rate.method_id === "local_pickup")) setDeliveryMode("pickup");
    else if (selected.every((rate) => rate.rate_id === "headless_home_delivery")) setDeliveryMode("delivery");
  }, [cart.shipping_rates, deliveryMode]);

  const changeAddress = (setter) => (event) => {
    const { name, value } = event.target;
    setter((previous) => ({ ...previous, [name]: value }));
  };

  const continueToPayment = async (event) => {
    event.preventDefault();
    setError(null);
    if (!cart.needs_shipping) {
      onStepChange(2);
      return;
    }
    if (!deliveryMode) {
      setError("Choisissez un mode de réception avant de continuer.");
      return;
    }
    setLoading(true);
    try {
      const destination = pickupSelected
        ? { country: "FR", postcode: "13002", city: "Marseille", address_1: "14 Boulevard de la Sagesse" }
        : shippingAddress;
      let updated = await dispatch(updateCartCustomerThunk(destination)).unwrap();
      if (!updated.shipping_rates?.length) throw new Error("Aucun mode de réception disponible.");
      const choices = updated.shipping_rates.map((pkg) => {
        const previouslySelected = cart.shipping_rates
          .find((old) => old.package_id === pkg.package_id)?.shipping_rates
          .find((rate) => rate.selected);
        const matches = (rate) => pickupSelected
          ? rate.method_id === "local_pickup"
          : rate.rate_id === "headless_home_delivery";
        const rate = pkg.shipping_rates.find((entry) => matches(entry) && entry.rate_id === previouslySelected?.rate_id)
          || pkg.shipping_rates.find(matches);
        if (!rate) throw new Error("Ce mode de réception n’est pas disponible pour cette adresse.");
        return { packageId: pkg.package_id, rateId: rate.rate_id };
      });
      for (const choice of choices) {
        updated = await dispatch(selectShippingRateThunk(choice)).unwrap();
      }
      if (updated.shipping_rates.some((pkg) => !pkg.shipping_rates.some((rate) =>
        rate.selected && choices.some((choice) => choice.packageId === pkg.package_id && choice.rateId === rate.rate_id),
      ))) {
        throw new Error("Le mode de réception n’a pas pu être sélectionné.");
      }
      setConfirmedRates(choices);
      if (sameAsBilling && !pickupSelected) {
        setBillingAddress((previous) => ({ ...shippingAddress, email: previous.email }));
      }
      onStepChange(2);
    } catch (message) {
      setError(message.message || message);
    } finally {
      setLoading(false);
    }
  };

  const processCheckout = async () => {
    if (!stripe || !elements || loading || cart.loading) return;
    if (cart.needs_shipping && (
      !confirmedRates || cart.shipping_rates.length !== confirmedRates.length ||
      cart.shipping_rates.some((pkg) => !pkg.shipping_rates.some((rate) =>
        rate.selected && confirmedRates.some((choice) => choice.packageId === pkg.package_id && choice.rateId === rate.rate_id),
      ))
    )) {
      setError("Le mode de réception a changé. Revenez à l’étape livraison pour le vérifier.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${billingAddress.first_name} ${billingAddress.last_name}`,
          email: billingAddress.email,
        },
      });
      if (stripeError) throw new Error(stripeError.message);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/checkout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Nonce: cart.nonce || "",
            ...(user?.token && { Authorization: `Bearer ${user.token}` }),
          },
          body: JSON.stringify({
            payment_method: "stripe",
            payment_data: [
              { key: "stripe_source", value: paymentMethod.id },
              { key: "wc-stripe-payment-method", value: paymentMethod.id },
              { key: "payment_method", value: paymentMethod.id },
            ],
            billing_address: billingAddress,
            shipping_address: pickupSelected
              ? { ...billingAddress, address_1: "14 Boulevard de la Sagesse", address_2: "", postcode: "13002", city: "Marseille", country: "FR" }
              : shippingAddress,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur lors de la commande.");
      if (!data.payment_result?.redirect_url) throw new Error("La confirmation du paiement est indisponible.");
      dispatch(showToast(`Commande n°${data.order_id} confirmée`));
      dispatch(emptyCartThunk());
      dispatch(fetchCurrentUserThunk());
      dispatch(fetchCurrentCustomerThunk());
      dispatch(fetchCurrentUserOrdersThunk());
      if (user.token) dispatch(openModal({ name: "orderDetails", props: data.order_id }));
      navigate(`/success/${data.order_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGuestCheckout = () => {
      if (step === 2 && paymentForm.current?.reportValidity()) processCheckout();
    };
    window.addEventListener("checkoutContinueAsGuest", handleGuestCheckout);
    return () => window.removeEventListener("checkoutContinueAsGuest", handleGuestCheckout);
  });

  const handlePayment = (event) => {
    event.preventDefault();
    if (!user?.token) {
      dispatch(openModal({ name: "checkoutAuthPrompt" }));
      return;
    }
    processCheckout();
  };

  return (
    <div className="checkout-form">
      {step === 1 ? (
        <form onSubmit={continueToPayment} className="checkout-form__form">
          {cart.needs_shipping && (
            <fieldset className="checkout-form__section flex flex-col gap-3">
              <legend className="font-semibold">Mode de réception</legend>
              <label className="flex items-start gap-2">
                <input type="radio" name="reception" checked={deliveryMode === "delivery"} onChange={() => setDeliveryMode("delivery")} />
                Livraison à domicile
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="reception" checked={pickupSelected} onChange={() => setDeliveryMode("pickup")} />
                Retrait gratuit en boutique — {PICKUP_ADDRESS}
              </label>
              <label className="flex items-start gap-2 text-ink-muted">
                <input type="radio" disabled /> Livraison en point relais — bientôt disponible
              </label>
            </fieldset>
          )}
          {cart.needs_shipping && deliveryMode === "delivery" && (
            <div className="checkout-form__section">
              <h3>Adresse de livraison</h3>
              <AddressFields address={shippingAddress} onChange={changeAddress(setShippingAddress)} />
            </div>
          )}
          {pickupSelected && <p className="text-sm text-ink-muted">Retrait à l’adresse indiquée ci-dessus.</p>}
          {error && <p role="alert" className="checkout-form__error">{error}</p>}
          <button type="submit" className="checkout-form__submit" disabled={loading || cart.loading}>
            {loading ? "Vérification de la livraison..." : "Continuer vers le paiement"}
          </button>
        </form>
      ) : (
        <form ref={paymentForm} onSubmit={handlePayment} className="checkout-form__form">
          <div className="checkout-form__section">
            <h3>Adresse de facturation</h3>
            {deliveryMode === "delivery" && (
              <label className="checkout-form__checkbox mb-4">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(event) => {
                    setSameAsBilling(event.target.checked);
                    if (event.target.checked) {
                      setBillingAddress((previous) => ({ ...shippingAddress, email: previous.email }));
                    }
                  }}
                />
                <span>Identique à l’adresse de livraison</span>
              </label>
            )}
            <AddressFields address={billingAddress} onChange={(event) => {
              setSameAsBilling(false);
              changeAddress(setBillingAddress)(event);
            }} />
            <label className="checkout-form__field checkout-form__field--full">
              <span>Email</span>
              <input name="email" type="email" value={billingAddress.email} onChange={changeAddress(setBillingAddress)} required />
            </label>
          </div>
          <div className="checkout-form__section">
            <h3>Récapitulatif</h3>
            <CartTotals />
          </div>
          <div className="checkout-form__section checkout-form__payment">
            <h3>Paiement</h3>
            <div className="strip">
              <CardElement options={{ style: { base: { fontSize: "16px", color: "#0f172a", fontFamily: "InterCustom, sans-serif", "::placeholder": { color: "#94a3b8" } }, invalid: { color: "#dc2626" } } }} />
            </div>
          </div>
          {error && <p role="alert" className="checkout-form__error">{error}</p>}
          <button type="submit" className="checkout-form__submit" disabled={!stripe || loading || cart.loading}>
            {loading ? "Traitement..." : "Payer maintenant"}
          </button>
          <button type="button" className="rounded-md border border-line-strong px-6 py-3 font-semibold text-forest" disabled={loading} onClick={() => { setError(null); onStepChange(1); }}>
            Retour à la livraison
          </button>
        </form>
      )}
    </div>
  );
}
