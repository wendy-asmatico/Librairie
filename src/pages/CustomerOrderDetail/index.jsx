import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import OrderProgress from "../../components/AccountOrders/OrderProgress";
import { statusLabels } from "../../components/AccountOrders/status";
import Seo from "../../components/Seo";
import { PICKUP_ADDRESS } from "../../utils/pickup";

const CARD = "rounded-xl border border-line bg-white p-5 sm:p-6";
const money = (value, currency) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency || "EUR" }).format(Number(value) || 0);
const formatDate = (value) => value ? new Date(value).toLocaleString("fr-FR") : "Non renseignée";

function Address({ title, address }) {
  const lines = [
    [address?.first_name, address?.last_name].filter(Boolean).join(" "),
    address?.company,
    address?.address_1,
    address?.address_2,
    [address?.postcode, address?.city].filter(Boolean).join(" "),
    address?.state,
    address?.country,
    address?.phone,
    address?.email,
  ].filter(Boolean);

  return (
    <div>
      <h3 className="mb-1 font-semibold text-forest">{title}</h3>
      {lines.length ? lines.map((line, index) => <p key={index}>{line}</p>) : <p>Non renseignée</p>}
    </div>
  );
}

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const token = useSelector((state) => state.user.token);
  const [state, setState] = useState({ loading: true, error: "", order: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setState({ loading: true, error: "", order: null });

    async function loadOrder() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/orders/${encodeURIComponent(id)}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Impossible de récupérer la commande.");
        if (!controller.signal.aborted) setState({ loading: false, error: "", order: data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({ loading: false, error: error.message || "Impossible de récupérer la commande.", order: null });
        }
      }
    }

    loadOrder();
    return () => controller.abort();
  }, [id, token, attempt]);

  const order = state.order;
  return (
    <main className="mx-auto max-w-5xl px-gutter py-10 pb-16 text-ink">
      <Seo title="Détail de ma commande" noIndex />
      <Link to="/profile?section=orders" className="text-sm font-semibold text-secondary hover:underline">
        ← Retour à mes commandes
      </Link>
      <h1 className="mt-5 font-serif text-3xl font-semibold text-forest">
        {order ? `Commande n°${order.number ?? order.id}` : "Détail de ma commande"}
      </h1>

      {!token ? (
        <p className="mt-6" role="alert">Connectez-vous pour consulter vos commandes.</p>
      ) : state.loading ? (
        <p className="mt-6" role="status">Chargement de la commande…</p>
      ) : state.error ? (
        <div className={`${CARD} mt-6`} role="alert">
          <p>Impossible de charger la commande : {state.error}</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-2 font-semibold text-secondary underline">Réessayer</button>
        </div>
      ) : order && (
        <div className="mt-6 grid gap-5">
          <section className={CARD}>
            <h2 className="text-lg font-bold text-forest">Commande</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>Statut : <strong>{statusLabels[order.status] || order.status}</strong></p>
              <p>Créée le : {formatDate(order.date)}</p>
              <p>Paiement : {order.payment_method || "Non renseigné"}</p>
              <p>Payée le : {formatDate(order.date_paid)}</p>
              <p>Réception : {order.delivery_mode === "pickup" ? "Retrait en boutique" : order.shipping_method || "Non renseignée"}</p>
              {order.customer_note && <p>Votre note : {order.customer_note}</p>}
            </div>
            {["pending", "failed"].includes(order.status) && (
              <p className="mt-3 text-sm">Pour régler cette commande, utilisez le bouton « Payer » dans <Link to="/profile?section=orders" className="font-semibold text-secondary underline">mes commandes</Link>.</p>
            )}
          </section>

          <section aria-labelledby="order-progress-title">
            <h2 id="order-progress-title" className="mb-3 text-lg font-bold text-forest">Suivi de la commande</h2>
            <OrderProgress order={order} />
          </section>

          <section className={CARD}>
            <h2 className="mb-3 text-lg font-bold text-forest">Produits commandés</h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="py-3 text-sm">
                  <strong>{item.name}</strong>
                  <p>Quantité : {item.quantity} · Total HT : {money(item.total, order.currency)} · TVA : {money(item.total_tax, order.currency)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <p>Remise : {money(order.discount_total, order.currency)} HT</p>
              <p>Livraison : {money(order.shipping_total, order.currency)} HT</p>
              {order.fees.map((fee) => <p key={fee.id}>{fee.name} : {money(fee.total, order.currency)} HT</p>)}
              <p>TVA totale : {money(order.total_tax, order.currency)}</p>
              <p className="font-bold">Total : {money(order.total, order.currency)}</p>
              {order.coupons.length > 0 && <p>Codes promo : {order.coupons.join(", ")}</p>}
            </div>
          </section>

          <section className={CARD}>
            <h2 className="text-lg font-bold text-forest">Coordonnées</h2>
            <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <Address title="Facturation et contact" address={order.billing} />
              {order.delivery_mode === "pickup"
                ? <div><h3 className="mb-1 font-semibold text-forest">Retrait en boutique</h3><p>{PICKUP_ADDRESS}</p></div>
                : <Address title="Adresse de livraison" address={order.shipping} />}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
