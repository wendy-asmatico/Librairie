import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Loader from "../Loader";
import Modal from "../Modal";
import Toast from "../Toast";
import Seo from "../Seo";
import { fetchCurrentUserThunk } from "../../thunkActionsCreator/userThunks";
import { openModal } from "../../slices/modalSlice";
import { logout } from "../../slices/userSlice";

export function useAdminAccess() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const profile = useSelector((state) => state.user.profile);
  useEffect(() => {
    if (token && !profile?.roles) dispatch(fetchCurrentUserThunk());
  }, [token, profile?.roles, dispatch]);
  return { token, profile, isAdmin: profile?.roles?.some((role) => ["administrator", "shop_manager"].includes(role)) };
}

export default function DetailLayout({ access, title, backTo, backLabel, children }) {
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  if (access.token && !access.profile?.roles) return <div className="flex min-h-screen items-center justify-center bg-ivory"><Loader size="lg" /></div>;
  if (!access.token || !access.isAdmin) return (
    <div className="flex min-h-screen items-center justify-center bg-ivory p-6">
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-forest-deep">{access.token ? "Accès réservé" : "Connexion requise"}</h1>
        <p className="mt-2 text-sm text-ink">Cette fiche est réservée à l&apos;administration de la boutique.</p>
        {!access.token && <button type="button" onClick={() => dispatch(openModal({ name: "auth", props: { view: "login" } }))} className="mt-4 rounded-lg bg-gold px-4 py-2 font-semibold text-white">Se connecter</button>}
        <Link to="/" className="mt-4 block text-sm text-gold">Retour à la boutique</Link>
      </div>
      <Modal /><Toast />
    </div>
  );
  return (
    <div className="flex min-h-screen bg-ivory font-sans">
      <Seo title={`${title} — Espace administrateur`} noIndex />
      <Sidebar user={access.profile} onLogout={() => dispatch(logout())} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-9 lg:py-8">
        <button type="button" onClick={() => setMenuOpen(true)} className="mb-4 rounded-lg border border-line bg-white px-3 py-2 lg:hidden" aria-label="Ouvrir le menu">☰</button>
        <Link to={backTo} className="text-sm font-semibold text-gold hover:underline">← {backLabel}</Link>
        <h1 className="mt-3 mb-6 font-serif text-3xl font-bold text-forest-deep">{title}</h1>
        {children}
      </main>
      <Modal /><Toast />
    </div>
  );
}

export const DETAIL_CARD = "rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]";
export const DETAIL_BUTTON = "rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50";
export const DETAIL_INPUT = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-normal text-ink";
