import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AccountOrders from "../AccountOrders";
import { HeartIcon, PackageIcon } from "../Icons";

const money = (amount) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(amount) || 0);

export default function AccountOverview({ onShowOrders }) {
  const { customer, orders } = useSelector((state) => state.user);
  const favoriteCount = useSelector((state) => state.wishlist.items.length);

  return (
    <div>
      <div className="grid gap-6 border-b border-line pb-7 sm:grid-cols-3">
        <div>
          <p className="text-sm text-ink-muted">Commandes passées</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-forest">
            {customer?.ordersCount ?? orders.length}
          </p>
        </div>
        <div className="border-line sm:border-l sm:pl-6">
          <p className="text-sm text-ink-muted">Montant total dépensé</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-forest">
            {money(customer?.totalSpent)}
          </p>
        </div>
        <Link to="/wishlist" className="group border-line sm:border-l sm:pl-6">
          <p className="flex items-center gap-2 text-sm text-ink-muted group-hover:text-secondary">
            <HeartIcon size={16} /> Mes favoris
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold text-forest">{favoriteCount}</p>
        </Link>
      </div>

      <section className="pt-8" aria-labelledby="recent-orders-title">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h3 id="recent-orders-title" className="flex items-center gap-2 font-serif text-xl font-semibold text-forest">
            <PackageIcon size={20} /> Commandes récentes
          </h3>
          {orders.length > 3 && (
            <button type="button" onClick={onShowOrders} className="text-sm font-semibold text-secondary hover:text-secondary-hover">
              Tout afficher
            </button>
          )}
        </div>
        <AccountOrders limit={3} />
      </section>
    </div>
  );
}