import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { closeModal } from "../../slices/modalSlice";
import { fetchCurrentUserOrdersThunk } from "../../thunkActionsCreator/userThunks";
import { confirmPayment } from "./confirmPayment";
import { PICKUP_ADDRESS } from "../../utils/pickup";

const money = (amount, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    Number(amount) || 0,
  );

const ADDRESS_FIELDS = [
  { name: "first_name", label: "Prénom" },
  { name: "last_name", label: "Nom" },
  { name: "address_1", label: "Adresse", full: true },
  { name: "postcode", label: "Code postal" },
  { name: "city", label: "Ville" },
  { name: "country", label: "Pays (code, ex. FR)" },
  { name: "email", label: "Email", type: "email" },
];

export default function PayPendingOrderForm({ orderId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const token = useSelector((state) => state.user.token);
  const orders = useSelector((state) => state.user.orders);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState(null);
  const [deliveryKey, setDeliveryKey] = useState(null);

  const user = useSelector((state) => state.user);
  const order = orders?.find((o) => o.id === orderId);
  const [delivery, setDelivery] = useState(() => ({
    mode: order?.delivery_mode || "delivery",
    total: order?.total,
  }));

  const [address, setAddress] = useState(() => ({
    first_name: order?.billing?.first_name || user?.customer?.billing?.firstName || "",
    last_name: order?.billing?.last_name || user?.customer?.billing?.lastName || "",
    address_1: order?.billing?.address_1 || user?.customer?.billing?.address1 || "",
    postcode: order?.billing?.postcode || user?.customer?.billing?.postcode || "",
    city: order?.billing?.city || user?.customer?.billing?.city || "",
    country: order?.billing?.country || user?.customer?.billing?.country || "FR",
    email: order?.billing?.email || user?.profile?.email || "",
  }));
  const currentDeliveryKey = JSON.stringify({
    mode: deliveryMode,
    country: deliveryMode === "delivery" ? address.country : null,
    postcode: deliveryMode === "delivery" ? address.postcode : null,
  });

  const handleAddressChange = (e) =>
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const changeDelivery = async (mode) => {
    setDeliveryLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/orders/${orderId}/delivery`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ mode, country: address.country, postcode: address.postcode }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Impossible de modifier le mode de réception.");
      setDelivery({ mode: data.mode, total: data.total });
      setDeliveryKey(JSON.stringify({ mode, country: mode === "delivery" ? address.country : null, postcode: mode === "delivery" ? address.postcode : null }));
      dispatch(fetchCurrentUserOrdersThunk());
    } catch (err) {
      setError(err.message);
    } finally {
      setDeliveryLoading(false);
    }
  };

  if (!order) {
    return <p className="text-sm text-danger">Commande introuvable.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe n'est pas chargé.");
      return;
    }

    if (!["pending", "failed"].includes(order.status)) {
      setError("Cette commande ne peut pas être payée.");
      return;
    }
    if (!deliveryMode || deliveryKey !== currentDeliveryKey) {
      setError("Confirmez le mode de réception et son montant avant de payer.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { paymentMethod, error: stripeError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${address.first_name} ${address.last_name}`,
            email: address.email,
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/orders/${orderId}/pay`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            payment_method_id: paymentMethod.id,
            address,
            expected_total: delivery.total,
            delivery_mode: deliveryMode,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du paiement.");
      }

      if (data.requires_action) {
        await confirmPayment({
          stripe,
          action: data.payment_action,
          orderId,
          apiUrl: import.meta.env.VITE_API_URL,
          token,
        });
      }

      dispatch(closeModal());
      navigate(`/success/${orderId}`);
    } catch (err) {
      setError(err.message);
      dispatch(fetchCurrentUserOrdersThunk());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100 text-ink">
      <h3 className="font-serif text-3xl font-semibold text-forest">
        Payer la commande
      </h3>

      <div className="mt-6 border-l-4 border-leaf bg-mint p-5">
        <p className="text-sm text-ink-muted">
          Commande n°{order.number ?? order.id}
        </p>
        <p className="mt-1 text-2xl font-semibold text-forest">
          {deliveryKey === currentDeliveryKey ? "Montant" : "Montant avant confirmation de la livraison"} : {money(delivery.total, order.currency)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <fieldset className="flex flex-col gap-3" disabled={deliveryLoading || loading}>
          <legend className="mb-2 text-sm font-semibold">Mode de réception</legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="radio" name="delivery_mode" checked={deliveryMode === "delivery"} onChange={() => { setDeliveryMode("delivery"); setDeliveryKey(null); }} />
            <span>Livraison à domicile</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="radio" name="delivery_mode" checked={deliveryMode === "pickup"} onChange={() => { setDeliveryMode("pickup"); setDeliveryKey(null); }} />
            <span>Retrait gratuit en boutique — {PICKUP_ADDRESS}</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-ink-muted"><input type="radio" disabled /> Livraison en point relais — bientôt disponible</label>
          {deliveryLoading && <p className="text-sm text-ink-muted">Mise à jour du montant…</p>}
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="mb-2 text-sm font-semibold">
            {deliveryMode === "pickup" ? "Adresse de facturation" : "Adresse de livraison et de facturation"}
          </legend>
          {ADDRESS_FIELDS.map(({ name, label, type, full }) => (
            <label
              key={name}
              className={`flex flex-col gap-1 text-sm ${full ? "col-span-2" : ""}`}
            >
              <span className="text-ink-muted">{label}</span>
              <input
                name={name}
                type={type || "text"}
                value={address[name]}
                onChange={handleAddressChange}
                required
                className="rounded-md border border-line-strong bg-white px-3 py-2.5 text-ink"
              />
            </label>
          ))}
        </fieldset>

        {deliveryMode && (
          <button type="button" onClick={() => changeDelivery(deliveryMode)} disabled={deliveryLoading || loading} className="rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-forest disabled:opacity-50">
            Confirmer le mode de réception et actualiser le montant
          </button>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="card-element" className="text-sm font-semibold">
            Carte bancaire
          </label>
          <div className="min-h-12 rounded-md border border-line-strong bg-white px-4 py-3.5">
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#24382A",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    "::placeholder": { color: "#747870" },
                  },
                  invalid: { color: "#9B3B2E" },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="border-l-4 border-danger bg-danger/10 p-3 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!stripe || loading || deliveryLoading}
          className="w-full rounded-md bg-forest px-6 py-3.5 font-semibold text-white transition-colors hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Traitement..." : "Payer maintenant"}
        </button>

        <button
          type="button"
          onClick={() => dispatch(closeModal())}
          disabled={loading || deliveryLoading}
          className="w-full rounded-md border border-line-strong px-6 py-3.5 font-semibold text-ink-soft transition-colors hover:bg-mint disabled:opacity-50"
        >
          Annuler
        </button>
      </form>
    </div>
  );
}
