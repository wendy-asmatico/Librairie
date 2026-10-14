import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import AccountAside from "../AccountAside";
import {
  AccountAlert,
  AccountCard,
  AccountCheckbox,
  AccountField,
  AccountHeader,
  LABEL,
} from "../AccountForm";
import { closeModal, updateModalProps } from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";
import {
  loginThunk,
  registerThunk,
} from "../../thunkActionsCreator/userThunks";

import icUser from "../../assets/compte/ic-user-gold.svg";
import icUserPlus from "../../assets/compte/ic-user-plus-gold.svg";
import icMail from "../../assets/contact/ic-mail.svg";
import icLock from "../../assets/compte/ic-lock.svg";
import icLockSmall from "../../assets/contact/ic-lock.svg";
import icArrow from "../../assets/compte/ic-arrow.svg";

// Mêmes règles que WordPress (is_email), pour ne pas envoyer un email que le serveur refusera
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
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

// Modale Connexion / Inscription — maquettes de Lisa « Connexion — ordinateur » (200:2)
// et « Inscription — ordinateur » (211:38) : carte du formulaire + panneau visuel
export default function AuthForm({ view = "login" }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    if (token) dispatch(closeModal());
  }, [dispatch, token]);

  const show = (next) => dispatch(updateModalProps({ view: next }));

  return (
    <div className="flex w-[1184px] max-w-full flex-col items-stretch gap-8 lg:flex-row lg:items-start">
      {view === "register" ? <RegisterCard /> : <LoginCard />}
      <div className="hidden lg:flex lg:self-stretch">
        {view === "register" ? (
          <AccountAside
            badge="DÉJÀ CLIENT"
            title={"Vous avez déjà un compte ?"}
            text="Retrouvez vos commandes, vos favoris et vos coffrets en cours en vous connectant."
            cta="Me connecter"
            onClick={() => show("login")}
            gold
          />
        ) : (
          <AccountAside
            badge="NOUVEAU CLIENT"
            title={"Pas encore de compte ?"}
            text="Rejoignez la communauté Maktaba El Hikma : c'est gratuit et cela ne prend qu'une minute."
            cta="Créer mon compte"
            onClick={() => show("register")}
          />
        )}
      </div>
    </div>
  );
}

// Sous lg, le panneau visuel est masqué : simple lien dans la carte pour changer de vue
function SwitchLink({ question, label, to }) {
  const dispatch = useDispatch();
  return (
    <p className="flex flex-wrap justify-center gap-1.5 border-t border-line pt-5 font-sans text-[13px] leading-5 lg:hidden">
      <span className="text-muted">{question}</span>
      <button
        type="button"
        onClick={() => dispatch(updateModalProps({ view: to }))}
        className="cursor-pointer font-semibold text-gold hover:text-gold-dark"
      >
        {label}
      </button>
    </p>
  );
}

function LoginCard() {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL.test(email.trim())) next.email = "Entrez une adresse email valide.";
    if (!password) next.password = "Entrez votre mot de passe.";
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) return;

    try {
      const data = await dispatch(
        loginThunk({ username: email.trim(), password, remember }),
      ).unwrap();
      dispatch(showToast(`Bienvenue ${data.profile.displayName || ""}, vous êtes connecté.`));
    } catch {
      setFailure("Adresse email ou mot de passe incorrect.");
    }
  };

  return (
    <AccountCard onSubmit={handleSubmit}>
      <AccountHeader
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
            onClick={() => dispatch(updateModalProps({ view: "reset-password" }))}
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
        <Link
          to="/panier"
          onClick={() => dispatch(closeModal())}
          className="font-semibold text-gold hover:text-gold-dark"
        >
          Commander en tant qu&apos;invité →
        </Link>
      </p>

      <SwitchLink question="Pas encore de compte ?" label="Créer mon compte →" to="register" />
    </AccountCard>
  );
}

function RegisterCard() {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.user.loading);

  const [civility, setCivility] = useState("");
  const [values, setValues] = useState(EMPTY);
  const [newsletter, setNewsletter] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");

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
      dispatch(showToast("Votre compte a bien été créé, vous êtes connecté."));
    } catch (message) {
      setFailure(String(message || "La création du compte a échoué, merci de réessayer."));
    }
  };

  return (
    <AccountCard onSubmit={handleSubmit}>
      <AccountHeader
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
        <Link
          to="/cgv"
          onClick={() => dispatch(closeModal())}
          className="font-semibold text-gold underline hover:text-gold-dark"
        >
          Conditions générales de vente
        </Link>{" "}
        et la Politique de confidentialité RGPD. *
      </AccountCheckbox>

      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer rounded-lg bg-leaf py-4 font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] text-white transition-colors hover:bg-forest disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="-mt-1 flex items-center justify-center gap-1.5 font-sans text-xs leading-[18px] text-muted">
        <img src={icLockSmall} alt="" className="size-[13px]" />
        Vos données restent strictement confidentielles.
      </p>

      <SwitchLink question="Déjà client ?" label="Me connecter →" to="login" />
    </AccountCard>
  );
}
