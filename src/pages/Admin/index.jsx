import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import KpiCard from "../../components/Admin/KpiCard";
import OrdersChart from "../../components/Admin/OrdersChart";
import CategoryBreakdown from "../../components/Admin/CategoryBreakdown";
import LatestOrders from "../../components/Admin/LatestOrders";
import StockAlerts from "../../components/Admin/StockAlerts";
import RecentMessages from "../../components/Admin/RecentMessages";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Seo from "../../components/Seo";

import useDashboardData from "../../admin/useDashboardData";
import { WP_ADMIN_URL } from "../../admin/api";
import { fetchCurrentUserThunk } from "../../thunkActionsCreator/userThunks";
import { logout } from "../../slices/userSlice";
import { openModal } from "../../slices/modalSlice";

import icSearch from "../../assets/admin/ic-search.svg";
import icCalendar from "../../assets/admin/ic-calendar.svg";
import icChevron from "../../assets/admin/ic-chevron-down.svg";
import btnNotifications from "../../assets/admin/btn-notifications.svg";
import icPlus from "../../assets/admin/ic-plus.svg";
import kpiOrders from "../../assets/admin/kpi-orders.svg";
import kpiPickup from "../../assets/admin/kpi-pickup.svg";
import kpiClients from "../../assets/admin/kpi-clients.svg";
import kpiMessages from "../../assets/admin/kpi-messages.svg";

const PERIODS = [
  { days: 7, label: "7 derniers jours" },
  { days: 30, label: "30 derniers jours" },
  { days: 90, label: "90 derniers jours" },
];

const FIELD =
  "flex items-center gap-2.5 rounded-lg border border-line bg-white px-3.5 py-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]";

// Écran plein (connexion requise / accès refusé)
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

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = profile?.roles?.some((r) => ["administrator", "shop_manager"].includes(r));

  // Le profil chargé à la connexion ne contient pas les rôles
  useEffect(() => {
    if (token && !profile?.roles) dispatch(fetchCurrentUserThunk());
  }, [token, profile?.roles, dispatch]);

  const { loading, error, data, reload } = useDashboardData(token && isAdmin ? token : null, days);

  if (!token) {
    return (
      <Gate
        title="Connexion requise"
        text="Connectez-vous avec un compte administrateur pour accéder au tableau de bord."
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

  const today = new Date();
  const firstName = profile.firstName || profile.displayName || "";
  const compare = `vs ${days} j précédents`;

  return (
    <div className="flex min-h-screen bg-ivory font-sans">
      <Seo title="Tableau de bord — Espace administrateur" noIndex />
      <Sidebar
        badges={{ orders: data?.toPrepare, pickups: data?.pickupsToPrepare }}
        user={profile}
        onLogout={() => dispatch(logout())}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-9 lg:py-8">
        {/* Barre supérieure — maquette 207:104 */}
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
            <p className="text-[11px] leading-4 font-semibold tracking-[1.2px] text-gold uppercase">
              {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[34px] leading-[44px] font-semibold text-forest-deep lg:text-[40px]">
              Assalamu alaykum{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-sm leading-[22px] text-ink">
              Voici l&apos;activité de la librairie sur les {days} derniers jours.
            </p>
          </div>

          <label className={`${FIELD} w-full sm:w-[250px]`}>
            <img src={icSearch} alt="" className="size-4" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Commande, client, produit…"
              className="w-full bg-transparent text-[13px] leading-[18px] text-ink outline-none placeholder:text-muted"
              aria-label="Rechercher une commande"
            />
          </label>

          <label className={`${FIELD} relative cursor-pointer gap-2`}>
            <img src={icCalendar} alt="" className="size-4" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="cursor-pointer appearance-none bg-transparent pr-5 text-[13px] leading-[18px] font-semibold text-ink outline-none"
              aria-label="Période"
            >
              {PERIODS.map((p) => (
                <option key={p.days} value={p.days}>
                  {p.label}
                </option>
              ))}
            </select>
            <img src={icChevron} alt="" className="pointer-events-none absolute right-3.5 size-3.5" />
          </label>

          <a
            href={`${WP_ADMIN_URL}/admin.php?page=wc-orders&status=wc-processing`}
            target="_blank"
            rel="noreferrer"
            className="relative size-[42px] shrink-0"
            aria-label="Commandes à préparer"
          >
            <img src={btnNotifications} alt="" className="absolute inset-[-2.38%_-4.76%_-7.14%_-4.76%] max-w-none" />
          </a>

          <a
            href={`${WP_ADMIN_URL}/post-new.php?post_type=product`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg bg-gold px-[18px] py-3 text-[13px] leading-[18px] font-semibold tracking-[0.52px] text-white transition-colors hover:bg-gold-dark"
          >
            <img src={icPlus} alt="" className="size-[15px]" />
            Ajouter un produit
          </a>
        </header>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
            <span>Impossible de charger les données : {error}</span>
            <button type="button" onClick={reload} className="cursor-pointer font-semibold underline">
              Réessayer
            </button>
          </div>
        )}

        {loading && !data ? (
          <div className="flex justify-center py-24">
            <Loader size="lg" />
          </div>
        ) : data ? (
          <div className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
            {/* Indicateurs clés — 207:129 */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs clés">
              <KpiCard label="Commandes" icon={kpiOrders} value={data.kpis.orders.value} evolution={data.kpis.orders.evolution} compareLabel={compare} />
              <KpiCard label="Retraits en boutique" icon={kpiPickup} value={data.kpis.pickups.value} evolution={data.kpis.pickups.evolution} compareLabel={compare} />
              <KpiCard label="Nouveaux clients" icon={kpiClients} value={data.kpis.customers.value} evolution={data.kpis.customers.evolution} compareLabel={compare} />
              <KpiCard label="Messages en attente" icon={kpiMessages} value="—" note="Formulaire de contact à brancher" />
            </section>

            {/* Graphiques — 209:2 */}
            <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
              <OrdersChart daily={data.daily} total={data.kpis.orders.value} days={days} />
              <CategoryBreakdown rayons={data.rayons} />
            </section>

            {/* Activité — 210:2 */}
            <LatestOrders orders={data.latest} search={search} />
            <section className="grid gap-5 lg:grid-cols-2">
              <StockAlerts products={data.lowStock} />
              <RecentMessages />
            </section>
          </div>
        ) : null}
      </main>
      <Modal />
      <Toast />
    </div>
  );
}
