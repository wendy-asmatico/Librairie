import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../../components/Admin/Sidebar";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Seo from "../../components/Seo";
import ProductImages, { moveMainImage } from "../../components/Admin/ProductImages";
import ProductTax, { hasProductTaxClass, useProductTaxClasses } from "../../components/Admin/ProductTax";

import { wcFetchAll, wcRemove, wcUpdate, wpUploadMedia } from "../../admin/api";
import { decodeHtml } from "../../utils/decodeHtml";
import { fetchCurrentUserThunk } from "../../thunkActionsCreator/userThunks";
import { logout } from "../../slices/userSlice";
import { openModal } from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";

function Gate({ title, text, action }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory p-6 font-sans">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-line bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-bold tracking-[1.2px] text-gold uppercase">Espace administrateur</p>
        <h1 className="font-serif text-2xl font-bold text-forest-deep">{title}</h1>
        <p className="text-sm text-ink">{text}</p>
        {action}
        <Link to="/" className="text-xs font-semibold text-gold hover:underline">
          ← Retour à la boutique
        </Link>
      </div>
      <Modal />
      <Toast />
    </div>
  );
}

const EMPTY_EDIT_FORM = {
  id: null,
  name: "",
  sku: "",
  regularPrice: "",
  taxStatus: "taxable",
  taxClass: "",
  originalTaxClass: "",
  stockQuantity: "",
  status: "draft",
  shortDescription: "",
  description: "",
  categoryIds: [],
  images: [],
  imagesChanged: false,
};

const FILTERS = [
  { key: "all", label: "Tous les produits" },
  { key: "low-stock", label: "Stock faible" },
  { key: "out-of-stock", label: "Rupture" },
];

function toPrice(value) {
  return value.replace(",", ".").trim();
}

function normalizeForSearch(value) {
  return decodeHtml(String(value || "")).toLowerCase();
}

