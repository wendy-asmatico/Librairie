import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DetailLayout, { DETAIL_BUTTON, DETAIL_CARD, DETAIL_INPUT, useAdminAccess } from "../../components/Admin/DetailLayout";
import { statusOf } from "../../components/Admin/LatestOrders";
import { customCreate, wcFetch, wcFetchAll } from "../../admin/api";
import { isPickup, money } from "../../admin/format";
import { decodeHtml, htmlToText } from "../../utils/decodeHtml";
import { PICKUP_ADDRESS } from "../../utils/pickup";

const ADDRESS_FIELDS = [
  ["first_name", "Prénom"], ["last_name", "Nom"], ["company", "Société"],
  ["address_1", "Adresse"], ["address_2", "Complément d’adresse"], ["postcode", "Code postal"],
  ["city", "Ville"], ["state", "Région / département"], ["country", "Code pays (ex. FR)"], ["phone", "Téléphone"],
];
const addressForForm = (address, billing) => Object.fromEntries(
  [...ADDRESS_FIELDS, ...(billing ? [["email", "E-mail"]] : [])].map(([key]) => [key, address?.[key] || ""]),
);
const formatDate = (value) => value ? new Date(value).toLocaleString("fr-FR") : "—";

function AddressFields({ title, value, onChange, billing }) {
  return (
    <fieldset className={`${DETAIL_CARD} grid gap-3 sm:grid-cols-2`}>
      <legend className="px-1 text-lg font-bold text-forest-deep">{title}</legend>
      {[...ADDRESS_FIELDS, ...(billing ? [["email", "E-mail"]] : [])].map(([key, label]) => (
        <label key={key} className="text-sm font-semibold text-ink">{label}
          <input type={key === "email" ? "email" : "text"} value={value[key]} onChange={(event) => onChange(key, event.target.value)} className={`${DETAIL_INPUT} mt-1`} />
        </label>
      ))}
    </fieldset>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const access = useAdminAccess();
  const [state, setState] = useState({ loading: true, error: "", order: null });
  const [editing, setEditing] = useState(false);
  const [billing, setBilling] = useState({});
  const [shipping, setShipping] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [notes, setNotes] = useState({ loading: true, error: "", items: [] });
  const [notesAttempt, setNotesAttempt] = useState(0);
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    if (!access.token || !access.isAdmin) return;
    const sequence = ++loadSequence.current;
    setState({ loading: true, error: "", order: null });
    try {
      const { data } = await wcFetch(`/orders/${id}`, access.token, { context: "edit" });
      if (sequence === loadSequence.current) setState({ loading: false, error: "", order: data });
    } catch (error) {
      if (sequence === loadSequence.current) setState({ loading: false, error: error.message, order: null });
    }
  }, [id, access.token, access.isAdmin]);
  useEffect(() => { load(); return () => { loadSequence.current += 1; }; }, [load]);
  useEffect(() => {
    if (!access.token || !access.isAdmin) return;
    let cancelled = false;
    setNotes({ loading: true, error: "", items: [] });
    wcFetchAll(`/orders/${id}/notes`, access.token, {}, Infinity)
      .then(({ items }) => { if (!cancelled) setNotes({ loading: false, error: "", items }); })
      .catch((error) => { if (!cancelled) setNotes({ loading: false, error: error.message, items: [] }); });
    return () => { cancelled = true; };
  }, [access.token, access.isAdmin, id, notesAttempt]);
  const order = String(state.order?.id) === id ? state.order : null;
  const beginEdit = () => {
    setBilling(addressForForm(order.billing, true));
    setShipping(addressForForm(order.shipping, false));
    setActionError("");
    setEditing(true);
  };
  const saveAddresses = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!window.confirm("Enregistrer ces coordonnées ? Les frais et taxes de la commande ne seront pas recalculés.")) return;
    setSaving(true); setActionError(""); setMessage("");
    try {
      await customCreate(`/admin/orders/${id}/addresses`, access.token, {
        billing, shipping,
        expected_billing: addressForForm(order.billing, true),
        expected_shipping: addressForForm(order.shipping, false),
      });
      setEditing(false);
      setMessage("Coordonnées enregistrées. Les montants n’ont pas été recalculés.");
      await load();
    } catch (error) {
      setActionError(error.message);
    } finally { setSaving(false); }
  };
  const updateStatus = async (target) => {
    if (!window.confirm(`Modifier le statut de la commande n°${order.number} ?`)) return;
    setSaving(true); setActionError(""); setMessage("");
    try {
      await customCreate(`/admin/orders/${id}/status`, access.token, { status: target, expected_status: order.status });
      setMessage("Statut mis à jour.");
      await load();
      setNotesAttempt((current) => current + 1);
    } catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };
  const pickup = order && isPickup(order);
  const nextStatus = order?.status === "processing" ? (pickup ? "completed" : "shipped") : order?.status === "shipped" ? "completed" : null;
  return (
    <DetailLayout access={access} title={order ? `Commande n°${order.number}` : "Fiche commande"} backTo="/admin" backLabel="Retour au tableau de bord">
      {state.loading && <p role="status">Chargement de la commande...</p>}
      {state.error && <div role="alert" className={DETAIL_CARD}>Impossible de charger la commande : {state.error} <button type="button" onClick={load} className="font-semibold underline">Réessayer</button></div>}
      {message && <p role="status" className="mb-4 text-sm text-forest">{message}</p>}
      {actionError && <p role="alert" className="mb-4 rounded-lg bg-[#fff5f2] p-3 text-sm text-[#8a2c1b]">{actionError}</p>}
      {order && (
        <div className="grid gap-5">
          <section className={DETAIL_CARD}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-lg font-bold text-forest-deep">Commande</h2>
                <p className="mt-2 text-sm">Statut : <strong>{statusOf(order).label}</strong></p>
                <p className="text-sm">Créée le {formatDate(order.date_created)} · Paiement : {decodeHtml(order.payment_method_title || "Non renseigné")}</p>
                <p className="text-sm">Payée le : {formatDate(order.date_paid)}</p>
                <p className="text-sm">Réception : {pickup ? "Retrait en boutique" : order.shipping_lines?.map((line) => decodeHtml(line.method_title)).join(", ") || "Non renseignée"}</p>
              </div>
              {nextStatus && <button type="button" disabled={saving || editing} onClick={() => updateStatus(nextStatus)} className={DETAIL_BUTTON}>{nextStatus === "shipped" ? "Marquer expédiée" : pickup ? "Remise au client" : "Marquer terminée"}</button>}
            </div>
            {order.customer_note && <p className="mt-3 text-sm">Note du client : {order.customer_note}</p>}
          </section>
          <section className={DETAIL_CARD}>
            <h2 className="mb-3 text-lg font-bold text-forest-deep">Produits commandés</h2>
            <ul className="divide-y divide-line">
              {order.line_items.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <div>{item.product_id ? <Link to={`/admin/produits/${item.product_id}`} className="font-semibold text-gold hover:underline">{decodeHtml(item.name)}</Link> : <strong>{decodeHtml(item.name)}</strong>}
                  <p>Quantité : {item.quantity} · Total HT : {money(item.total, order.currency)} · TVA : {money(item.total_tax, order.currency)}</p>
                  {item.meta_data?.filter((meta) => !meta.key?.startsWith("_") && meta.display_key && meta.display_value && typeof meta.display_value === "string").map((meta) => <p key={meta.id}>{decodeHtml(meta.display_key)} : {decodeHtml(meta.display_value)}</p>)}
                </div>
              </li>)}
            </ul>
            <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <p>Remise : {money(order.discount_total, order.currency)} HT</p>
              <p>Livraison : {money(order.shipping_total, order.currency)} HT</p>
              {order.fee_lines?.map((fee) => <p key={fee.id}>{decodeHtml(fee.name)} : {money(fee.total, order.currency)} HT</p>)}
              <p>TVA totale : {money(order.total_tax, order.currency)}</p>
              <p className="font-bold">Total : {money(order.total, order.currency)}</p>
              {order.coupon_lines?.length > 0 && <p>Codes promo : {order.coupon_lines.map((coupon) => coupon.code).join(", ")}</p>}
              {order.refunds?.map((refund) => <p key={refund.id}>Remboursement : {money(refund.total, order.currency)} {refund.reason && `— ${refund.reason}`}</p>)}
            </div>
          </section>
          {editing ? (
            <form onSubmit={saveAddresses} className="grid gap-4">
              <p className="text-sm text-muted">Modifier une adresse ne recalcule ni les frais ni les taxes et ne crée pas d’étiquette de livraison.</p>
              <div className="grid gap-4 xl:grid-cols-2">
                <AddressFields title="Facturation et contact" billing value={billing} onChange={(key, value) => setBilling((current) => ({ ...current, [key]: value }))} />
                <AddressFields title="Adresse de livraison enregistrée" value={shipping} onChange={(key, value) => setShipping((current) => ({ ...current, [key]: value }))} />
              </div>
              <div className="flex gap-3"><button type="submit" disabled={saving} className={DETAIL_BUTTON}>{saving ? "Enregistrement..." : "Enregistrer les coordonnées"}</button><button type="button" disabled={saving} onClick={() => setEditing(false)} className="rounded-lg border border-line px-4 py-2 text-sm">Annuler</button></div>
            </form>
          ) : (
            <section className={DETAIL_CARD}>
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-forest-deep">Coordonnées</h2><button type="button" onClick={beginEdit} className={DETAIL_BUTTON}>Modifier</button></div>
              <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                {[["Facturation et contact", order.billing], ["Adresse de livraison enregistrée", order.shipping]].map(([title, address]) => <div key={title}>
                  <h3 className="mb-1 font-semibold">{title}</h3>
                  <p>{[address.first_name, address.last_name].filter(Boolean).join(" ") || "—"}</p>
                  {[address.company, address.address_1, address.address_2, [address.postcode, address.city].filter(Boolean).join(" "), address.state, address.country, address.phone, address.email].filter(Boolean).map((part, index) => <p key={index}>{part}</p>)}
                </div>)}
              </div>
              {pickup && <p className="mt-4 text-sm">Adresse du retrait en boutique : {PICKUP_ADDRESS}</p>}
            </section>
          )}
          <section className={DETAIL_CARD}>
            <h2 className="mb-3 text-lg font-bold text-forest-deep">Notes de commande</h2>
            {notes.loading ? <p role="status" className="text-sm">Chargement des notes...</p>
              : notes.error ? <p role="alert" className="text-sm text-[#8a2c1b]">Impossible de charger les notes : {notes.error} <button type="button" onClick={() => setNotesAttempt((current) => current + 1)} className="font-semibold underline">Réessayer</button></p>
                : notes.items.length ? <ul className="divide-y divide-line">{notes.items.map((note) => <li key={note.id} className="py-2 text-sm"><p className="whitespace-pre-wrap">{htmlToText(note.note.replace(/<br\s*\/?>/gi, "\n"))}</p><p className="text-xs text-muted">{formatDate(note.date_created)} · {note.customer_note ? "Note au client" : "Note interne"}{note.author && ` · ${note.author}`}</p></li>)}</ul>
                  : <p className="text-sm text-muted">Aucune note.</p>}
          </section>
        </div>
      )}
    </DetailLayout>
  );
}
