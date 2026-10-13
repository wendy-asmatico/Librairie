import { useState } from "react";
import { WP_ADMIN_URL } from "../../admin/api";
import { avatarBg, customerName, initials, isPickup, money, shortDate } from "../../admin/format";
import { decodeHtml } from "../../utils/decodeHtml";

import modePickup from "../../assets/admin/mode-pickup.svg";
import modeDelivery from "../../assets/admin/mode-delivery.svg";
import stReady from "../../assets/admin/status-ready.svg";
import stProcessing from "../../assets/admin/status-processing.svg";
import stPaid from "../../assets/admin/status-paid.svg";
import stShipped from "../../assets/admin/status-shipped.svg";
import stCancelled from "../../assets/admin/status-cancelled.svg";

// Statut WooCommerce → pastille de la maquette
function statusOf(order) {
  const pickup = isPickup(order);
  switch (order.status) {
    case "processing":
      return { label: "En préparation", icon: stProcessing, cls: "bg-cream text-gold" };
    case "completed":
      return pickup
        ? { label: "Retirée", icon: stReady, cls: "bg-leaf-soft text-forest-deep" }
        : { label: "Expédiée", icon: stShipped, cls: "bg-[#eceee9] text-ink" };
    case "on-hold":
      return { label: "En attente", icon: stProcessing, cls: "bg-[#eceee9] text-ink" };
    case "pending":
      return { label: "Paiement en attente", icon: stProcessing, cls: "bg-[#eceee9] text-ink" };
    case "cancelled":
    case "failed":
      return { label: order.status === "failed" ? "Échouée" : "Annulée", icon: stCancelled, cls: "bg-[#f8dcd5] text-[#8a2c1b]" };
    case "refunded":
      return { label: "Remboursée", icon: stCancelled, cls: "bg-[#f8dcd5] text-[#8a2c1b]" };
    default:
      return { label: "Payée", icon: stPaid, cls: "bg-mint text-forest-deep" };
  }
}

const FILTERS = [
  { key: "all", label: "Toutes", test: () => true },
  { key: "todo", label: "À préparer", test: (o) => o.status === "processing" },
  { key: "pickup", label: "Retraits", test: (o) => isPickup(o) },
];

const TH = "text-[10px] leading-[14px] font-bold tracking-[0.8px] text-muted uppercase";

// Dernières commandes — maquette 210:3
export default function LatestOrders({ orders, search }) {
  const [filter, setFilter] = useState("all");
  const term = search.trim().toLowerCase();
  const rows = orders
    .filter(FILTERS.find((f) => f.key === filter).test)
    .filter((o) => {
      if (!term) return true;
      const hay = [
        o.number,
        o.billing?.first_name,
        o.billing?.last_name,
        o.billing?.email,
        ...o.line_items.map((l) => l.name),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    })
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white px-6 pt-6 pb-3 font-sans shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] leading-4 font-bold tracking-[0.55px] text-gold uppercase">Commandes</p>
          <p className="font-serif text-[22px] leading-[30px] font-bold text-forest-deep">Dernières commandes</p>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Filtrer les commandes">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs leading-4 font-semibold transition-colors ${
                filter === f.key ? "border-sage bg-sage text-white" : "border-line bg-white text-ink hover:bg-mint"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <a
          href={`${WP_ADMIN_URL}/admin.php?page=wc-orders`}
          target="_blank"
          rel="noreferrer"
          className="text-xs leading-4 font-semibold text-gold hover:underline"
        >
          Tout voir →
        </a>
      </div>

      <div className="-mx-6 overflow-x-auto px-6">
        <div className="min-w-[760px]">
          <div className="flex items-center gap-3 rounded-lg bg-[#f8fbf6] px-3 py-2.5">
            <span className={`w-[88px] ${TH}`}>N°</span>
            <span className={`flex-1 ${TH}`}>Client</span>
            <span className={`w-[72px] ${TH}`}>Date</span>
            <span className={`w-24 ${TH}`}>Mode</span>
            <span className={`w-[76px] text-right ${TH}`}>Montant</span>
            <span className={`w-[150px] ${TH}`}>Statut</span>
          </div>

          {rows.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">Aucune commande à afficher.</p>
          )}

          {rows.map((o, i) => {
            const st = statusOf(o);
            const pickup = isPickup(o);
            const items = o.line_items.map((l) => decodeHtml(l.name)).join(", ");
            return (
              <a
                key={o.id}
                href={`${WP_ADMIN_URL}/admin.php?page=wc-orders&action=edit&id=${o.id}`}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 p-3 transition-colors hover:bg-ivory ${
                  i < rows.length - 1 ? "border-b border-[#eef2ea]" : ""
                }`}
              >
                <span className="w-[88px] text-xs leading-4 font-semibold text-gold">#{o.number}</span>
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] leading-[14px] font-bold text-gold ${avatarBg(o.id)}`}
                  >
                    {initials(o.billing?.first_name, o.billing?.last_name)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] leading-[18px] font-semibold text-ink">{customerName(o)}</span>
                    <span className="truncate text-xs leading-4 text-muted">{items}</span>
                  </span>
                </span>
                <span className="w-[72px] text-[13px] leading-[18px] text-ink">{shortDate(o.date_created)}</span>
                <span className="flex w-24 items-center gap-1.5 text-[13px] leading-[18px] text-ink">
                  <img src={pickup ? modePickup : modeDelivery} alt="" className="size-[13px]" />
                  {pickup ? "Retrait" : "Livraison"}
                </span>
                <span className="w-[76px] text-right text-[13px] leading-[18px] font-bold text-forest-deep">
                  {money(o.total, o.currency)}
                </span>
                <span className="w-[150px]">
                  <span className={`inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 text-[11px] leading-4 font-semibold ${st.cls}`}>
                    <img src={st.icon} alt="" className="size-[11px]" />
                    {st.label}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
