import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AccountAddresses from "../../components/AccountAddresses";
import AccountNavigation from "../../components/AccountNavigation";
import AccountOrders from "../../components/AccountOrders";
import AccountOverview from "../../components/AccountOverview";
import AccountProfileForm from "../../components/AccountProfileForm";
import DeleteAccountButton from "../../components/DeleteAccountButton";
import Seo from "../../components/Seo";
import {
  fetchCurrentCustomerThunk,
  fetchCurrentUserOrdersThunk,
  fetchCurrentUserThunk,
} from "../../thunkActionsCreator/userThunks";

const SECTIONS = {
  overview: { title: "Vue d'ensemble", eyebrow: "Bienvenue chez vous" },
  profile: { title: "Mes informations", eyebrow: "Votre profil" },
  addresses: { title: "Mes adresses", eyebrow: "Livraison & facturation" },
  orders: { title: "Mes commandes", eyebrow: "Votre historique" },
};

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, profile } = useSelector((state) => state.user);
  const [section, setSection] = useState("overview");

  useEffect(() => {
    if (!token) {
      navigate("/catalogue", { replace: true });
      return;
    }

    dispatch(fetchCurrentUserThunk());
    dispatch(fetchCurrentCustomerThunk());
    dispatch(fetchCurrentUserOrdersThunk());
  }, [dispatch, navigate, token]);

  if (!token) return null;

  const activeSection = SECTIONS[section];
  const displayName = profile?.firstName || profile?.displayName || profile?.email;

  return (
    <div className="bg-white text-ink">
      <Seo title="Mon compte" noIndex />

      <header className="border-b border-line bg-mint">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-gutter py-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Espace client
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-display font-semibold text-forest">Mon compte</h1>
              <p className="mt-2 text-sm text-ink-muted">
                Bonjour{displayName ? ` ${displayName}` : ""}, heureux de vous retrouver.
              </p>
            </div>
            <p className="border-l border-line-strong pl-4 text-sm text-ink-muted">
              Un espace pensé pour vous
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-gutter py-8 pb-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <AccountNavigation activeSection={section} onSelect={setSection} />

        <main className="min-w-0" aria-labelledby="account-section-title">
          <div className="mb-7 border-b border-line pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              {activeSection.eyebrow}
            </p>
            <h2 id="account-section-title" className="mt-2 font-serif text-2xl font-semibold text-forest sm:text-3xl">
              {activeSection.title}
            </h2>
          </div>

          {section === "overview" && <AccountOverview onShowOrders={() => setSection("orders")} />}
          {section === "profile" && (
            <div className="space-y-10">
              <AccountProfileForm />
              <section className="border-t border-line pt-8" aria-labelledby="delete-account-title">
                <h3 id="delete-account-title" className="font-serif text-xl font-semibold text-forest">
                  Zone de prudence
                </h3>
                <p className="mt-2 mb-4 text-sm text-ink-muted">
                  La suppression de votre compte est définitive.
                </p>
                <DeleteAccountButton />
              </section>
            </div>
          )}
          {section === "addresses" && <AccountAddresses />}
          {section === "orders" && <AccountOrders />}
        </main>
      </div>
    </div>
  );
}
