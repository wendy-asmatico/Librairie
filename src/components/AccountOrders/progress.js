export function getOrderProgress(order) {
  const pickup = order.delivery_mode === "pickup";
  const steps = pickup
    ? ["Validée", "Préparation", "Retirée"]
    : ["Validée", "Préparation", "Expédiée", "Livrée"];

  switch (order.status) {
    case "processing":
      return {
        steps,
        current: 1,
        message: pickup
          ? "Votre commande est en cours de préparation pour le retrait en boutique."
          : "Votre commande est en cours de préparation.",
      };
    case "shipped":
      if (pickup) return null;
      return {
        steps,
        current: 2,
        message: "Votre commande a été expédiée.",
      };
    case "completed":
      return {
        steps,
        current: steps.length - 1,
        message: pickup
          ? "Votre commande a été remise en boutique."
          : "Votre commande est terminée.",
      };
    default:
      return null;
  }
}
