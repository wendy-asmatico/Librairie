import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../../components/Admin/Sidebar";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Seo from "../../components/Seo";
import { customCreate, customFetch, customRemove, wcFetch } from "../../admin/api";
import { shortDate } from "../../admin/format";
import { htmlToText } from "../../utils/decodeHtml";
import { fetchCurrentUserThunk } from "../../thunkActionsCreator/userThunks";
import { logout } from "../../slices/userSlice";
import { openModal } from "../../slices/modalSlice";

const SECTIONS = {
  clients: {
    title: "Clients",
    description: "Comptes clients enregistrés dans WooCommerce.",
    placeholder: "Rechercher un identifiant ou un e-mail…",
  },
  messages: {
    title: "Messages",
    description: "Messages reçus depuis le formulaire de contact.",
    placeholder: "Rechercher dans le nom, l’objet ou le message…",
  },
  avis: {
    title: "Avis clients",
    description: "Avis publiés et en attente de modération.",
    placeholder: "Rechercher dans les avis…",
  },
};

const REVIEW_STATUS = {
  approved: "Approuvé",
  hold: "En attente",
  spam: "Indésirable",
  trash: "Corbeille",
};

function Gate({ title, text, action }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory p-6 font-sans">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-line bg-white p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
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

function CustomerCard({ customer }) {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.username;
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 last:border-0">
      <div className="min-w-0">
        <p className="font-semibold text-ink">{name}</p>
        <p className="break-all text-sm text-muted">{customer.email}</p>
      </div>
      <div className="text-sm text-muted">
        <p>Inscription : {customer.date_created ? shortDate(customer.date_created) : "—"}</p>
      </div>
    </article>
  );
}

