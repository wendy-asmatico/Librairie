import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DetailLayout, { DETAIL_BUTTON, DETAIL_CARD, DETAIL_INPUT, useAdminAccess } from "../../components/Admin/DetailLayout";
import { customCreate, wcFetch } from "../../admin/api";
import { money } from "../../admin/format";
import { decodeHtml, htmlToText } from "../../utils/decodeHtml";

export default function AdminProductDetail() {
  const { id } = useParams();
  const access = useAdminAccess();
  const [state, setState] = useState({ loading: true, error: "", product: null });
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    if (!access.token || !access.isAdmin) return;
    const sequence = ++loadSequence.current;
    setState({ loading: true, error: "", product: null });
    try {
      const { data } = await wcFetch(`/products/${id}`, access.token, { context: "edit" });
      if (sequence === loadSequence.current) {
        setState({ loading: false, error: "", product: data });
        setQuantity(data.stock_quantity === null ? "" : String(data.stock_quantity));
      }
    } catch (error) {
      if (sequence === loadSequence.current) setState({ loading: false, error: error.message, product: null });
    }
  }, [access.token, access.isAdmin, id]);
  useEffect(() => { load(); return () => { loadSequence.current += 1; }; }, [load]);
  const product = String(state.product?.id) === id ? state.product : null;

  const saveStock = async (event) => {
    event.preventDefault();
    if (saving) return;
    setActionError(""); setMessage("");
    if (!/^\d+$/.test(quantity) || !Number.isSafeInteger(Number(quantity))) {
      setActionError("Le stock doit être un nombre entier positif ou nul.");
      return;
    }
    if (!window.confirm(`Remplacer le stock de « ${decodeHtml(product.name)} » par ${quantity} ?`)) return;
    setSaving(true);
    try {
      await customCreate(`/admin/products/${id}/stock`, access.token, { quantity: Number(quantity), expected_quantity: product.stock_quantity });
      setMessage("Stock mis à jour.");
      await load();
    } catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };
  return (
    <DetailLayout access={access} title={product ? decodeHtml(product.name) : "Fiche produit"} backTo="/admin" backLabel="Retour au tableau de bord">
      {state.loading && <p role="status">Chargement du produit...</p>}
      {state.error && <div role="alert" className={DETAIL_CARD}>Impossible de charger le produit : {state.error} <button type="button" onClick={load} className="font-semibold underline">Réessayer</button></div>}
      {message && <p role="status" className="mb-4 text-sm text-forest">{message}</p>}
      {actionError && <p role="alert" className="mb-4 rounded-lg bg-[#fff5f2] p-3 text-sm text-[#8a2c1b]">{actionError}</p>}
      {product && <div className="grid gap-5">
        <section className={`${DETAIL_CARD} flex flex-wrap gap-5`}>
          {product.images?.[0]?.src && <img src={product.images[0].src} alt={product.images[0].alt || ""} className="size-36 rounded-lg object-cover" />}
          <div className="space-y-1 text-sm">
            <h2 className="text-lg font-bold text-forest-deep">Informations produit</h2>
            <p>SKU : {product.sku || "—"}</p>
            <p>Statut : {({ publish: "Publié", draft: "Brouillon", pending: "En attente", private: "Privé" })[product.status] || product.status}</p>
            <p>Prix normal : {product.regular_price !== "" ? money(product.regular_price) : "—"}</p>
            {product.sale_price !== "" && <p>Prix promotionnel : {money(product.sale_price)}</p>}
            <p>Catégories : {product.categories?.map((category) => decodeHtml(category.name)).join(", ") || "—"}</p>
            <p>TVA : {product.tax_status === "taxable" ? `Taxable · ${product.tax_class || "standard"}` : product.tax_status === "shipping" ? "Livraison uniquement" : "Aucune taxe"}</p>
            <p>Poids : {product.weight || "Non renseigné"}</p>
            {Object.values(product.dimensions || {}).some(Boolean) && <p>Dimensions : {[product.dimensions.length, product.dimensions.width, product.dimensions.height].map((value) => value || "—").join(" × ")}</p>}
            {product.attributes?.map((attribute) => <p key={attribute.id || attribute.name}>{decodeHtml(attribute.name)} : {attribute.options.map(decodeHtml).join(", ")}</p>)}
          </div>
        </section>
        {(product.short_description || product.description) && <section className={DETAIL_CARD}><h2 className="mb-2 text-lg font-bold text-forest-deep">Description</h2>{product.short_description && <p className="mb-3 whitespace-pre-wrap text-sm">{htmlToText(product.short_description)}</p>}{product.description && <p className="whitespace-pre-wrap text-sm">{htmlToText(product.description)}</p>}</section>}
        {product.images?.length > 1 && <section className={DETAIL_CARD}><h2 className="mb-3 text-lg font-bold text-forest-deep">Images</h2><div className="flex flex-wrap gap-3">{product.images.map((image) => <img key={image.id} src={image.src} alt={image.alt || ""} className="size-24 rounded-lg object-cover" />)}</div></section>}
        <section className={DETAIL_CARD}>
          <h2 className="mb-2 text-lg font-bold text-forest-deep">Stock</h2>
          <p className="mb-3 text-sm">Disponibilité : {({ instock: "En stock", outofstock: "Rupture", onbackorder: "Sur commande" })[product.stock_status] || product.stock_status}</p>
          {product.manage_stock && Number.isInteger(product.stock_quantity) ? (
            <form onSubmit={saveStock} className="flex flex-wrap items-end gap-3">
              <label className="text-sm font-semibold">Quantité en stock
                <input type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className={`${DETAIL_INPUT} mt-1`} required />
              </label>
              <button type="submit" disabled={saving} className={DETAIL_BUTTON}>{saving ? "Enregistrement..." : "Enregistrer le stock"}</button>
            </form>
          ) : <p className="text-sm text-muted">Le stock n’est pas suivi directement pour ce produit. Consultez sa configuration dans WooCommerce.</p>}
          <p className="mt-4 text-sm"><Link to="/admin/produits" className="font-semibold text-gold hover:underline">Gérer les autres informations du produit →</Link></p>
        </section>
      </div>}
    </DetailLayout>
  );
}
