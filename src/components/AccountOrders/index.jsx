import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../slices/modalSlice";

const statusLabels = {
  pending: "En attente de paiement",
  processing: "En préparation",
  on_hold: "En attente",
  completed: "Terminée",
  cancelled: "Annulée",
  refunded: "Remboursée",
  failed: "Échouée",
};

const money = (amount, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(amount) || 0);

export default function AccountOrders({ limit }) {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.user.orders);
  const sortedOrders = [...orders].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  );
  const shownOrders = limit ? sortedOrders.slice(0, limit) : sortedOrders;

  if (!shownOrders.length) {
    return (
      <div className="border-y border-line py-10 text-center">
        <p className="font-serif text-xl font-semibold text-forest">Aucune commande pour le moment</p>
        <p className="mt-2 text-sm text-ink-muted">Vos prochaines commandes apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {shownOrders.map((order) => (
        <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-40">
            <p className="font-semibold text-forest">Commande n°{order.number ?? order.id}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {order.date ? new Date(order.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }) : "Date indisponible"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <span className="text-sm text-ink-soft">
              {statusLabels[order.status] || order.status}
            </span>
            <span className="min-w-24 text-right text-sm font-semibold text-forest">
              {money(order.total, order.currency)}
            </span>
            <button
              type="button"
              onClick={() => dispatch(openModal({ name: "orderDetails", props: order.id }))}
              className="border-b border-secondary pb-0.5 text-sm font-semibold text-secondary hover:text-secondary-hover"
            >
              Détails
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}