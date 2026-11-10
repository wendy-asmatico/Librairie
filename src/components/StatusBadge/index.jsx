const labels = {
  pending: "En attente de paiement",
  processing: "En préparation",
  shipped: "Expédiée",
  "on-hold": "En attente",
  completed: "Terminée",
  cancelled: "Annulée",
  refunded: "Remboursée",
  failed: "Échouée",
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{labels[status] ?? status}</span>;
}