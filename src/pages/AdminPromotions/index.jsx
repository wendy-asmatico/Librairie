import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FocusTrap } from "focus-trap-react";

import Sidebar from "../../components/Admin/Sidebar";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Seo from "../../components/Seo";
import { wcCreate, wcFetch, wcFetchAll, wcRemove, wcUpdate, WP_ADMIN_URL } from "../../admin/api";
import { decodeHtml } from "../../utils/decodeHtml";
import { fetchCurrentUserThunk } from "../../thunkActionsCreator/userThunks";
import { logout } from "../../slices/userSlice";
import { openModal } from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";

const FIELD = "rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-sage";
const BUTTON = "rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-ivory disabled:opacity-50";
const TYPES = { percent: "Pourcentage", fixed_cart: "Montant fixe sur le panier", fixed_product: "Montant fixe par produit" };

function Gate({ title, text, action }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory p-6 font-sans">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-line bg-white p-8 text-center">
        <p className="text-[11px] font-bold tracking-[1.2px] text-gold uppercase">Espace administrateur</p>
        <h1 className="font-serif text-2xl font-bold text-forest-deep">{title}</h1>
        <p className="text-sm text-ink">{text}</p>
        {action}
        <Link to="/" className="text-xs font-semibold text-gold hover:underline">← Retour à la boutique</Link>
      </div>
      <Modal />
      <Toast />
    </div>
  );
}

function couponStatus(coupon) {
  if (coupon.status !== "publish") return coupon.status === "draft" ? "Brouillon" : `Statut : ${coupon.status}`;
  if (coupon.date_expires_gmt && Date.parse(`${coupon.date_expires_gmt.replace(/Z$/, "")}Z`) <= Date.now()) return "Expiré";
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return "Limite atteinte";
  return "Publié";
}

function couponForm(coupon) {
  return {
    id: coupon?.id ?? null,
    code: coupon?.code ?? "",
    discountType: coupon?.discount_type ?? "percent",
    amount: coupon?.amount ?? "",
    status: coupon?.status ?? "publish",
    expires: coupon?.date_expires ? coupon.date_expires.slice(0, 19) : "",
    minimum: Number(coupon?.minimum_amount) > 0 ? coupon.minimum_amount : "",
    usageLimit: coupon?.usage_limit != null ? String(coupon.usage_limit) : "",
    perUser: coupon?.usage_limit_per_user != null ? String(coupon.usage_limit_per_user) : "",
    productIds: coupon?.product_ids ?? [],
    categoryIds: coupon?.product_categories ?? [],
    original: coupon ?? null,
  };
}

function Selector({ title, items, selected, onChange, search, onSearch }) {
  const selectedSet = new Set(selected);
  const knownIds = new Set(items.map((item) => item.id));
  const missing = selected.filter((id) => !knownIds.has(id));
  const filtered = items.filter((item) => decodeHtml(item.name).toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <fieldset className="rounded-lg border border-line p-3">
      <legend className="px-1 text-sm font-semibold text-ink">{title} ({selected.length})</legend>
      <input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={`Rechercher : ${title.toLowerCase()}`} aria-label={`Rechercher : ${title.toLowerCase()}`} className={`${FIELD} mb-2 w-full`} />
      <div className="max-h-44 space-y-1 overflow-y-auto">
        {missing.map((id) => (
          <label key={id} className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked onChange={() => onChange(id)} /> Élément indisponible #{id} (décocher pour retirer)
          </label>
        ))}
        {filtered.map((item) => (
          <label key={item.id} className="flex items-center gap-2 rounded px-1 py-1 text-sm text-ink hover:bg-ivory">
            <input type="checkbox" checked={selectedSet.has(item.id)} onChange={() => onChange(item.id)} />
            {decodeHtml(item.name)}{item.parentName ? ` — ${decodeHtml(item.parentName)}` : ""}
          </label>
        ))}
        {!filtered.length && !missing.length && <p className="py-2 text-sm text-muted">Aucun élément trouvé.</p>}
      </div>
    </fieldset>
  );
}