export default function AdminProducts() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);
  const isAdmin = profile?.roles?.some((r) => ["administrator", "shop_manager"].includes(r));
  const taxClasses = useProductTaxClasses(isAdmin ? token : null);
  const { isOpen: modalOpen, modalName } = useSelector((state) => state.modal);
  const wasAddingProduct = useRef(false);
  const imageSequence = useRef(0);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState(searchParams.get("filter") === "stock" ? "low-stock" : "all");
  const [state, setState] = useState({ loading: true, error: null, products: [], categories: [] });
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (token && !profile?.roles) dispatch(fetchCurrentUserThunk());
  }, [token, profile?.roles, dispatch]);

  const loadProducts = useCallback(async () => {
    if (!token || !isAdmin) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [products, categories] = await Promise.all([
        wcFetchAll("/products", token, { per_page: 100, status: "any", orderby: "date", order: "desc" }),
        wcFetchAll("/products/categories", token, { per_page: 100, hide_empty: false, orderby: "name", order: "asc" }, Infinity),
      ]);
      setState({
        loading: false,
        error: null,
        products: products.items || [],
        categories: categories.items || [],
      });
    } catch (error) {
      setState({ loading: false, error: error.message, products: [], categories: [] });
    }
  }, [token, isAdmin]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (modalOpen && modalName === "modalAddProduct") {
      wasAddingProduct.current = true;
    } else if (wasAddingProduct.current) {
      wasAddingProduct.current = false;
      loadProducts();
    }
  }, [modalOpen, modalName, loadProducts]);

  const categoryById = useMemo(
    () => Object.fromEntries(state.categories.map((category) => [category.id, category])),
    [state.categories],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return state.products
      .filter((product) => {
        if (filter === "low-stock") {
          return product.manage_stock && product.stock_quantity !== null && product.stock_quantity > 0 && product.stock_quantity <= 5;
        }
        if (filter === "out-of-stock") {
          return product.stock_status === "outofstock" || (product.manage_stock && Number(product.stock_quantity) <= 0);
        }
        return true;
      })
      .filter((product) => {
        if (!term) return true;
        const haystack = [
          normalizeForSearch(product.name),
          normalizeForSearch(product.sku),
          normalizeForSearch(product.short_description),
          ...product.categories.map((category) => normalizeForSearch(category.name)),
        ].join(" ");
        return haystack.includes(term);
      });
  }, [state.products, search, filter]);

  const openEdit = (product) => {
    if (saving) return;
    setEditForm({
      id: product.id,
      name: decodeHtml(product.name || ""),
      sku: product.sku || "",
      regularPrice: product.regular_price || "",
      taxStatus: product.tax_status,
      taxClass: product.tax_class,
      originalTaxClass: product.tax_class,
      stockQuantity: product.manage_stock && product.stock_quantity !== null ? String(product.stock_quantity) : "",
      status: product.status || "draft",
      shortDescription: decodeHtml(product.short_description || ""),
      description: decodeHtml(product.description || ""),
      categoryIds: product.categories.map((category) => category.id),
      images: (product.images || []).map((image) => ({
        key: `existing-${image.id}`,
        id: image.id,
        src: image.src,
        name: decodeHtml(image.name || ""),
        alt: decodeHtml(image.alt || ""),
      })),
      imagesChanged: false,
    });
    setEditError("");
  };

  const closeEdit = () => {
    if (saving) return;
    setEditForm(EMPTY_EDIT_FORM);
    setEditError("");
  };

  const onEditField = (field) => (event) => {
    const value = event.target.value;
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const toggleEditCategory = (categoryId) => {
    setEditForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : current.categoryIds.concat(categoryId),
    }));
  };

  const addEditImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const images = files.map((file) => ({
      key: `new-${++imageSequence.current}`,
      file,
      name: file.name,
    }));
    setEditForm((current) => ({ ...current, images: [...current.images, ...images], imagesChanged: true }));
  };

  const removeEditImage = (key) => {
    setEditForm((current) => ({
      ...current,
      images: current.images.filter((image) => image.key !== key),
      imagesChanged: true,
    }));
  };

  const setMainEditImage = (key) => {
    setEditForm((current) => {
      return { ...current, images: moveMainImage(current.images, key), imagesChanged: true };
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!token || !editForm.id || saving) return;
    setEditError("");

    const name = editForm.name.trim();
    if (!name) {
      dispatch(showToast("Le nom du produit est obligatoire."));
      return;
    }

    const regularPrice = toPrice(editForm.regularPrice);
    if (regularPrice && (Number.isNaN(Number(regularPrice)) || Number(regularPrice) < 0)) {
      dispatch(showToast("Le prix doit être un nombre positif."));
      return;
    }

    const stockQuantity = editForm.stockQuantity.trim();
    if (stockQuantity && (!/^\d+$/.test(stockQuantity) || Number(stockQuantity) < 0)) {
      dispatch(showToast("Le stock doit être un entier positif."));
      return;
    }
    if (editForm.taxClass !== editForm.originalTaxClass && (taxClasses.loading || taxClasses.error)) {
      setEditError("Rechargez les classes de TVA avant d'enregistrer la modification de la classe.");
      return;
    }
    if (editForm.taxClass !== editForm.originalTaxClass && !hasProductTaxClass(taxClasses.classes, editForm.taxClass)) {
      setEditError("La classe de TVA choisie n'est plus disponible. Sélectionnez-en une autre.");
      return;
    }

    const payload = {
      name,
      sku: editForm.sku.trim() || undefined,
      regular_price: regularPrice || "",
      tax_status: editForm.taxStatus,
      status: editForm.status,
      short_description: editForm.shortDescription.trim() || "",
      description: editForm.description.trim() || "",
      manage_stock: Boolean(stockQuantity),
      stock_quantity: stockQuantity ? Number(stockQuantity) : null,
      categories: editForm.categoryIds.map((id) => ({ id })),
    };
    if (editForm.taxClass !== editForm.originalTaxClass) payload.tax_class = editForm.taxClass;

    setSaving(true);
    try {
      if (editForm.imagesChanged) {
        const images = [];
        for (const image of editForm.images) {
          let id = image.id;
          if (!id) {
            const media = await wpUploadMedia(image.file, token);
            id = media.id;
            setEditForm((current) => ({
              ...current,
              images: current.images.map((item) => item.key === image.key ? { ...item, id, src: media.source_url } : item),
            }));
          }
          images.push({ id });
        }
        payload.images = images;
      }
      await wcUpdate(`/products/${editForm.id}`, token, payload);
      dispatch(showToast(`Produit « ${name} » mis à jour.`));
      setEditForm(EMPTY_EDIT_FORM);
      await loadProducts();
    } catch (error) {
      setEditError(error.message || "Impossible de modifier le produit.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!token) return;
    const confirmation = window.confirm(`Supprimer définitivement « ${decodeHtml(product.name)} » ?`);
    if (!confirmation) return;

    setDeletingId(product.id);
    try {
      await wcRemove(`/products/${product.id}`, token, { force: true });
      dispatch(showToast(`Produit « ${decodeHtml(product.name)} » supprimé.`));
      if (editForm.id === product.id) setEditForm(EMPTY_EDIT_FORM);
      await loadProducts();
    } catch (error) {
      dispatch(showToast(error.message || "Impossible de supprimer le produit."));
    } finally {
      setDeletingId(null);
    }
  };

  if (!token) {
    return (
      <Gate
        title="Connexion requise"
        text="Connectez-vous avec un compte administrateur pour gérer les produits."
        action={
          <button
            type="button"
            onClick={() => dispatch(openModal({ name: "auth", props: { view: "login" } }))}
            className="mt-2 cursor-pointer rounded-lg bg-gold px-5 py-3 text-[13px] font-semibold text-white hover:bg-gold-dark"
          >
            Se connecter
          </button>
        }
      />
    );
  }

  if (!profile?.roles) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        title="Accès réservé"
        text="Ce compte n'a pas les droits d'administration de la boutique."
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-ivory font-sans">
      <Seo title="Produits — Espace administrateur" noIndex />
      <Sidebar
        badges={{}}
        user={profile}
        onLogout={() => dispatch(logout())}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-9 lg:py-8">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-line bg-white lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-forest stroke-2" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex min-w-[260px] flex-1 flex-col gap-1">
            <p className="text-[11px] leading-4 font-semibold tracking-[1.2px] text-gold uppercase">Gestion WooCommerce</p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[34px] leading-[44px] font-semibold text-forest-deep lg:text-[40px]">
              Produits
            </h1>
            <p className="text-sm leading-[22px] text-ink">
              Tableau de gestion des produits (modification et suppression incluses).
            </p>
          </div>

          <label className="flex w-full max-w-sm items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un produit, SKU, catégorie…"
              className="w-full bg-transparent text-[13px] leading-[18px] text-ink outline-none placeholder:text-muted"
              aria-label="Rechercher un produit"
            />
          </label>

          <button
            type="button"
            onClick={() => dispatch(openModal({ name: "modalAddProduct" }))}
            className="cursor-pointer rounded-lg bg-gold px-[18px] py-3 text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-white transition-colors hover:bg-gold-dark"
          >
            Ajouter un produit
          </button>

          <button
            type="button"
            onClick={loadProducts}
            className="cursor-pointer rounded-lg border border-line bg-white px-[18px] py-3 text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-ink transition-colors hover:bg-ivory"
          >
            Actualiser
          </button>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs leading-4 font-semibold transition-colors ${
                filter === item.key ? "border-sage bg-sage text-white" : "border-line bg-white text-ink hover:bg-mint"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {state.error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
            <span>Impossible de charger les produits : {state.error}</span>
            <button type="button" onClick={loadProducts} className="cursor-pointer font-semibold underline">
              Réessayer
            </button>
          </div>
        )}

        {state.loading && !state.products.length ? (
          <div className="flex justify-center py-24">
            <Loader size="lg" />
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${state.loading ? "opacity-60" : ""}`}>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left">
                <thead className="bg-[#f8fbf6]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Produit</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">SKU</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Prix</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Stock</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Catégories</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Statut</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!filteredProducts.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                        Aucun produit trouvé.
                      </td>
                    </tr>
                  )}
                  {filteredProducts.map((product) => {
                    const productName = decodeHtml(product.name || "");
                    const categories = product.categories.map((category) => decodeHtml(category.name)).join(", ");
                    const stockLabel = product.manage_stock
                      ? `${product.stock_quantity ?? 0} (${product.stock_status === "outofstock" ? "rupture" : "suivi"})`
                      : product.stock_status === "outofstock"
                        ? "Rupture"
                        : "Non géré";
                    return (
                      <tr key={product.id} className="border-t border-[#eef2ea]">
                        <td className="px-4 py-3 text-sm font-semibold text-ink"><Link to={`/admin/produits/${product.id}`} className="text-gold hover:underline">{productName}</Link></td>
                        <td className="px-4 py-3 text-sm text-ink">{product.sku || "—"}</td>
                        <td className="px-4 py-3 text-sm text-ink">{product.regular_price ? `${product.regular_price} €` : "—"}</td>
                        <td className="px-4 py-3 text-sm text-ink">{stockLabel}</td>
                        <td className="px-4 py-3 text-sm text-ink">{categories || "—"}</td>
                        <td className="px-4 py-3 text-sm text-ink">{product.status === "publish" ? "Publié" : "Brouillon"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              disabled={saving}
                              className="cursor-pointer rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product)}
                              disabled={deletingId === product.id}
                              className="cursor-pointer rounded-md border border-[#f0c9c1] px-2.5 py-1.5 text-xs font-semibold text-[#8a2c1b] hover:bg-[#fff5f2] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {deletingId === product.id ? "Suppression..." : "Supprimer"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {editForm.id && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-[760px] max-w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[1.2px] text-gold uppercase">Modification produit</p>
                <h2 className="font-serif text-[28px] leading-[34px] font-bold text-forest-deep">{editForm.name || "Produit"}</h2>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="cursor-pointer rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <fieldset disabled={saving} className="flex flex-col gap-4 disabled:opacity-70">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Nom du produit *
                <input
                  type="text"
                  value={editForm.name}
                  onChange={onEditField("name")}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  SKU
                  <input
                    type="text"
                    value={editForm.sku}
                    onChange={onEditField("sku")}
                    className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  Prix (€)
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editForm.regularPrice}
                    onChange={onEditField("regularPrice")}
                    className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  Stock
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editForm.stockQuantity}
                    onChange={onEditField("stockQuantity")}
                    className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                    placeholder="Vide = non géré"
                  />
                </label>
              </div>

              <ProductTax
                taxStatus={editForm.taxStatus}
                taxClass={editForm.taxClass}
                onStatusChange={onEditField("taxStatus")}
                onClassChange={onEditField("taxClass")}
                taxClasses={taxClasses}
              />

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Statut
                <select
                  value={editForm.status}
                  onChange={onEditField("status")}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                >
                  <option value="draft">Brouillon</option>
                  <option value="publish">Publié</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Description courte
                <textarea
                  rows={4}
                  value={editForm.shortDescription}
                  onChange={onEditField("shortDescription")}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Description détaillée
                <textarea
                  rows={6}
                  value={editForm.description}
                  onChange={onEditField("description")}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                />
              </label>

              <fieldset className="flex flex-col gap-2 rounded-lg border border-line bg-white p-3">
                <legend className="px-1 text-sm font-semibold text-ink">Catégories</legend>
                <div className="max-h-44 space-y-1 overflow-auto pr-1">
                  {state.categories.map((category) => (
                    <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-ivory">
                      <input
                        type="checkbox"
                        checked={editForm.categoryIds.includes(category.id)}
                        onChange={() => toggleEditCategory(category.id)}
                      />
                      <span className="text-sm font-normal text-ink">
                        {decodeHtml(category.name)}
                        {category.parent ? ` — ${decodeHtml(categoryById[category.parent]?.name || "")}` : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <ProductImages images={editForm.images} onAdd={addEditImages} onRemove={removeEditImage} onSetMain={setMainEditImage} />
              </fieldset>

              {editError && <p role="alert" className="rounded-lg border border-[#f8dcd5] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a2c1b]">Impossible de modifier le produit : {editError}</p>}

              <div className="mt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="cursor-pointer rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal />
      <Toast />
    </div>
  );
}
