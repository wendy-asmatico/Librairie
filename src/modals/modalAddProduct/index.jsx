import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { wcCreate, wcFetch, wpUploadMedia } from "../../admin/api";
import { decodeHtml } from "../../utils/decodeHtml";
import { closeModal } from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";

const EMPTY_FORM = {
  name: "",
  regularPrice: "",
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

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [images, setImages] = useState([]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError("");

    wcFetch("/products/categories", token, { per_page: 100, hide_empty: false, orderby: "name", order: "asc" })
      .then((response) => {
        if (cancelled) return;
        setCategories(response.data || []);
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
    setImages(Array.from(event.target.files || []));
  };

  const categoriesTree = useMemo(() => {
    const byParent = new Map();
    for (const category of categories) {
      const parentId = Number(category.parent || 0);
      if (!byParent.has(parentId)) byParent.set(parentId, []);
      byParent.get(parentId).push(category);
    }

    for (const list of byParent.values()) {
      list.sort((a, b) => decodeHtml(a.name).localeCompare(decodeHtml(b.name), "fr"));
    }

    return {
      topLevel: byParent.get(0) || [],
      childrenByParent: byParent,
    };
  }, [categories]);

  const submit = async (event) => {
    event.preventDefault();
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

    const payload = {
      name,
      status: form.status,
      sku: form.sku.trim() || undefined,
      short_description: form.shortDescription.trim() || undefined,
      description: form.description.trim() || undefined,
      regular_price: regularPrice || undefined,
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
        for (const imageFile of images) {
          const media = await wpUploadMedia(imageFile, token);
          uploadedImages.push({ id: media.id });
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
              {categoriesTree.topLevel.map((parentCategory) => (
                <div key={parentCategory.id} className="space-y-1">
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-ivory">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(parentCategory.id)}
                      onChange={() => toggleCategory(parentCategory.id)}
                    />
                    <span className="text-sm font-semibold text-ink">
                      {decodeHtml(parentCategory.name)}
                    </span>
                  </label>

                  {(categoriesTree.childrenByParent.get(parentCategory.id) || []).map((childCategory) => (
                    <label
                      key={childCategory.id}
                      className="ml-6 flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-ivory"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(childCategory.id)}
                        onChange={() => toggleCategory(childCategory.id)}
                      />
                      <span className="text-sm font-normal text-ink">
                        {decodeHtml(childCategory.name)}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="px-1 py-2 text-sm text-muted">Aucune catégorie disponible.</p>
          )}
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          Images produit
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImagesChange}
            className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
          />
          {!!images.length && (
            <span className="text-xs font-normal text-muted">
              {images.length} image{images.length > 1 ? "s sélectionnées" : " sélectionnée"}
            </span>
          )}
        </label>

        {error && (
          <p className="rounded-lg border border-[#f8dcd5] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a2c1b]">
            {error}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="cursor-pointer rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ivory"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? loadingMessage || "Création..." : "Créer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
}
