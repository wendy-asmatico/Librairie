import { useEffect, useState } from "react";

import { wcFetch, WP_ADMIN_URL } from "../../admin/api";
import { decodeHtml } from "../../utils/decodeHtml";

export function hasProductTaxClass(classes, value) {
  return classes.some((item) => (item.slug === "standard" ? "" : item.slug) === value);
}

export function useProductTaxClasses(token) {
  const [state, setState] = useState({ loading: true, error: "", classes: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setState({ loading: true, error: "", classes: [] });
    wcFetch("/taxes/classes", token)
      .then(({ data }) => {
        if (!Array.isArray(data) || !data.every((item) => typeof item?.slug === "string" && typeof item?.name === "string") || !data.some((item) => item.slug === "standard")) {
          throw new Error("La liste des classes de TVA reçue est invalide.");
        }
        if (!cancelled) setState({ loading: false, error: "", classes: data });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, error: error.message || "Impossible de charger les classes de TVA.", classes: [] });
      });
    return () => { cancelled = true; };
  }, [token, attempt]);

  return { ...state, retry: () => setAttempt((current) => current + 1) };
}

export default function ProductTax({ taxStatus, taxClass, onStatusChange, onClassChange, taxClasses }) {
  const classes = taxClasses.classes.map((item) => ({
    value: item.slug === "standard" ? "" : item.slug,
    label: item.slug === "standard" ? "Taux standard" : decodeHtml(item.name),
  }));
  const missingClass = !classes.some((item) => item.value === taxClass);

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-line bg-white p-3">
      <legend className="px-1 text-sm font-semibold text-ink">TVA</legend>
      {taxClasses.loading ? (
        <p className="text-sm text-muted">Chargement des classes de TVA...</p>
      ) : taxClasses.error ? (
        <div role="alert" className="text-sm text-[#8a2c1b]">
          <p>Impossible de charger les classes de TVA : {taxClasses.error}</p>
          <button type="button" onClick={taxClasses.retry} className="mt-1 font-semibold underline">Réessayer</button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Statut fiscal
            <select value={taxStatus} onChange={onStatusChange} className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage">
              <option value="taxable">Produit et livraison taxables</option>
              <option value="shipping">Livraison uniquement</option>
              <option value="none">Aucune taxe</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Classe de TVA
            <select value={taxClass} onChange={onClassChange} className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage">
              {missingClass && <option value={taxClass}>Classe actuelle indisponible ({taxClass || "standard"})</option>}
              {classes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
      )}
      <p className="text-xs text-muted">
        Les taux et le calcul des prix HT ou TTC dépendent des réglages WooCommerce et de l&apos;adresse applicable.{" "}
        <a href={`${WP_ADMIN_URL}/admin.php?page=wc-settings&tab=tax`} target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">Configurer les taxes dans WooCommerce</a>
      </p>
    </fieldset>
  );
}
