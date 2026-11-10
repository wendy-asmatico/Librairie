import { useState } from "react";
import { useSelector } from "react-redux";

import Breadcrumb from "../../components/Breadcrumb";
import CheckoutSteps from "../../components/CheckoutSteps";
import EmptyCart from "../../components/EmptyCart";
import Seo from "../../components/Seo";
import StripeWrapper from "../../components/StripeWrapper";

export default function Checkout() {
  const hasItems = useSelector((state) => state.cart.items.length > 0);
  const [step, setStep] = useState(1);
  const title = step === 1 ? "Livraison" : "Facturation et paiement";
  const breadcrumb = [
    { label: "Accueil", to: "/" },
    { label: "Mon panier", to: "/panier" },
    { label: title },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-gutter pt-[clamp(1rem,2vw,1.375rem)] pb-[clamp(3rem,7vw,5rem)] text-ink">
      <Seo title={title} noIndex />

      <Breadcrumb items={breadcrumb} />
      <div className="mt-[clamp(1.125rem,3vw,1.625rem)] flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-line pb-[clamp(1.25rem,3vw,1.75rem)]">
        <h1 className="font-serif text-display font-semibold text-forest">
          {title}
        </h1>
        <CheckoutSteps current={step} />
      </div>

      {hasItems ? (
        <div className="mt-8">
          <StripeWrapper step={step} onStepChange={setStep} />
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