function MessageCard({ message, selected, busy, onMarkRead, onRemove }) {
  const [open, setOpen] = useState(selected);
  const name = [message.firstname, message.lastname].filter(Boolean).join(" ");

  useEffect(() => {
    if (selected && message.unread) onMarkRead(message.id);
  }, [selected, message.id, message.unread, onMarkRead]);

  return (
    <details open={open} className="border-b border-line px-5 py-4 last:border-0">
      <summary onClick={(event) => {
        event.preventDefault();
        if (!open && message.unread) onMarkRead(message.id);
        setOpen(!open);
      }} className="cursor-pointer text-sm text-ink">
        <span className="font-semibold">{name}</span>
        <span className="mx-2 text-muted">·</span>
        <span>{message.subject}</span>
        {message.unread && <span className="ml-2 rounded-full bg-mint px-2 py-1 text-xs font-semibold text-forest-deep">Non lu</span>}
        <span className="ml-2 whitespace-nowrap text-xs text-muted">{message.date ? shortDate(message.date) : ""}</span>
      </summary>
      <div className="mt-4 space-y-2 text-sm text-ink">
        <p className="break-all">E-mail : {message.email}</p>
        {message.phone && <p>Téléphone : {message.phone}</p>}
        {message.order && <p>Commande : {message.order}</p>}
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {message.unread && <button type="button" disabled={busy} onClick={() => onMarkRead(message.id)} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-forest-deep hover:bg-mint disabled:opacity-50">Marquer comme lu</button>}
          <button type="button" disabled={busy} onClick={() => onRemove(message)} className="rounded-lg border border-[#e7b6ac] px-3 py-2 text-xs font-semibold text-[#8a2c1b] hover:bg-[#fff5f2] disabled:opacity-50">
            {busy ? "Enregistrement…" : "Supprimer"}
          </button>
        </div>
      </div>
    </details>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="space-y-2 border-b border-line px-5 py-4 text-sm last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-ink">{review.reviewer || "Client"}</span>
        <span className="text-muted">{review.date_created ? shortDate(review.date_created) : ""}</span>
        <span className="rounded-full bg-mint px-2 py-1 text-xs font-semibold text-forest-deep">
          {REVIEW_STATUS[review.status] || review.status}
        </span>
      </div>
      <p className="font-semibold text-ink">{htmlToText(review.product_name)} · {review.rating}/5</p>
      <p className="whitespace-pre-wrap break-words text-ink">{htmlToText(review.review)}</p>
    </article>
  );
}

export default function AdminRelations({ section }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [profileError, setProfileError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyIds, setBusyIds] = useState([]);
  const pendingIds = useRef(new Set());
  const [state, setState] = useState({ loading: true, error: null, items: [], total: 0, totalPages: 0, unread: 0 });
  const isAdmin = profile?.roles?.some((role) => ["administrator", "shop_manager"].includes(role));
  const config = SECTIONS[section];

  const loadProfile = useCallback(() => {
    setProfileError(null);
    dispatch(fetchCurrentUserThunk()).unwrap().catch((error) => setProfileError(error || "Impossible de charger le profil."));
  }, [dispatch]);

  useEffect(() => {
    if (token && !profile?.roles) loadProfile();
  }, [token, profile?.roles, loadProfile]);

  const load = useCallback(async () => {
    const params = { per_page: 20, page, search };
    if (section === "messages") {
      const data = await customFetch("/contact-messages", token, params);
      return { items: data.items, total: data.total, totalPages: data.total_pages, unread: data.unread };
    }
    const path = section === "clients" ? "/customers" : "/products/reviews";
    const extra = section === "clients" ? { role: "customer", orderby: "registered_date" } : { status: "all" };
    const data = await wcFetch(path, token, { ...params, ...extra, order: "desc" });
    return { items: data.data, total: data.total, totalPages: data.totalPages };
  }, [section, token, page, search]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    load().then((result) => {
      if (active && page > 1 && page > result.totalPages) {
        setPage(Math.max(1, result.totalPages));
      } else if (active) {
        setState({ ...result, loading: false, error: null });
      }
    }).catch((error) => {
      if (active) setState({ loading: false, error: error.message, items: [], total: 0, totalPages: 0 });
    });
    return () => { active = false; };
  }, [token, isAdmin, load, page, revision]);

  const markRead = useCallback(async (id) => {
    if (pendingIds.current.has(id)) return;
    pendingIds.current.add(id);
    setBusyIds((ids) => [...ids, id]);
    setActionError(null);
    try {
      await customCreate(`/contact-messages/${id}/read`, token);
      setState((current) => ({
        ...current,
        unread: Math.max(0, current.unread - (current.items.some((item) => item.id === id && item.unread) ? 1 : 0)),
        items: current.items.map((item) => item.id === id ? { ...item, unread: false } : item),
      }));
    } catch (error) {
      setActionError(`Impossible de marquer le message comme lu : ${error.message}`);
    } finally {
      pendingIds.current.delete(id);
      setBusyIds((ids) => ids.filter((item) => item !== id));
    }
  }, [token]);

  const removeMessage = async (message) => {
    const text = message.is_quote
      ? "Retirer ce message de la boîte ? La demande de devis restera disponible dans « Coffrets & devis »."
      : "Placer ce message dans la corbeille WordPress ?";
    if (!window.confirm(text) || pendingIds.current.has(message.id)) return;
    pendingIds.current.add(message.id);
    setBusyIds((ids) => [...ids, message.id]);
    setActionError(null);
    try {
      await customRemove(`/contact-messages/${message.id}`, token);
      setRevision((value) => value + 1);
    } catch (error) {
      setActionError(`Impossible de supprimer le message : ${error.message}`);
    } finally {
      pendingIds.current.delete(message.id);
      setBusyIds((ids) => ids.filter((id) => id !== message.id));
    }
  };

  if (!token) {
    return (
      <Gate title="Connexion requise" text="Connectez-vous avec un compte administrateur pour accéder à cette page." action={
        <button type="button" onClick={() => dispatch(openModal({ name: "auth", props: { view: "login" } }))} className="mt-2 rounded-lg bg-gold px-5 py-3 text-[13px] font-semibold text-white hover:bg-gold-dark">Se connecter</button>
      } />
    );
  }
  if (!profile?.roles && profileError) {
    return <Gate title="Chargement impossible" text={profileError} action={<button type="button" onClick={loadProfile} className="mt-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-white hover:bg-gold-dark">Réessayer</button>} />;
  }
  if (!profile?.roles) return <div className="flex min-h-screen items-center justify-center bg-ivory"><Loader size="lg" /></div>;
  if (!isAdmin) return <Gate title="Accès réservé" text="Ce compte n'a pas les droits d'administration de la boutique." />;

  return (
    <div className="flex min-h-screen bg-ivory font-sans">
      <Seo title={`${config.title} — Espace administrateur`} noIndex />
      <Sidebar badges={{ messages: section === "messages" ? state.unread : undefined }} user={profile} onLogout={() => dispatch(logout())} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-9 lg:py-8">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setMenuOpen(true)} className="flex size-10 items-center justify-center rounded-lg border border-line bg-white lg:hidden" aria-label="Ouvrir le menu">
            <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-forest stroke-2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <div className="min-w-[220px] flex-1">
            <p className="text-[11px] font-semibold tracking-[1.2px] text-gold uppercase">Relation client</p>
            <h1 className="font-serif text-[34px] font-semibold text-forest-deep">{config.title}</h1>
            <p className="text-sm text-ink">{config.description}</p>
          </div>
          <button type="button" onClick={() => setRevision((value) => value + 1)} disabled={state.loading} className="rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50">Actualiser</button>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(input.trim()); }} className="mb-6 flex flex-wrap gap-2">
          <input type="search" value={input} onChange={(event) => setInput(event.target.value)} placeholder={config.placeholder} aria-label={config.placeholder} className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none" />
          <button type="submit" className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-forest-deep hover:bg-mint">Rechercher</button>
        </form>
        {state.error && (
          <div role="alert" className="mb-6 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
            Impossible de charger la liste : {state.error}{" "}
            <button type="button" onClick={() => setRevision((value) => value + 1)} className="font-semibold underline">Réessayer</button>
          </div>
        )}
        {actionError && (
          <div role="alert" className="mb-6 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">{actionError}</div>
        )}
        {state.loading ? <div className="flex justify-center py-24"><Loader size="lg" /></div> : !state.error && (
          <>
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <p className="border-b border-line px-5 py-4 text-sm font-semibold text-muted">{state.total} résultat{state.total === 1 ? "" : "s"}</p>
              {state.items.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">Aucun résultat à afficher.</p>}
              {state.items.map((item) => section === "clients" ? <CustomerCard key={item.id} customer={item} /> : section === "messages" ? <MessageCard key={item.id} message={item} selected={String(item.id) === searchParams.get("message")} busy={busyIds.includes(item.id)} onMarkRead={markRead} onRemove={removeMessage} /> : <ReviewCard key={item.id} review={item} />)}
            </div>
            {state.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-4 flex items-center justify-end gap-3 text-sm">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-line bg-white px-3 py-2 disabled:opacity-40">Précédent</button>
                <span>Page {page} / {state.totalPages}</span>
                <button type="button" disabled={page >= state.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-line bg-white px-3 py-2 disabled:opacity-40">Suivant</button>
              </nav>
            )}
          </>
        )}
      </main>
      <Modal />
      <Toast />
    </div>
  );
}
