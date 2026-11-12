import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { wcCreate, wcFetchAll, wpUploadMedia } from "../../admin/api";
import { decodeHtml } from "../../utils/decodeHtml";
import { closeModal } from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";
import ProductImages, { moveMainImage } from "../../components/Admin/ProductImages";
import ProductTax, { hasProductTaxClass, useProductTaxClasses } from "../../components/Admin/ProductTax";

const EMPTY_FORM = {
  name: "",
  regularPrice: "",
  taxStatus: "taxable",
  taxClass: "",
  sku: "",
  stockQuantity: "",
  status: "draft",
  shortDescription: "",
  description: "",
};

function toPrice(value) {
  return value.replace(",", ".").trim();
}

export default function ModalAddProduct() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const imageSequence = useRef(0);
  const taxClasses = useProductTaxClasses(token);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryParent, setCategoryParent] = useState("0");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryCreateError, setCategoryCreateError] = useState("");
  const [images, setImages] = useState([]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError("");

    wcFetchAll("/products/categories", token, { per_page: 100, hide_empty: false, orderby: "name", order: "asc" }, Infinity)
      .then((response) => {
        if (cancelled) return;
        setCategories(response.items);
      })
      .catch((loadingError) => {
        if (cancelled) return;
        setCategoriesError(loadingError.message || "Impossible de charger les catégories.");
      })
      .finally(() => {
        if (cancelled) return;
        setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : current.concat(categoryId),
    );
  };

  const onImagesChange = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const newImages = files.map((file) => ({
      key: `new-${++imageSequence.current}`,
      file,
      name: file.name,
    }));
    setImages((current) => [...current, ...newImages]);
  };

  const categoryOptions = useMemo(() => {
    const byParent = new Map();
    const categoryIds = new Set(categories.map((category) => category.id));
    for (const category of categories) {
      const parentId = categoryIds.has(category.parent) ? category.parent : 0;
      if (!byParent.has(parentId)) byParent.set(parentId, []);
      byParent.get(parentId).push(category);
    }

    for (const list of byParent.values()) {
      list.sort((a, b) => decodeHtml(a.name).localeCompare(decodeHtml(b.name), "fr"));
    }

    const result = [];
    const seen = new Set();
    const append = (category, depth, ancestors) => {
      if (seen.has(category.id)) return;
      seen.add(category.id);
      const name = decodeHtml(category.name);
      const path = [...ancestors, name];
      result.push({ category, depth, path: path.join(" › ") });
      for (const child of byParent.get(category.id) || []) append(child, depth + 1, path);
    };
    for (const category of byParent.get(0) || []) append(category, 0, []);
    for (const category of categories) append(category, 0, []);
    return result;
  }, [categories]);

  const createCategory = async () => {
    if (categorySaving || loading) return;
    const name = categoryName.trim();
    if (!name) {
      setCategoryCreateError("Le nom de la catégorie est obligatoire.");
      return;
    }
    if (!token) {
      setCategoryCreateError("Vous devez être connecté pour créer une catégorie.");
      return;
    }
    setCategoryCreateError("");
    setCategorySaving(true);
    try {
      const category = await wcCreate("/products/categories", token, { name, parent: Number(categoryParent) });
      setCategories((current) => [...current.filter((item) => item.id !== category.id), category]);
      setSelectedCategories((current) => current.includes(category.id) ? current : [...current, category.id]);
      setCategoryName("");
      setCategoryParent("0");
      setAddingCategory(false);
      dispatch(showToast(`Catégorie « ${decodeHtml(category.name)} » créée et sélectionnée.`));
    } catch (creationError) {
      setCategoryCreateError(creationError.message || "Impossible de créer la catégorie.");
    } finally {
      setCategorySaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (categorySaving || loading) return;
    setError("");

    const name = form.name.trim();
    if (!name) {
      setError("Le nom du produit est obligatoire.");
      return;
    }

    const regularPrice = toPrice(form.regularPrice);
    if (regularPrice && (Number.isNaN(Number(regularPrice)) || Number(regularPrice) < 0)) {
      setError("Le prix doit être un nombre positif.");
      return;
    }

    const stockQuantity = form.stockQuantity.trim();
    if (stockQuantity && (!/^\d+$/.test(stockQuantity) || Number(stockQuantity) < 0)) {
      setError("Le stock doit être un entier positif.");
      return;
    }

    if (!token) {
      setError("Vous devez être connecté pour créer un produit.");
      return;
    }
    if (taxClasses.loading || taxClasses.error) {
      setError("Chargez les classes de TVA avant de créer le produit.");
      return;
    }
    if (!hasProductTaxClass(taxClasses.classes, form.taxClass)) {
      setError("La classe de TVA choisie n'est plus disponible. Sélectionnez-en une autre.");
      return;
    }

    const payload = {
      name,
      status: form.status,
      sku: form.sku.trim() || undefined,
      short_description: form.shortDescription.trim() || undefined,
      description: form.description.trim() || undefined,
      regular_price: regularPrice || undefined,
      tax_status: form.taxStatus,
      tax_class: form.taxClass,
      manage_stock: Boolean(stockQuantity),
      stock_quantity: stockQuantity ? Number(stockQuantity) : undefined,
      categories: selectedCategories.map((id) => ({ id })),
    };

    setLoading(true);
    setLoadingMessage("Création du produit...");
    try {
      if (images.length) {
        setLoadingMessage("Envoi des images...");
        const uploadedImages = [];
        for (const image of images) {
          let id = image.id;
          if (!id) {
            const media = await wpUploadMedia(image.file, token);
            id = media.id;
            setImages((current) => current.map((item) => item.key === image.key ? { ...item, id, src: media.source_url } : item));
          }
          uploadedImages.push({ id });
        }
        payload.images = uploadedImages;
      }

      setLoadingMessage("Création du produit...");
      await wcCreate("/products", token, payload);
      dispatch(showToast(`Produit « ${name} » créé avec succès.`));
      dispatch(closeModal());
    } catch (creationError) {
      setError(creationError.message || "Impossible de créer le produit.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="w-[640px] max-w-[calc(100vw-32px)]">
      <div className="mb-5">
        <p className="text-[11px] font-bold tracking-[1.2px] text-gold uppercase">Catalogue</p>
        <h2 className="font-serif text-[30px] leading-[36px] font-bold text-forest-deep">Ajouter un produit</h2>
        <p className="mt-1 text-sm text-muted">Création rapide d&apos;un produit WooCommerce depuis l&apos;admin.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Nom du produit *
          <input
            type="text"
            value={form.name}
            onChange={updateField("name")}
            className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
            placeholder="Ex. Qamis Emirati blanc"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Prix (€)
            <input
              type="text"
              inputMode="decimal"
              value={form.regularPrice}
              onChange={updateField("regularPrice")}
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
              placeholder="19.90"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            SKU
            <input
              type="text"
              value={form.sku}
              onChange={updateField("sku")}
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
              placeholder="QAMIS-EMIRATI-BLANC"
            />
          </label>
        </div>

        <ProductTax
          taxStatus={form.taxStatus}
          taxClass={form.taxClass}
          onStatusChange={updateField("taxStatus")}
          onClassChange={updateField("taxClass")}
          taxClasses={taxClasses}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Stock
            <input
              type="text"
              inputMode="numeric"
              value={form.stockQuantity}
              onChange={updateField("stockQuantity")}
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
              placeholder="Ex. 15"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
            Statut
            <select
              value={form.status}
              onChange={updateField("status")}
              className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
            >
              <option value="draft">Brouillon</option>
              <option value="publish">Publié</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Description courte
          <textarea
            value={form.shortDescription}
            onChange={updateField("shortDescription")}
            rows={4}
            className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
            placeholder="Résumé affiché sur la fiche produit."
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Description détaillée
          <textarea
            value={form.description}
            onChange={updateField("description")}
            rows={6}
            className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
            placeholder="Contenu complet de la fiche produit."
          />
        </label>

        <fieldset className="flex flex-col gap-2 rounded-lg border border-line bg-white p-3">
          <legend className="px-1 text-sm font-semibold text-ink">Catégories</legend>
          {categoriesLoading ? (
            <p className="px-1 py-2 text-sm text-muted">Chargement des catégories...</p>
          ) : categoriesError ? (
            <p className="px-1 py-2 text-sm text-[#8a2c1b]">{categoriesError}</p>
          ) : categories.length ? (
            <div className="max-h-40 space-y-1 overflow-auto pr-1">
              {categoryOptions.map(({ category, depth }) => (
                <label key={category.id} style={{ paddingLeft: `${Math.min(depth, 6) * 1.5 + 0.375}rem` }} className="flex cursor-pointer items-center gap-2 rounded py-1 hover:bg-ivory">
                  <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} />
                  <span className={`text-sm text-ink ${depth === 0 ? "font-semibold" : "font-normal"}`}>{decodeHtml(category.name)}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="px-1 py-2 text-sm text-muted">Aucune catégorie disponible.</p>
          )}
          {!addingCategory ? (
            <button type="button" disabled={categoriesLoading || !!categoriesError || loading} onClick={() => setAddingCategory(true)} className="self-start text-sm font-semibold text-gold hover:underline disabled:opacity-50">
              + Créer une catégorie
            </button>
          ) : (
            <div className="flex flex-col gap-3 border-t border-line pt-3">
              <p className="text-xs text-muted">La catégorie sera créée immédiatement dans WooCommerce, même si vous annulez le produit.</p>
              <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
                Nom de la catégorie
                <input type="text" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); createCategory(); } }} disabled={categorySaving || loading} className="rounded-lg border border-line px-3 py-2 text-sm font-normal outline-none focus:border-sage" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-ink">
                Catégorie parente
                <select value={categoryParent} onChange={(event) => setCategoryParent(event.target.value)} disabled={categorySaving} className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-normal outline-none focus:border-sage">
                  <option value="0">Aucune (catégorie principale)</option>
                  {categoryOptions.map(({ category, path }) => <option key={category.id} value={category.id}>{path}</option>)}
                </select>
              </label>
              {categoryCreateError && <p role="alert" className="text-sm text-[#8a2c1b]">{categoryCreateError}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={categorySaving || loading} onClick={createCategory} className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50">{categorySaving ? "Création…" : "Créer et sélectionner"}</button>
                <button type="button" disabled={categorySaving} onClick={() => { setAddingCategory(false); setCategoryCreateError(""); }} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-ivory disabled:opacity-50">Annuler</button>
              </div>
            </div>
          )}
        </fieldset>

        <ProductImages
          images={images}
          onAdd={onImagesChange}
          onRemove={(key) => setImages((current) => current.filter((image) => image.key !== key))}
          onSetMain={(key) => setImages((current) => moveMainImage(current, key))}
          disabled={loading}
        />

        {error && (
          <p className="rounded-lg border border-[#f8dcd5] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a2c1b]">
            {error}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            disabled={loading}
            className="cursor-pointer rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ivory"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || categorySaving}
            className="cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? loadingMessage || "Création..." : "Créer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
}
