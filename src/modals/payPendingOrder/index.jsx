import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PayPendingOrderForm from "./PayPendingOrderForm";

export default function PayPendingOrder() {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const modalProps = useSelector((state) => state.modal.modalProps);

  useEffect(() => {
    async function fetchStripeKey() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/stripe`,
        );
        const data = await response.json();
        if (!response.ok || !data.publishable_key) {
          throw new Error(
            data.message || "Impossible de récupérer la clé Stripe.",
          );
        }
        setStripePromise(loadStripe(data.publishable_key));
      } catch (err) {
        console.error("Erreur récupération clé Stripe :", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStripeKey();
  }, []);

  if (loading) {
    return <p className="p-8 text-center text-ink-muted">Chargement...</p>;
  }

  if (error || !stripePromise) {
    return (
      <p className="text-sm text-danger">
        {error || "Erreur lors de l'initialisation de Stripe."}
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PayPendingOrderForm orderId={modalProps?.id} />
    </Elements>
  );
}