function CouponEditor({ coupon, token, onClose, onSaved }) {
  const [form, setForm] = useState(() => couponForm(coupon));
  const [catalog, setCatalog] = useState({ loading: true, error: null, products: [], categories: [] });
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catalogRevision, setCatalogRevision] = useState(0);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [saving, onClose]);

  useEffect(() => {
    let active = true;
    setCatalog((current) => ({ ...current, loading: true, error: null }));
    Promise.all([
      wcFetchAll("/products", token, { status: "any", orderby: "title", order: "asc" }, Infinity),
      wcFetchAll("/products/categories", token, { hide_empty: false, orderby: "name", order: "asc" }, Infinity),
    ]).then(([products, categories]) => {
      if (!active) return;
      const byId = Object.fromEntries(categories.items.map((item) => [item.id, item]));
      setCatalog({
        loading: false,
        error: null,
        products: products.items,
        categories: categories.items.map((item) => ({ ...item, parentName: byId[item.parent]?.name })),
      });
    }).catch((failure) => {
      if (active) setCatalog({ loading: false, error: failure.message, products: [], categories: [] });
    });
    return () => { active = false; };
  }, [token, catalogRevision]);

  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const toggle = (field) => (id) => setForm((current) => ({
    ...current,
    [field]: current[field].includes(id) ? current[field].filter((value) => value !== id) : [...current[field], id],
  }));
  const submit = async (event) => {
    event.preventDefault();
    if (saving || catalog.loading || catalog.error) return;
    const decimal = (value) => value.trim().replace(",", ".");
    const amount = decimal(form.amount);
    const minimum = decimal(form.minimum);
    const validDecimal = (value) => /^\d+(?:\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value));
    if (!form.code.trim()) return setError("Le code promo est obligatoire.");
    if (!validDecimal(amount) || Number(amount) <= 0 || (form.discountType === "percent" && Number(amount) > 100)) return setError("Saisissez une remise supérieure à zéro ; un pourcentage ne peut pas dépasser 100.");
    if (minimum && !validDecimal(minimum)) return setError("Le montant minimum doit être un nombre positif avec au plus deux décimales.");
    if ([form.usageLimit, form.perUser].some((value) => value && (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))))) return setError("Les limites d'utilisation doivent être des entiers supérieurs à zéro.");
    if (form.expires && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(form.expires)) return setError("La date de fin est invalide.");
    const payload = {
      code: form.code.trim(),
      discount_type: form.discountType,
      amount,
      status: form.status,
      date_expires: form.expires ? (form.expires.length === 16 ? `${form.expires}:00` : form.expires) : "",
      minimum_amount: minimum || "0",
      usage_limit: form.usageLimit ? Number(form.usageLimit) : 0,
      usage_limit_per_user: form.perUser ? Number(form.perUser) : 0,
      product_ids: form.productIds,
      product_categories: form.categoryIds,
      individual_use: form.original?.individual_use ?? false,
      free_shipping: form.original?.free_shipping ?? false,
      exclude_sale_items: form.original?.exclude_sale_items ?? false,
    };
    setSaving(true);
    setError("");
    try {
      if (form.id) await wcUpdate(`/coupons/${form.id}`, token, payload);
      else await wcCreate("/coupons", token, payload);
      onSaved(form.id ? "Code promo modifié." : "Code promo créé.");
    } catch (failure) {
      setError(failure.message || "Impossible d'enregistrer le code promo.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
      <div role="dialog" aria-modal="true" aria-labelledby="coupon-editor-title" className="max-h-[90vh] w-[760px] max-w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="coupon-editor-title" className="font-serif text-[28px] font-bold text-forest-deep">{form.id ? "Modifier le code promo" : "Créer un code promo"}</h2>
          <button type="button" disabled={saving} onClick={onClose} className={BUTTON}>Fermer</button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <fieldset disabled={saving} className="flex flex-col gap-4 disabled:opacity-60">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Code promo *
              <input required value={form.code} onChange={change("code")} className={FIELD} placeholder="Ex. BIENVENUE10" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Type de remise
                <select value={form.discountType} onChange={change("discountType")} className={FIELD}>
                  {Object.entries(TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  {!TYPES[form.discountType] && <option value={form.discountType}>{form.discountType}</option>}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Valeur de la remise {form.discountType === "percent" ? "(%)" : "(devise de la boutique)"} *
                <input required inputMode="decimal" value={form.amount} onChange={change("amount")} className={FIELD} placeholder="Ex. 10" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Statut
                <select value={form.status} onChange={change("status")} className={FIELD}>
                  <option value="publish">Publié</option><option value="draft">Brouillon</option>
                  {!["publish", "draft"].includes(form.status) && <option value={form.status}>{form.status}</option>}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Expiration (heure de la boutique)
                <input type="datetime-local" step="1" value={form.expires} onChange={change("expires")} className={FIELD} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Achat minimum
                <input inputMode="decimal" value={form.minimum} onChange={change("minimum")} className={FIELD} placeholder="Aucun" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Utilisations totales
                <input inputMode="numeric" value={form.usageLimit} onChange={change("usageLimit")} className={FIELD} placeholder="Illimité" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">Utilisations par client
                <input inputMode="numeric" value={form.perUser} onChange={change("perUser")} className={FIELD} placeholder="Illimité" />
              </label>
            </div>
            <p className="text-xs text-muted">Sans sélection, le code s’applique à tous les produits éligibles. Si produits et catégories sont sélectionnés, WooCommerce vérifie les deux conditions sur le panier.</p>
            {catalog.loading ? <p className="text-sm text-muted">Chargement du catalogue…</p> : catalog.error ? (
              <p role="alert" className="text-sm text-[#8a2c1b]">Impossible de charger le catalogue : {catalog.error} <button type="button" onClick={() => setCatalogRevision((value) => value + 1)} className="font-semibold underline">Réessayer</button></p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Selector title="Produits concernés" items={catalog.products} selected={form.productIds} onChange={toggle("productIds")} search={productSearch} onSearch={setProductSearch} />
                <Selector title="Catégories concernées" items={catalog.categories} selected={form.categoryIds} onChange={toggle("categoryIds")} search={categorySearch} onSearch={setCategorySearch} />
              </div>
            )}
            {form.original && <p className="text-xs text-muted">Les autres restrictions configurées dans WooCommerce sont conservées. Pour les consulter ou les modifier, utilisez <a className="font-semibold underline" target="_blank" rel="noreferrer" href={`${WP_ADMIN_URL}/post.php?post=${form.id}&action=edit`}>l’administration WordPress</a>.</p>}
          </fieldset>
          {error && <p role="alert" className="rounded-lg border border-[#f8dcd5] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a2c1b]">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={onClose} className={BUTTON}>Annuler</button>
            <button type="submit" disabled={saving || catalog.loading || !!catalog.error} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </form>
      </div>
      </FocusTrap>
    </div>
  );
}

export default function AdminPromotions() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);
  const [profileError, setProfileError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", items: [], total: 0, pages: 1 });
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState("");
  const isAdmin = profile?.roles?.some((role) => ["administrator", "shop_manager"].includes(role));

  const loadProfile = useCallback(() => {
    setProfileError("");
    dispatch(fetchCurrentUserThunk()).unwrap().catch((error) => setProfileError(error || "Impossible de charger le profil."));
  }, [dispatch]);
  useEffect(() => { if (token && !profile?.roles) loadProfile(); }, [token, profile?.roles, loadProfile]);
  useEffect(() => {
    if (!token || !isAdmin) return;
    let active = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    wcFetch("/coupons", token, { per_page: 20, page, search: query, orderby: "date", order: "desc" })
      .then((result) => {
        if (!active) return;
        if (page > 1 && page > result.totalPages) { setPage(result.totalPages); return; }
        setState({ loading: false, error: "", items: result.data, total: result.total, pages: result.totalPages });
      })
      .catch((error) => { if (active) setState({ loading: false, error: error.message, items: [], total: 0, pages: 1 }); });
    return () => { active = false; };
  }, [token, isAdmin, page, query, revision]);

  const remove = async (coupon) => {
    if (deleting != null || !window.confirm(`Supprimer définitivement le code « ${coupon.code} » ? Cette action est irréversible.`)) return;
    setDeleting(coupon.id);
    setActionError("");
    try {
      await wcRemove(`/coupons/${coupon.id}`, token, { force: true });
      dispatch(showToast("Code promo supprimé."));
      if (page > 1 && state.items.length === 1) setPage((value) => value - 1);
      else setRevision((value) => value + 1);
    } catch (error) {
      setActionError(`Impossible de supprimer le code : ${error.message}`);
    } finally { setDeleting(null); }
  };
  if (!token) return <Gate title="Connexion requise" text="Connectez-vous avec un compte administrateur pour gérer les promotions." action={<button type="button" onClick={() => dispatch(openModal({ name: "auth", props: { view: "login" } }))} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white">Se connecter</button>} />;
  if (!profile?.roles && profileError) return <Gate title="Chargement impossible" text={profileError} action={<button type="button" onClick={loadProfile} className={BUTTON}>Réessayer</button>} />;
  if (!profile?.roles) return <div className="flex min-h-screen items-center justify-center bg-ivory"><Loader size="lg" /></div>;
  if (!isAdmin) return <Gate title="Accès réservé" text="Ce compte n'a pas les droits d'administration de la boutique." />;

  return (
    <div className="flex min-h-screen bg-ivory font-sans">
      <Seo title="Promotions — Espace administrateur" noIndex />
      <Sidebar user={profile} onLogout={() => dispatch(logout())} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-9 lg:py-8">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-lg border border-line bg-white lg:hidden" aria-label="Ouvrir le menu">
            <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-forest stroke-2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <div className="min-w-[220px] flex-1">
            <p className="text-[11px] font-semibold tracking-[1.2px] text-gold uppercase">Boutique</p>
            <h1 className="font-serif text-[34px] font-semibold text-forest-deep">Promotions</h1>
            <p className="text-sm text-ink">Créez et gérez les codes promo WooCommerce.</p>
          </div>
          <button type="button" onClick={() => setEditor({ coupon: null })} disabled={deleting != null} className="rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50">Créer un code promo</button>
          <button type="button" onClick={() => setRevision((value) => value + 1)} disabled={state.loading} className={BUTTON}>Actualiser</button>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }} className="mb-6 flex flex-wrap gap-2">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un code promo…" aria-label="Rechercher un code promo" className={`${FIELD} min-w-[220px] flex-1`} />
          <button type="submit" className={BUTTON}>Rechercher</button>
        </form>
        {(state.error || actionError) && <div role="alert" className="mb-6 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">{state.error ? `Impossible de charger les codes : ${state.error}` : actionError}{state.error && <> <button type="button" className="font-semibold underline" onClick={() => setRevision((value) => value + 1)}>Réessayer</button></>}</div>}
        {state.loading ? <div className="flex justify-center py-24"><Loader size="lg" /></div> : !state.error && (
          <>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <p className="border-b border-line px-5 py-4 text-sm font-semibold text-muted">{state.total} code{state.total === 1 ? "" : "s"}</p>
              {!state.items.length && <p className="px-5 py-10 text-center text-sm text-muted">Aucun code promo à afficher.</p>}
              {state.items.map((coupon) => (
                <article key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0">
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-forest-deep">{coupon.code}</p>
                    <p className="text-sm text-ink">{TYPES[coupon.discount_type] || coupon.discount_type} : {coupon.amount}{coupon.discount_type === "percent" ? " %" : ""}</p>
                    <p className="text-xs text-muted">Utilisations : {coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : " (illimitées)"}{coupon.date_expires ? ` · Expiration : ${coupon.date_expires.slice(0, 10).split("-").reverse().join("/")} ${coupon.date_expires.slice(11, 16)} (heure boutique)` : ""}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest-deep">{couponStatus(coupon)}</span>
                    <button type="button" disabled={deleting != null} onClick={() => setEditor({ coupon })} className={BUTTON}>Modifier<span className="sr-only"> {coupon.code}</span></button>
                    <button type="button" disabled={deleting != null} onClick={() => remove(coupon)} className="rounded-lg border border-[#f0c9c1] px-3 py-2 text-sm font-semibold text-[#8a2c1b] hover:bg-[#fff5f2] disabled:opacity-50">{deleting === coupon.id ? "Suppression…" : "Supprimer"}<span className="sr-only"> {coupon.code}</span></button>
                  </div>
                </article>
              ))}
            </div>
            {state.pages > 1 && <nav aria-label="Pagination" className="mt-4 flex items-center justify-end gap-3 text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className={BUTTON}>Précédent</button><span>Page {page} / {state.pages}</span><button type="button" disabled={page >= state.pages} onClick={() => setPage((value) => value + 1)} className={BUTTON}>Suivant</button></nav>}
          </>
        )}
      </main>
      {editor && <CouponEditor coupon={editor.coupon} token={token} onClose={() => setEditor(null)} onSaved={(message) => { setEditor(null); dispatch(showToast(message)); setPage(1); setRevision((value) => value + 1); }} />}
      <Modal />
      <Toast />
    </div>
  );
}
