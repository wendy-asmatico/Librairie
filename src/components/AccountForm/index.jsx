import { useState } from "react";
import { Link } from "react-router-dom";

import icEye from "../../assets/compte/ic-eye.svg";
import icCheckbox from "../../assets/contact/ic-checkbox.svg";

// Éléments communs des cartes Connexion / Inscription (maquettes 201:15 et 211:240)

export const LABEL = "font-sans text-[13px] leading-[18px] font-semibold text-[#444841]";
const FIELD =
  "flex w-full items-center gap-2.5 rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] transition-colors focus-within:border-[1.5px] focus-within:border-sage focus-within:px-[15.5px] focus-within:py-[12.5px]";
const INPUT =
  "min-w-0 flex-1 bg-transparent font-sans text-sm leading-5 text-[#444841] outline-none placeholder:text-muted";

export function AccountCard({ children, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-w-0 flex-1 flex-col gap-6 rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-11"
    >
      {children}
    </form>
  );
}

export function AccountHeader({ current, icon, kicker, title, text }) {
  return (
    <header className="flex flex-col gap-2">
      {current && (
      <nav aria-label="Fil d'Ariane">
        <ol className="flex flex-wrap gap-2 font-sans text-xs leading-[18px] text-muted">
          <li><Link to="/" className="hover:text-gold">Accueil</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link to="/profile" className="hover:text-gold">Mon Compte</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="font-semibold text-gold">{current}</li>
        </ol>
      </nav>
      )}
      <p className=" flex items-center gap-1.5 font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-gold">
        <img src={icon} alt="" className="size-3" />
        {kicker}
      </p>
      <h1 className="font-['Cormorant_Garamond',serif] text-[38px] leading-[44px] font-semibold text-forest-deep sm:text-[46px] sm:leading-[52px]">
        {title}
      </h1>
      <p className="font-sans text-sm leading-[22px] text-[#444841]">{text}</p>
    </header>
  );
}

export function AccountField({ label, aside, icon, error, hint, children, password = false, ...props }) {
  const [visible, setVisible] = useState(false);
  const id = props.id || props.name;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className={`${LABEL} flex-1`}>
          {label}
        </label>
        {aside}
      </div>
      <div className={`${FIELD} ${error ? "border-danger" : ""}`}>
        {icon && <img src={icon} alt="" className="size-4 shrink-0" />}
        <input
          id={id}
          className={INPUT}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          type={password ? (visible ? "text" : "password") : props.type}
        />
        {password && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={`shrink-0 cursor-pointer transition-opacity ${visible ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
          >
            <img src={icEye} alt="" className="size-4" />
          </button>
        )}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="font-sans text-xs leading-[18px] text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="font-sans text-xs leading-[18px] text-muted">{hint}</p>
      )}
    </div>
  );
}

export function AccountCheckbox({ checked, onChange, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex cursor-pointer items-start gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span
          className={`mt-px flex size-[18px] shrink-0 items-center justify-center rounded border-[1.2px] bg-white peer-checked:border-sage peer-checked:bg-sage peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold ${
            error ? "border-danger" : "border-[#c7cfc2]"
          }`}
        >
          {checked && <img src={icCheckbox} alt="" className="size-[11px]" />}
        </span>
        <span className="flex-1 font-sans text-[13px] leading-5 text-[#444841]">{children}</span>
      </label>
      {error && <p className="pl-7 font-sans text-xs leading-[18px] text-danger">{error}</p>}
    </div>
  );
}

export function AccountAlert({ children }) {
  return (
    <p role="alert" className="rounded-lg bg-[#fbeceb] px-4 py-3 font-sans text-[13px] leading-5 text-danger">
      {children}
    </p>
  );
}
