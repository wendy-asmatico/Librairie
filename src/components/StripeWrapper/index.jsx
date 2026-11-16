import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../CheckoutForm";
import Loader from "../Loader";

export default function StripeWrapper({ step, onStepChange }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return <Loader size="lg" />;
  }

  if (error || !stripePromise) {
    return <p>{error || "Erreur lors de l'initialisation de Stripe."}</p>;
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm step={step} onStepChange={onStepChange} />
    </Elements>
  );
}
