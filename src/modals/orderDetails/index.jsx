import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SucessMessage from "../../components/SucessMessage";
import { PICKUP_ADDRESS } from "../../utils/pickup";
import "./index.css";

// 1. Cache externe pour persister entre les rendus
const ordersCache = {};

export default function OrderDetails() {
  const modalProps = useSelector((state) => state.modal.modalProps);
  const orderId = typeof modalProps === "object" ? modalProps?.id : modalProps;
  const token = useSelector((state) => state.user.token);
  const order = useSelector((state) =>
    state.user.orders.find((item) => String(item.id) === String(orderId)),
  );

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const productOrigin = (permalink) => {
    if (!permalink) return null;
    const pathSegments = permalink.split("produit/").filter(Boolean);
    return pathSegments.pop() || null;
  };

  useEffect(() => {
    if (!orderId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    // Si déjà en cache, on l'affiche directement sans charger
    if (ordersCache[orderId]) {
      setDetail(ordersCache[orderId]);
      setLoading(false);
      setError("");
      return;
    }

    // 2. Réinitialisation immédiate : purge l'ancien produit et lance le loader
    setDetail(null);
    setLoading(true);
    setError("");

    let cancelled = false;

    async function fetchOrder() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || "Impossible de récupérer la commande.",
          );
        }

        ordersCache[orderId] = data;
        if (cancelled) return;
        setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;
  if (!detail) return null;

  const current = detail;
  const isPaid = ["processing", "shipped", "completed"].includes(current.status);
  const label = current.number ?? current.id;
  const statusText = isPaid
    ? "Paiement confirmé pour la commande n°"
    : "Paiement en attente de confirmation pour la commande n°";

  return (
    <div className="order-details">
      <h5 className={isPaid ? "payment-ok" : "payment-pending"}>
        {statusText}
        {label}
      </h5>

      {!orderId && <SucessMessage order={current} />}

      <h3>Produits</h3>

      <div className="order-items">
        {detail.items?.map((item) => (
          <Link
            key={item.id}
            to={`/product/${productOrigin(item.permalink)}`}
            className="order-item"
          >
            {item.images?.[0] && (
              <img
                src={item.images[0].thumbnail}
                alt={item.images[0].alt || item.name}
                width={70}
              />
            )}

            <div>
              <strong>{item.name}</strong>
              <p>Quantité : {item.quantity}</p>
              <p>{(Number(item.totals.line_total) / 100).toFixed(2)} €</p>
            </div>
          </Link>
        ))}
      </div>

      {detail.shipping_address && (
        <>
          <h3>{order?.delivery_mode === "pickup" ? "Retrait en boutique" : order?.delivery_mode?.startsWith("relay_") ? "Point relais" : "Adresse de livraison"}</h3>

          {order?.delivery_mode === "pickup" ? (
            <p>{PICKUP_ADDRESS}</p>
          ) : (
            <>
              <p>{detail.shipping_address.first_name} {detail.shipping_address.last_name}</p>
              {detail.shipping_address.company && <p>{detail.shipping_address.company}</p>}
              <p>{detail.shipping_address.address_1}</p>
              {detail.shipping_address.address_2 && <p>{detail.shipping_address.address_2}</p>}
              <p>{detail.shipping_address.postcode} {detail.shipping_address.city}</p>
              <p>{detail.shipping_address.state} {detail.shipping_address.country}</p>
            </>
          )}

          <p>
            Livraison :{" "}
            {(Number(detail.totals.total_shipping) / 100).toFixed(2)} €
          </p>
          <p>
            Total : {(Number(detail.totals.total_price) / 100).toFixed(2)} €
          </p>
        </>
      )}
    </div>
  );
}
