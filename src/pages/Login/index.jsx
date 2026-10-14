import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import Trust from "../../components/Trust";
import AccountAside from "../../components/AccountAside";
import {
  AccountAlert,
  AccountCard,
  AccountCheckbox,
  AccountField,
  AccountHeader,
} from "../../components/AccountForm";
import Seo from "../../components/Seo";
import { loginThunk } from "../../thunkActionsCreator/userThunks";
import { openModal } from "../../slices/modalSlice";

import icUser from "../../assets/compte/ic-user-gold.svg";
import icMail from "../../assets/contact/ic-mail.svg";
import icLock from "../../assets/compte/ic-lock.svg";
import icArrow from "../../assets/compte/ic-arrow.svg";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Page Connexion — maquette « Connexion — ordinateur » de Lisa (node 200:2)
export default function Login() {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.user);
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");

  if (token) return <Navigate to={redirect} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL.test(email.trim())) next.email = "Entrez une adresse email valide.";
    if (!password) next.password = "Entrez votre mot de passe.";
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) return;

    try {
      await dispatch(loginThunk({ username: email.trim(), password, remember })).unwrap();
    } catch {
      setFailure("Adresse email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="bg-ivory">
      <Seo title="Connexion" noIndex />
      <section className="px-4 pt-6 pb-12 lg:px-12 lg:pt-10 lg:pb-[72px]">
        <div className="mx-auto flex max-w-[1184px] flex-col items-stretch gap-8 lg:flex-row lg:items-start">
          <AccountCard onSubmit={handleSubmit}>
            <AccountHeader
              current="Connexion"
              icon={icUser}
              kicker="DÉJÀ CLIENT"
              title="Heureux de vous revoir"
              text="Retrouvez vos commandes, vos favoris et vos coffrets en cours."
            />

            {failure && <AccountAlert>{failure}</AccountAlert>}

            <AccountField
              label="Adresse email"
              icon={icMail}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="salam@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoFocus
            />

            <AccountField
              label="Mot de passe"
              aside={
                <button
                  type="button"
                  onClick={() => dispatch(openModal({ name: "auth", props: { view: "reset-password" } }))}
                  className="cursor-pointer font-sans text-xs leading-[18px] font-semibold text-gold hover:text-gold-dark"
                >
                  Mot de passe oublié ?
                </button>
              }
              icon={icLock}
              name="password"
              password
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <AccountCheckbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
              Se souvenir de moi
            </AccountCheckbox>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold py-4 font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] text-white shadow-[0_6px_16px_-4px_rgba(120,89,26,0.25)] transition-colors hover:bg-gold-dark disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Connexion…" : "Me connecter"}
              <img src={icArrow} alt="" className="size-3.5" />
            </button>

            <p className="flex flex-wrap justify-center gap-1.5 font-sans text-[13px] leading-5">
              <span className="text-muted">Pas encore prêt ?</span>
              <Link to="/panier" className="font-semibold text-gold hover:text-gold-dark">
                Commander en tant qu&apos;invité →
              </Link>
            </p>
          </AccountCard>

          <AccountAside
            badge="NOUVEAU CLIENT"
            title={"Pas encore de compte\u00a0?"}
            text="Rejoignez la communauté Maktaba El Hikma : c'est gratuit et cela ne prend qu'une minute."
            cta="Créer mon compte"
            to={`/inscription${params.get("redirect") ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          />
        </div>
      </section>
      <Trust />
    </div>
  );
}
