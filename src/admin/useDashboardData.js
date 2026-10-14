import { useCallback, useEffect, useState } from "react";
import { customFetch, wcFetch, wcFetchAll } from "./api";
import { evolution, isPickup } from "./format";
import { decodeHtml } from "../utils/decodeHtml";

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isoDay = (d) => d.toISOString().slice(0, 10);
const LOW_STOCK_LIMIT = 5;

// Charge toutes les données du tableau de bord pour les `days` derniers jours
export default function useDashboardData(token, days) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const load = useCallback(async () => {
    if (!token) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const now = new Date();
      const from = new Date(startOfDay(now).getTime() - (days - 1) * DAY);
      const prevFrom = new Date(from.getTime() - days * DAY);

      const [orders, prevOrders, latest, processing, customers, products, messages] = await Promise.all([
        wcFetchAll("/orders", token, { after: from.toISOString(), status: "any" }),
        wcFetchAll("/orders", token, {
          after: prevFrom.toISOString(),
          before: from.toISOString(),
          status: "any",
        }),
        wcFetch("/orders", token, { per_page: 30, orderby: "date", order: "desc" }),
        wcFetchAll("/orders", token, { status: "processing" }),
        wcFetchAll("/customers", token, { orderby: "registered_date", order: "desc", role: "all" }, 3),
        // stock_status côté API dépend d'une table de recherche pas toujours à jour : on filtre ici
        wcFetchAll("/products", token, { status: "publish" }),
        // Formulaire de contact (mu-plugin contact.php) : le tableau de bord reste utilisable sans
        customFetch("/contact-messages", token, { per_page: 3 }).catch(() => null),
      ]);

      // Commandes et retraits par jour
      const valid = orders.items.filter((o) => !["cancelled", "failed", "trash"].includes(o.status));
      const prevValid = prevOrders.items.filter(
        (o) => !["cancelled", "failed", "trash"].includes(o.status),
      );
      const daily = Array.from({ length: days }, (_, i) => {
        const date = new Date(from.getTime() + i * DAY);
        return { date, key: isoDay(date), orders: 0, pickups: 0 };
      });
      const byKey = Object.fromEntries(daily.map((d) => [d.key, d]));
      valid.forEach((o) => {
        const day = byKey[isoDay(startOfDay(new Date(o.date_created)))];
        if (!day) return;
        day.orders += 1;
        if (isPickup(o)) day.pickups += 1;
      });

      // Nouveaux clients
      const inRange = (iso, a, b) => {
        const t = new Date(iso).getTime();
        return t >= a.getTime() && (!b || t < b.getTime());
      };
      const newCustomers = customers.items.filter((c) => inRange(c.date_created, from));
      const prevCustomers = customers.items.filter((c) => inRange(c.date_created, prevFrom, from));

      // Répartition par rayon (catégorie de 1er niveau des produits vendus)
      const productIds = [...new Set(valid.flatMap((o) => o.line_items.map((l) => l.product_id)))];
      let rayons = [];
      if (productIds.length) {
        const [{ items: sold }, { items: cats }] = await Promise.all([
          wcFetchAll("/products", token, { include: productIds.slice(0, 100).join(",") }),
          wcFetchAll("/products/categories", token, { hide_empty: false }),
        ]);
        const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
        const topLevel = (id) => {
          let c = catById[id];
          while (c && c.parent) c = catById[c.parent];
          return c;
        };
        const productRayon = Object.fromEntries(
          sold.map((p) => [p.id, decodeHtml(topLevel(p.categories?.[0]?.id)?.name || "Autres")]),
        );
        const counts = {};
        valid.forEach((o) => {
          const names = new Set(o.line_items.map((l) => productRayon[l.product_id] || "Autres"));
          names.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
        });
        const sum = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        rayons = Object.entries(counts)
          .map(([name, count]) => ({ name, count, share: (count / sum) * 100 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
      }

      // Stock faible
      const lowStock = products.items
        .filter(
          (p) =>
            p.manage_stock &&
            p.stock_quantity !== null &&
            p.stock_quantity > 0 &&
            p.stock_quantity <= LOW_STOCK_LIMIT,
        )
        .sort((a, b) => a.stock_quantity - b.stock_quantity);

      const pickups = valid.filter(isPickup);
      const prevPickups = prevValid.filter(isPickup);

      setState({
        loading: false,
        error: null,
        data: {
          from,
          daily,
          kpis: {
            orders: { value: valid.length, evolution: evolution(valid.length, prevValid.length) },
            pickups: { value: pickups.length, evolution: evolution(pickups.length, prevPickups.length) },
            customers: {
              value: newCustomers.length,
              evolution: evolution(newCustomers.length, prevCustomers.length),
            },
          },
          latest: latest.data || [],
          toPrepare: processing.items.length,
          pickupsToPrepare: processing.items.filter(isPickup).length,
          rayons,
          lowStock,
          messages,
        },
      });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
    }
  }, [token, days]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
