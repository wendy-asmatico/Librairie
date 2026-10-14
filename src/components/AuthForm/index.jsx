import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModal,
  updateModalProps,
} from "../../slices/modalSlice";
import { showToast } from "../../slices/toastSlice";
import {
  loginThunk,
  registerThunk,
} from "../../thunkActionsCreator/userThunks";

// Style des maquettes Connexion / Inscription de Lisa (nodes 200:2 et 211:38)
const FIELD = "flex flex-col gap-2";
const LABEL = "font-sans text-[13px] leading-[18px] font-semibold text-[#444841]";
const INPUT =
  "w-full rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] font-sans text-sm leading-5 text-[#444841] outline-none transition-colors placeholder:text-danger focus:border-sage focus:ring-2 focus:ring-sage/30";
const INPUT_ERROR = "border-danger focus:border-danger focus:ring-danger/20";
const BUTTON =
  "flex-1 cursor-pointer rounded-lg py-4 font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] transition-colors";

export default function AuthForm({ view = "login" }) {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.user);

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (token) dispatch(closeModal());
  }, [dispatch, token]);

  useEffect(() => {
    dispatch(showToast(error));
  }, [error]);

  const validateLogin = (method, updatedForm) => {
    setErrors({});
    const newErrors = {};
    !updatedForm && (updatedForm = form);
    if (!updatedForm.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis.";
    }
    if (!updatedForm.password)
      newErrors.password = "Le mot de passe est requis.";
    else if (updatedForm.password.length < 8)
      newErrors.password = " Il faut au moins 8 caractères.";
    if (method === "register") {
      if (!updatedForm.email.trim()) {
        newErrors.email = "L'adresse e-mail est requise.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedForm.email)) {
        newErrors.email = "Entrez une adresse e-mail valide.";
      }
      if (!updatedForm.confirmPassword) {
        newErrors.confirmPassword = "Veuillez confirmer votre mot de passe.";
      } else if (updatedForm.confirmPassword !== updatedForm.password) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    validateLogin(e, updatedForm);
  };

  const handleSubmit = (e, method = view) => {
    if (e) e.preventDefault();
    const validation = validateLogin(method);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    if (method === "login") {
      dispatch(
        loginThunk({ username: form.username.trim(), password: form.password }),
      )
        .unwrap()
        .then((data) =>
          dispatch(showToast(`Bienvenue ${data.profile.displayName || ""}, vous êtes connecté.`)),
        )
        .catch(() => {});
    }
    if (method === "register") {
      dispatch(
        registerThunk({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      )
        .unwrap()
        .then(() => dispatch(showToast("Votre compte a bien été créé, vous êtes connecté.")))
        .catch(() => {});
    }
  };

  return (
    <form className="flex w-[440px] max-w-full flex-col gap-4 font-sans">
      <h2 className="font-['Cormorant_Garamond',serif] text-[38px] leading-[44px] font-semibold text-forest-deep">
        {view === "login"
          ? "Bonjour"
          : view === "register"
            ? "Créer un compte"
            : "Confirmez votre mot de passe"}
      </h2>
      <div className={FIELD}>
        <label htmlFor="username" className={LABEL}>Nom d'utilisateur</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          className={`${INPUT} ${errors.username ? INPUT_ERROR : ""}`}
          autoComplete="username"
          placeholder={errors.username}
          title={errors.username}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>
      {view === "register" && (
        <div className={FIELD}>
          <label htmlFor="email" className={LABEL}>E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`${INPUT} ${errors.email ? INPUT_ERROR : ""}`}
            autoComplete="email"
            placeholder={errors.email}
            title={errors.email}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
      )}
      <div className={FIELD}>
        <label htmlFor="password" className={LABEL}>Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className={`${INPUT} ${errors.password ? INPUT_ERROR : ""}`}
          autoComplete={view === "login" ? "current-password" : "new-password"}
          placeholder={errors.password}
          title={errors.password}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>
      {view === "register" && (
        <div className={FIELD}>
          <label htmlFor="confirmPassword" className={LABEL}>Confirmez le mot de passe</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`${INPUT} ${errors.confirmPassword ? INPUT_ERROR : ""}`}
            autoComplete="new-password"
            autoFocus
            placeholder={errors.confirmPassword}
            title={errors.confirmPassword}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
      )}
      <button
        type="button"
        className="order-2 cursor-pointer self-center font-sans text-xs leading-[18px] font-semibold text-gold hover:text-gold-dark"
        onClick={() => dispatch(updateModalProps({ view: "reset-password" }))}
      >
        Mot de passe oublié ?
      </button>
      <div className="order-1 flex flex-wrap gap-3">
        <button
          className={`${BUTTON} bg-gold text-white shadow-[0_6px_16px_-4px_rgba(120,89,26,0.25)] hover:bg-gold-dark`}
          type="button"
          onClick={(e) => {
            dispatch(updateModalProps({ view: "login" }));
            handleSubmit(e, "login");
          }}
        >
          Se connecter
        </button>
        <button
          type="button"
          className={`${BUTTON} bg-sage text-forest-deep hover:bg-sage-hover`}
          onClick={(e) => {
            dispatch(updateModalProps({ view: "register" }));
            handleSubmit(e, "register");
          }}
        >
          S'inscrire
        </button>{" "}
      </div>
    </form>
  );
}