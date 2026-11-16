export async function confirmPayment({ stripe, action, orderId, apiUrl, token }) {
  if (!action?.client_secret || !action?.nonce) {
    throw new Error("Impossible de vérifier le paiement. Consultez vos commandes avant de réessayer.");
  }

  const { paymentIntent, error } = await stripe.confirmCardPayment(action.client_secret);
  if (error) {
    throw new Error(error.message);
  }
  if (!paymentIntent || !["succeeded", "requires_capture"].includes(paymentIntent.status)) {
    throw new Error("Le paiement est en cours de vérification. Consultez vos commandes avant de réessayer.");
  }

  const response = await fetch(`${apiUrl}/?wc-ajax=wc_stripe_update_order_status`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: new URLSearchParams({
      order_id: String(orderId),
      intent_id: paymentIntent.id,
      _ajax_nonce: action.nonce,
    }),
  });
  const confirmation = await response.json();
  if (!response.ok || !confirmation.success) {
    throw new Error(
      confirmation.data?.error?.message ||
        "Le paiement a été authentifié mais la commande n'a pas pu être confirmée. Consultez vos commandes avant de réessayer.",
    );
  }
}
