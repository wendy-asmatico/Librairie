import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../../components/Admin/Sidebar";
import LatestOrders from "../../components/Admin/LatestOrders";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Seo from "../../components/Seo";

import { customCreate, wcFetch } from "../../admin/api";
import { isPickup } from "../../admin/format";
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

export default function AdminOrders() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [state, setState] = useState({ loading: true, error: null, orders: [] });
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const isAdmin = profile?.roles?.some((r) => ["administrator", "shop_manager"].includes(r));
  const initialFilter = searchParams.get("filter") === "pickup" ? "pickup" : "all";

  useEffect(() => {
    if (token && !profile?.roles) dispatch(fetchCurrentUserThunk());
  }, [token, profile?.roles, dispatch]);

  const loadOrders = useCallback(async () => {
    if (!token || !isAdmin) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await wcFetch("/orders", token, {
        per_page: 100,
        orderby: "date",
        order: "desc",
        status: "any",
      });
      setState({ loading: false, error: null, orders: response.data || [] });
    } catch (error) {
      setState({ loading: false, error: error.message, orders: [] });
    }
  }, [token, isAdmin]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (order, status) => {
    const action = status === "shipped" ? "expédiée" : "terminée";
    if (!window.confirm(`Marquer la commande n°${order.number} comme ${action} ?`)) return;
    setUpdateError(null);
    setUpdatingOrderId(order.id);
    try {
      const result = await customCreate(`/admin/orders/${order.id}/status`, token, {
        status,
        expected_status: order.status,
      });
      setState((current) => ({
        ...current,
        orders: current.orders.map((item) =>
          item.id === order.id ? { ...item, status: result.status } : item,
        ),
      }));
      dispatch(showToast(`Commande n°${order.number} marquée ${action}.`));
    } catch (error) {
      setUpdateError(`Impossible de modifier la commande n°${order.number} : ${error.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const badges = useMemo(() => {
    const toPrepare = state.orders.filter((o) => o.status === "processing").length;
    const pickupToPrepare = state.orders.filter((o) => o.status === "processing" && isPickup(o)).length;
    return { orders: toPrepare, pickups: pickupToPrepare };
  }, [state.orders]);

  if (!token) {
    return (
      <Gate
        title="Connexion requise"
        text="Connectez-vous avec un compte administrateur pour accéder à la gestion des commandes."
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
      <Seo title="Commandes — Espace administrateur" noIndex />
      <Sidebar
        badges={badges}
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
              Commandes
            </h1>
            <p className="text-sm leading-[22px] text-ink">Liste des 100 commandes les plus récentes.</p>
          </div>

          <label className="flex w-full max-w-sm items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une commande, un client, un produit…"
              className="w-full bg-transparent text-[13px] leading-[18px] text-ink outline-none placeholder:text-muted"
              aria-label="Rechercher une commande"
            />
          </label>

          <button
            type="button"
            onClick={loadOrders}
            disabled={updatingOrderId != null}
            className="cursor-pointer rounded-lg bg-gold px-[18px] py-3 text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-white transition-colors hover:bg-gold-dark"
          >
            Actualiser
          </button>
        </header>

        {updateError && (
          <div role="alert" className="mb-6 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
            {updateError}
          </div>
        )}
        {state.error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
            <span>Impossible de charger les commandes : {state.error}</span>
            <button type="button" onClick={loadOrders} className="cursor-pointer font-semibold underline">
              Réessayer
            </button>
          </div>
        )}

        {state.loading && !state.orders.length ? (
          <div className="flex justify-center py-24">
            <Loader size="lg" />
          </div>
        ) : (
          <div className={`transition-opacity ${state.loading ? "opacity-60" : ""}`}>
            <LatestOrders
              orders={state.orders}
              search={search}
              maxRows={100}
              showAllLink={false}
              linkToWp={false}
              initialFilter={initialFilter}
              onUpdateStatus={updateStatus}
              updatingOrderId={updatingOrderId}
            />
          </div>
        )}
      </main>
      <Modal />
      <Toast />
    </div>
  );
}
