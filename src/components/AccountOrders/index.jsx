import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { openModal } from "../../slices/modalSlice";
import OrderProgress from "./OrderProgress";
import { statusLabels } from "./status";

const money = (amount, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(amount) || 0);

export default function AccountOrders({ limit }) {
  const dispatch = useDispatch();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const panelPrefix = useId();
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
      {shownOrders.map((order) => {
        const expanded = expandedOrderId === order.id;
        const panelId = `${panelPrefix}-order-${order.id}`;
        return (
          <article key={order.id} className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                className="min-w-40 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                <span className="block font-semibold text-forest">Commande n°{order.number ?? order.id}</span>
                <span className="mt-1 block text-sm text-ink-muted">
                  {order.date ? new Date(order.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }) : "Date indisponible"}
                </span>
                <span className="mt-1 block text-xs font-semibold text-secondary">
                  {expanded ? "Masquer le suivi" : "Voir le suivi"}
                </span>
              </button>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <span className="text-sm text-ink-soft">
                  {statusLabels[order.status] || order.status}
                </span>
                <span className="min-w-24 text-right text-sm font-semibold text-forest">
                  {money(order.total, order.currency)}
                </span>
                <div className="flex gap-2">
                  {["pending", "failed"].includes(order.status) && (
                    <button
                      type="button"
                      onClick={() => dispatch(openModal({ name: "payPendingOrder", props: { id: order.id } }))}
                      className="border-b border-secondary pb-0.5 text-sm font-semibold text-secondary hover:text-secondary-hover"
                    >
                      Payer
                    </button>
                  )}
                  <Link
                    to={`/profile/commandes/${order.id}`}
                    className="border-b border-secondary pb-0.5 text-sm font-semibold text-secondary hover:text-secondary-hover"
                  >
                    Détails
                  </Link>
                </div>
              </div>
            </div>
            <div id={panelId} hidden={!expanded} className="mt-4">
              {expanded && <OrderProgress order={order} />}
            </div>
          </article>
        );
      })}
    </div>
  );
}