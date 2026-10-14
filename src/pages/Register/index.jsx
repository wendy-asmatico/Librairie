import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import CatalogueTrust from "../../components/CatalogueTrust";
import AccountAside from "../../components/AccountAside";
import {
  AccountAlert,
  AccountCard,
  AccountCheckbox,
  AccountField,
  AccountHeader,
  LABEL,
} from "../../components/AccountForm";
import Seo from "../../components/Seo";
import { registerThunk } from "../../thunkActionsCreator/userThunks";

import icUserPlus from "../../assets/compte/ic-user-plus-gold.svg";
import icLock from "../../assets/contact/ic-lock.svg";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CIVILITIES = [
  { value: "madame", label: "Madame" },
  { value: "monsieur", label: "Monsieur" },
];

// Force du mot de passe : longueur, majuscule, chiffre, puis caractère spécial ou 12+
const STRENGTH = [
  { label: "", color: "" },
  { label: "Faible", color: "text-danger", bar: "bg-danger" },
  { label: "Moyen", color: "text-gold", bar: "bg-gold" },
  { label: "Bon", color: "text-[#4f8a3f]", bar: "bg-sage" },
  { label: "Excellent", color: "text-[#4f8a3f]", bar: "bg-sage" },
];
const strength = (pwd) =>
  pwd
    ? [pwd.length >= 8, /[A-Z]/.test(pwd), /\d/.test(pwd), /[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12].filter(Boolean).length || 1
    : 0;

const EMPTY = { firstName: "", lastName: "", email: "", password: "" };

// Page Inscription — maquette « Inscription — ordinateur » de Lisa (node 211:38)
export default function Register() {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.user);
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/profile";

  const [civility, setCivility] = useState("");
  const [values, setValues] = useState(EMPTY);
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");

  if (token) return <Navigate to={redirect} replace />;

  const update = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const score = strength(values.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!values.firstName.trim()) next.firstName = "Entrez votre prénom.";
    if (!values.lastName.trim()) next.lastName = "Entrez votre nom.";
    if (!EMAIL.test(values.email.trim())) next.email = "Entrez une adresse email valide.";
    if (values.password.length < 8 || !/[A-Z]/.test(values.password) || !/\d/.test(values.password)) {
      next.password = "8 caractères minimum, dont une majuscule et un chiffre.";
    }
    if (!terms) next.terms = "Merci d'accepter les conditions pour créer votre compte.";
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) return;

    try {
      await dispatch(
        registerThunk({
          email: values.email.trim(),
          password: values.password,
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          civility,
          newsletter,
        }),
      ).unwrap();
    } catch (message) {
      setFailure(
        /informations|exists|existe/i.test(String(message))
          ? "Impossible de créer ce compte : cette adresse email est peut-être déjà utilisée. Essayez de vous connecter."
          : String(message || "La création du compte a échoué, merci de réessayer."),
      );
    }
  };

  return (
    <div className="bg-ivory">
      <Seo title="Inscription" noIndex />
      <section className="px-4 pt-6 pb-12 lg:px-12 lg:pt-10 lg:pb-[72px]">
        <div className="mx-auto flex max-w-[1184px] flex-col items-stretch gap-8 lg:flex-row lg:items-start">
          <AccountCard onSubmit={handleSubmit}>
            <AccountHeader
              current="Inscription"
              icon={icUserPlus}
              kicker="NOUVEAU CLIENT"
              title="Rejoignez la librairie"
              text="Rejoignez la communauté Maktaba El Hikma : c'est gratuit et cela ne prend qu'une minute."
            />

            {failure && <AccountAlert>{failure}</AccountAlert>}

            <fieldset className="-mt-0.5 flex flex-col gap-2">
              <legend className={`${LABEL} mb-2`}>Civilité</legend>
              <div className="flex gap-2">
                {CIVILITIES.map((item) => {
                  const active = civility === item.value;
                  return (
                    <label
                      key={item.value}
                      className={`cursor-pointer rounded-full border px-[18px] py-2 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.26px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                        active ? "border-sage bg-sage text-white" : "border-line bg-white text-[#444841] hover:bg-mint-soft"
                      }`}
                    >
                      <input
                        type="radio"
                        name="civility"
                        value={item.value}
                        checked={active}
                        onChange={() => setCivility(item.value)}
                        className="sr-only"
                      />
                      {item.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
              <AccountField label="Prénom *" name="firstName" autoComplete="given-name" placeholder="Votre prénom" value={values.firstName} onChange={update} error={errors.firstName} />
              <AccountField label="Nom *" name="lastName" autoComplete="family-name" placeholder="Votre nom" value={values.lastName} onChange={update} error={errors.lastName} />
            </div>

            <AccountField label="Adresse email *" name="email" type="email" autoComplete="email" placeholder="exemple@email.fr" value={values.email} onChange={update} error={errors.email} />

            <AccountField
              label="Mot de passe *"
              name="password"
              password
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              onChange={update}
              error={errors.password}
              hint="8 caractères minimum, dont une majuscule et un chiffre."
            >
              {score > 0 && (
                <div className="flex items-center gap-1.5" aria-live="polite">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-1 flex-1 rounded ${i <= score ? STRENGTH[score].bar : "bg-line"}`} />
                  ))}
                  <span className={`font-sans text-xs leading-[18px] font-semibold ${STRENGTH[score].color}`}>
                    {STRENGTH[score].label}
                  </span>
                </div>
              )}
            </AccountField>

            <AccountCheckbox checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}>
              Je souhaite recevoir les Lumières &amp; Inspirations Littéraires (newsletter mensuelle).
            </AccountCheckbox>

            <AccountCheckbox checked={terms} onChange={(e) => setTerms(e.target.checked)} error={errors.terms}>
              J&apos;accepte les{" "}
              <Link to="/cgv" className="font-semibold text-gold underline hover:text-gold-dark">
                Conditions générales de vente
              </Link>{" "}
              et la Politique de confidentialité RGPD. *
            </AccountCheckbox>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-sage py-4 font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] text-white transition-colors hover:bg-forest disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Création du compte…" : "Créer mon compte"}
            </button>

            <p className="-mt-1 flex items-center justify-center gap-1.5 font-sans text-xs leading-[18px] text-muted">
              <img src={icLock} alt="" className="size-[13px]" />
              Vos données restent strictement confidentielles.
            </p>
          </AccountCard>

          <AccountAside
            badge="DÉJÀ CLIENT"
            title={"Vous avez déjà un compte\u00a0?"}
            text="Retrouvez vos commandes, vos favoris et vos coffrets en cours en vous connectant."
            cta="Me connecter"
            to={`/connexion${params.get("redirect") ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            gold
          />
        </div>
      </section>
      <CatalogueTrust />
    </div>
  );
}
