import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../slices/toastSlice";
import {
  emptyCartThunk,
  updateCartCustomerThunk,
  selectShippingRateThunk,
} from "../../thunkActionsCreator/cartThunks";
import CartTotals from "../CartTotals";
import RelayFields from "../RelayFields";
import { paymentCard, paymentInput, paymentPrimary, paymentSecondary } from "../PaymentForm/styles";
import { PICKUP_ADDRESS } from "../../utils/pickup";
import {
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  fetchCurrentUserThunk,
} from "../../thunkActionsCreator/userThunks";
import { openModal } from "../../slices/modalSlice";
import { selectReceptionMode } from "../../slices/cartSlice";
import { DELIVERY_MODES, rateMatchesDeliveryMode } from "../../utils/deliveryModes";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {addressFields.map(({ name, label, full }) => (
        <label key={name} className={`flex flex-col gap-1.5 font-semibold ${full ? "sm:col-span-2" : ""}`}>
          <span>{label}</span>
          <input className={paymentInput} name={name} value={address[name]} onChange={onChange} required />
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
  const deliveryMode = useSelector(selectReceptionMode);
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
  const [relayAddress, setRelayAddress] = useState({ company: "", address_1: "", postcode: "", city: "", country: "FR" });
  const [confirmedRates, setConfirmedRates] = useState(null);
  const pickupSelected = deliveryMode === "pickup";
  const relaySelected = deliveryMode?.startsWith("relay_");

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
      setError("Choisissez un mode de réception dans votre panier avant de continuer.");
      return;
    }
    setLoading(true);
    try {
      const destination = pickupSelected
        ? { country: "FR", postcode: "13002", city: "Marseille", address_1: "14 Boulevard de la Sagesse" }
        : relaySelected ? relayAddress : shippingAddress;
      let updated = await dispatch(updateCartCustomerThunk(destination)).unwrap();
      if (!updated.shipping_rates?.length) throw new Error("Aucun mode de réception disponible.");
      const choices = updated.shipping_rates.map((pkg) => {
        const previouslySelected = cart.shipping_rates
          .find((old) => old.package_id === pkg.package_id)?.shipping_rates
          .find((rate) => rate.selected);
        const matches = (rate) => rateMatchesDeliveryMode(rate, deliveryMode);
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
      if (sameAsBilling && deliveryMode === "delivery") {
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
              : relaySelected
                ? { ...relayAddress, first_name: billingAddress.first_name, last_name: billingAddress.last_name, address_2: "" }
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
    <div className="my-6 w-full">
      {step === 1 ? (
        <form onSubmit={continueToPayment} className="flex flex-col gap-5">
          {cart.needs_shipping && (
            <section className="rounded-xl border border-line-strong bg-white p-4 sm:p-6">
              <h3 className="font-semibold">Mode de réception</h3>
              <p className="mt-2">{DELIVERY_MODES.find((mode) => mode.id === deliveryMode)?.label || "Aucun mode de réception sélectionné."}</p>
              <Link to="/panier" className="mt-2 inline-block text-sm font-semibold text-secondary underline">Modifier dans le panier</Link>
            </section>
          )}
          {cart.needs_shipping && deliveryMode === "delivery" && (
            <div className="rounded-xl border border-line-strong bg-white p-4 sm:p-6">
              <h3 className="mb-4 font-semibold">Adresse de livraison</h3>
              <AddressFields address={shippingAddress} onChange={changeAddress(setShippingAddress)} />
            </div>
          )}
          {pickupSelected && <p className="text-sm text-ink-muted">Retrait en boutique : {PICKUP_ADDRESS}.</p>}
          {relaySelected && <RelayFields address={relayAddress} onChange={changeAddress(setRelayAddress)} />}
          {error && <p role="alert" className="rounded-lg border border-danger bg-[#fff5f2] p-3 text-danger">{error}</p>}
          <button type="submit" className={paymentPrimary} disabled={loading || cart.loading || (cart.needs_shipping && !deliveryMode)}>
            {loading ? "Vérification de la livraison..." : "Continuer vers le paiement"}
          </button>
        </form>
      ) : (
        <form ref={paymentForm} onSubmit={handlePayment} className="flex flex-col gap-5">
          <div className="rounded-xl border border-line-strong bg-white p-4 sm:p-6">
            <h3 className="mb-4 font-semibold">Adresse de facturation</h3>
            {deliveryMode === "delivery" && (
              <label className="mb-4 flex items-center gap-2 accent-forest">
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
            <label className="mt-4 flex flex-col gap-1.5 font-semibold">
              <span>Email</span>
              <input className={paymentInput} name="email" type="email" value={billingAddress.email} onChange={changeAddress(setBillingAddress)} required />
            </label>
          </div>
          <div className="rounded-xl border border-line-strong bg-white p-4 sm:p-6">
            <h3 className="mb-4 font-semibold">Récapitulatif</h3>
            <CartTotals />
          </div>
          <div className="rounded-xl border border-line-strong bg-white p-4 sm:p-6">
            <h3 className="mb-4 font-semibold">Paiement</h3>
            <div className={paymentCard}>
              <CardElement options={{ style: { base: { fontSize: "16px", color: "#24382a", fontFamily: "Plus Jakarta Sans, sans-serif", "::placeholder": { color: "#5c6e60" } }, invalid: { color: "#9b3b2e" } } }} />
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg border border-danger bg-[#fff5f2] p-3 text-danger">{error}</p>}
          <button type="submit" className={paymentPrimary} disabled={!stripe || loading || cart.loading}>
            {loading ? "Traitement..." : "Payer maintenant"}
          </button>
          <button type="button" className={paymentSecondary} disabled={loading} onClick={() => { setError(null); onStepChange(1); }}>
            Retour à la livraison
          </button>
        </form>
      )}
    </div>
  );
}
