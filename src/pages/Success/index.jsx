import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUserOrdersThunk } from "../../thunkActionsCreator/userThunks";

const money = (amount, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    Number(amount) || 0,
  );

export default function Success() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const orders = useSelector((state) => state.user.orders) || [];
  const [verification, setVerification] = useState({ loading: !!token, error: null });

  const order = orders.find(
    (item) => String(item.id) === orderId || String(item.number) === orderId,
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    setVerification({ loading: true, error: null });
    dispatch(fetchCurrentUserOrdersThunk())
      .unwrap()
      .then(() => {
        if (active) setVerification({ loading: false, error: null });
      })
      .catch((error) => {
        if (active) setVerification({ loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [orderId, token, dispatch]);

  const verifiedOrder = token && !verification.loading && !verification.error && order;
  const confirmed = !token || (verifiedOrder && ["processing", "completed"].includes(order.status));
  const pending = verifiedOrder && order.status === "on-hold";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16 text-ink">
      <div className="text-center">
        {confirmed && (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint text-3xl text-forest">
            ✓
          </div>
        )}
        <h1 className="mt-6 font-serif text-4xl font-semibold text-forest">
          {verification.loading && token
            ? "Vérification de la commande"
            : confirmed
              ? "Commande confirmée"
              : pending
                ? "Commande reçue"
                : "Confirmation indisponible"}
        </h1>
        <p className="mt-2 text-ink-muted">
          {verification.loading && token
            ? "Nous vérifions le statut de votre commande."
            : confirmed || pending
              ? `Merci pour votre commande n°${order?.number ?? orderId}.`
              : verification.error || "Le paiement n'est pas encore confirmé. Consultez vos commandes avant de réessayer."}
        </p>
      </div>

      {verifiedOrder && (
        <section className="border-l-4 border-leaf bg-mint p-6">
          <ul className="flex flex-col gap-2 text-sm">
            {order.items?.map((item, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{money(item.total, order.currency)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-line-strong pt-4 text-lg font-semibold text-forest">
            <span>Total</span>
            <span>{money(order.total, order.currency)}</span>
          </p>
          {order.billing?.address_1 && (
            <p className="mt-4 text-sm text-ink-muted">
              Adresse : {order.billing.first_name} {order.billing.last_name},{" "}
              {order.billing.address_1}, {order.billing.postcode}{" "}
              {order.billing.city}
            </p>
          )}
        </section>
      )}

      <p className="text-center text-sm text-ink-muted">
        {pending
          ? "Votre paiement est en cours de confirmation. Retrouvez son statut dans votre espace client."
          : token
          ? "Retrouvez le statut de votre commande dans votre espace client."
          : "Vous avez commandé en tant qu'invité. Un email de confirmation vous a été envoyé avec le récapitulatif de votre commande."}
      </p>

      <div className="flex justify-center gap-4">
        {token && (
          <Link
            to="/profile"
            className="rounded-md bg-forest px-6 py-3 text-sm font-semibold text-white"
          >
            Mes commandes
          </Link>
        )}
        <Link
          to="/catalogue"
          className="rounded-md border border-line-strong px-6 py-3 text-sm font-semibold text-forest"
        >
          Continuer mes achats
        </Link>
      </div>
    </main>
  );
}
