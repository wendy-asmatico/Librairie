import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../../components/Admin/Sidebar";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Seo from "../../components/Seo";

import { customCreate, customFetch } from "../../admin/api";
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

const EMPTY_VALIDATION = {
  quote: null,
  amount: "",
  message: "",
  loading: false,
  error: "",
};

export default function AdminQuotes() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: null, quotes: [], total: 0 });
  const [validation, setValidation] = useState(EMPTY_VALIDATION);

  const isAdmin = profile?.roles?.some((r) => ["administrator", "shop_manager"].includes(r));

  useEffect(() => {
    if (token && !profile?.roles) dispatch(fetchCurrentUserThunk());
  }, [token, profile?.roles, dispatch]);

  const loadQuotes = useCallback(async () => {
    if (!token || !isAdmin) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await customFetch("/quotes", token, { per_page: 100 });
      setState({
        loading: false,
        error: null,
        quotes: data.items || [],
        total: Number(data.total) || 0,
      });
    } catch (error) {
      setState({ loading: false, error: error.message, quotes: [], total: 0 });
    }
  }, [token, isAdmin]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return state.quotes;
    return state.quotes.filter((quote) => {
      const haystack = [
        quote.firstname,
        quote.lastname,
        quote.email,
        quote.phone,
        quote.message,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [state.quotes, search]);

  const pendingCount = useMemo(
    () => state.quotes.filter((quote) => quote.quote_status !== "validated").length,
    [state.quotes],
  );

  const openValidation = (quote) => {
    setValidation({
      quote,
      amount: "",
      message: "",
      loading: false,
      error: "",
    });
  };

  const closeValidation = () => {
    if (validation.loading) return;
    setValidation(EMPTY_VALIDATION);
  };

  const submitValidation = async (event) => {
    event.preventDefault();
    if (!token || !validation.quote) return;

    const amount = Number(validation.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setValidation((current) => ({ ...current, error: "Le montant doit être supérieur à 0." }));
      return;
    }

    setValidation((current) => ({ ...current, loading: true, error: "" }));
    try {
      const result = await customCreate(`/quotes/${validation.quote.id}/validate`, token, {
        amount,
        message: validation.message,
      });
      dispatch(showToast(`Devis validé : commande #${result.order_id} créée.`));
      setValidation(EMPTY_VALIDATION);
      await loadQuotes();
    } catch (error) {
      setValidation((current) => ({
        ...current,
        loading: false,
        error: error.message || "Impossible de valider ce devis.",
      }));
    }
  };

  if (!token) {
    return (
      <Gate
        title="Connexion requise"
        text="Connectez-vous avec un compte administrateur pour gérer les devis."
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
      <Seo title="Devis — Espace administrateur" noIndex />
      <Sidebar
        badges={{ quotes: pendingCount }}
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
            <p className="text-[11px] leading-4 font-semibold tracking-[1.2px] text-gold uppercase">Gestion sur mesure</p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[34px] leading-[44px] font-semibold text-forest-deep lg:text-[40px]">
              Devis & coffrets personnalisés
            </h1>
            <p className="text-sm leading-[22px] text-ink">
              {pendingCount} devis en attente sur {state.total}.
            </p>
          </div>

          <label className="flex w-full max-w-sm items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher client, email, message…"
              className="w-full bg-transparent text-[13px] leading-[18px] text-ink outline-none placeholder:text-muted"
              aria-label="Rechercher un devis"
            />
          </label>

          <button
            type="button"
            onClick={loadQuotes}
            className="cursor-pointer rounded-lg border border-line bg-white px-[18px] py-3 text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-ink transition-colors hover:bg-ivory"
          >
            Actualiser
          </button>
        </header>

        {state.error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
            <span>Impossible de charger les devis : {state.error}</span>
            <button type="button" onClick={loadQuotes} className="cursor-pointer font-semibold underline">
              Réessayer
            </button>
          </div>
        )}

        {state.loading && !state.quotes.length ? (
          <div className="flex justify-center py-24">
            <Loader size="lg" />
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${state.loading ? "opacity-60" : ""}`}>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left">
                <thead className="bg-[#f8fbf6]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Client</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Contact</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Demande</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Statut</th>
                    <th className="px-4 py-3 text-[10px] font-bold tracking-[0.8px] text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!filteredQuotes.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                        Aucun devis trouvé.
                      </td>
                    </tr>
                  )}
                  {filteredQuotes.map((quote) => {
                    const statusLabel = quote.quote_status === "validated" ? "Validé" : "En attente";
                    return (
                      <tr key={quote.id} className="border-t border-[#eef2ea]">
                        <td className="px-4 py-3 text-sm text-ink">
                          {new Date(quote.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-ink">
                          {`${quote.firstname || ""} ${quote.lastname || ""}`.trim() || "Client"}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <div className="flex flex-col">
                            <span>{quote.email || "—"}</span>
                            <span className="text-xs text-muted">{quote.phone || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <p className="line-clamp-3 max-w-[320px]">{quote.message}</p>
                          {quote.attachment && (
                            <a href={quote.attachment} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gold hover:underline">
                              Pièce jointe
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-ink">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${quote.quote_status === "validated" ? "bg-mint text-forest-deep" : "bg-cream text-gold"}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {quote.quote_status !== "validated" ? (
                              <button
                                type="button"
                                onClick={() => openValidation(quote)}
                                className="cursor-pointer rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-ivory"
                              >
                                Valider en commande
                              </button>
                            ) : quote.order_edit_url ? (
                              <a
                                href={quote.order_edit_url}
                                target="_blank"
                                rel="noreferrer"
                                className="cursor-pointer rounded-md border border-line px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-ivory"
                              >
                                Voir la commande
                              </a>
                            ) : null}
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

      {validation.quote && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-[560px] max-w-full rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h2 className="font-serif text-2xl font-bold text-forest-deep">Valider le devis #{validation.quote.id}</h2>
            <p className="mt-1 text-sm text-ink">
              Cette action créera une commande WooCommerce avec une ligne “Coffret personnalisé”.
            </p>

            <form onSubmit={submitValidation} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Montant du devis (€) *
                <input
                  type="text"
                  inputMode="decimal"
                  value={validation.amount}
                  onChange={(event) => setValidation((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Ex. 89.90"
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                Note interne (optionnel)
                <textarea
                  rows={4}
                  value={validation.message}
                  onChange={(event) => setValidation((current) => ({ ...current, message: event.target.value }))}
                  className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-sage"
                />
              </label>

              {validation.error && (
                <p className="rounded-lg border border-[#f8dcd5] bg-[#fff5f2] px-3 py-2 text-sm text-[#8a2c1b]">
                  {validation.error}
                </p>
              )}

              <div className="mt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeValidation}
                  disabled={validation.loading}
                  className="cursor-pointer rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={validation.loading}
                  className="cursor-pointer rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {validation.loading ? "Création..." : "Créer la commande"}
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
