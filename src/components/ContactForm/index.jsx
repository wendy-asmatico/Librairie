import { forwardRef, useRef, useState } from "react";
import { Link } from "react-router-dom";

import icMailGold from "../../assets/contact/ic-mail-gold.svg";
import icCheck from "../../assets/contact/ic-check.svg";
import icUser from "../../assets/contact/ic-user.svg";
import icMail from "../../assets/contact/ic-mail.svg";
import icPhone from "../../assets/contact/ic-phone.svg";
import icBag from "../../assets/contact/ic-bag.svg";
import icClip from "../../assets/contact/ic-clip.svg";
import icCheckbox from "../../assets/contact/ic-checkbox.svg";
import icLock from "../../assets/contact/ic-lock.svg";
import icSend from "../../assets/contact/ic-send.svg";

// Objets proposés — les clés correspondent au mu-plugin contact.php
export const SUBJECTS = [
  { value: "commande", label: "Commande & livraison" },
  { value: "coffret", label: "Coffret cadeau sur mesure" },
  { value: "conseil", label: "Conseil lecture" },
  { value: "devis", label: "Devis pro / association" },
  { value: "retrait", label: "Retrait en boutique" },
  { value: "autre", label: "Autre" },
];

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ".jpg,.jpeg,.png,.pdf";

const EMPTY = {
  lastname: "",
  firstname: "",
  email: "",
  phone: "",
  order: "",
  message: "",
  website: "",
};

const LABEL = "font-sans text-[13px] leading-[18px] font-semibold text-[#444841]";
const OPTIONAL = "font-sans text-xs leading-[18px] font-normal text-muted";
const FIELD =
  "flex w-full items-center gap-2.5 rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] transition-colors focus-within:border-sage focus-within:bg-white";
const INPUT =
  "min-w-0 flex-1 bg-transparent font-sans text-sm leading-5 text-[#444841] outline-none placeholder:text-muted";

function Field({ label, optional, icon, className = "", ...props }) {
  return (
    <label className={`flex min-w-0 flex-1 flex-col gap-2 ${className}`}>
      <span className="flex gap-1">
        <span className={LABEL}>
          {label}
          {!optional && " *"}
        </span>
        {optional && <span className={OPTIONAL}>(facultatif)</span>}
      </span>
      <span className={FIELD}>
        <img src={icon} alt="" className="size-4 shrink-0" />
        <input className={INPUT} required={!optional} {...props} />
      </span>
    </label>
  );
}

// Carte « Envoyez-nous un message » — maquette de Lisa (node 177:36)
const ContactForm = forwardRef(function ContactForm({ initialSubject = "commande" }, ref) {
  const [subject, setSubject] = useState(initialSubject);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const fileRef = useRef(null);

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const update = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked && picked.size > MAX_SIZE) {
      setStatus({ state: "error", message: "La pièce jointe dépasse 5 Mo." });
      e.target.value = "";
      return;
    }
    setStatus({ state: "idle", message: "" });
    setFile(picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setStatus({ state: "error", message: "Merci d'accepter la politique de confidentialité." });
      return;
    }

    const body = new FormData();
    body.append("subject", subject);
    Object.entries(values).forEach(([key, value]) => body.append(key, value.trim()));
    body.append("consent", "1");
    if (file) body.append("attachment", file);

    setStatus({ state: "sending", message: "" });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/contact`, {
        method: "POST",
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "L'envoi a échoué, merci de réessayer.");

      setValues(EMPTY);
      clearFile();
      setConsent(false);
      setStatus({
        state: "sent",
        message: "Merci ! Votre message est bien parti, un libraire vous répond sous 24 h ouvrées.",
      });
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  const sending = status.state === "sending";

  return (
    <form
      ref={ref}
      id="formulaire"
      onSubmit={handleSubmit}
      className="flex scroll-mt-40 flex-col gap-7 rounded-3xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:p-10"
    >
      <header className="flex flex-col gap-1.5">
        <p className="flex items-center gap-1.5 font-sans text-[11px] leading-4 font-bold tracking-[0.55px] text-gold">
          <img src={icMailGold} alt="" className="size-3" />
          FORMULAIRE DE CONTACT
        </p>
        <h2 className="font-serif text-2xl leading-[1.35] font-bold text-sage sm:text-[28px] sm:leading-[38px]">
          Envoyez-nous un message
        </h2>
        <p className="font-sans text-sm leading-[22px] text-[#444841]">
          Remplissez le formulaire ci-dessous, un libraire vous répond sous 24 h ouvrées. Pour une
          demande urgente, privilégiez WhatsApp.
        </p>
      </header>

      <fieldset className="flex flex-col gap-2.5">
        <legend className={`${LABEL} mb-2.5`}>Objet de votre demande *</legend>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((item) => {
            const active = subject === item.value;
            return (
              <label
                key={item.value}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 font-sans text-[13px] leading-[18px] font-semibold tracking-[0.26px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                  active
                    ? "border-sage bg-sage text-white"
                    : "border-line bg-white text-[#444841] hover:bg-mint-soft"
                }`}
              >
                <input
                  type="radio"
                  name="subject"
                  value={item.value}
                  checked={active}
                  onChange={() => setSubject(item.value)}
                  className="sr-only"
                />
                {active && <img src={icCheck} alt="" className="size-3" />}
                {item.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-7 sm:flex-row sm:gap-4">
        <Field label="Nom" icon={icUser} name="lastname" value={values.lastname} onChange={update} placeholder="Votre nom" autoComplete="family-name" />
        <Field label="Prénom" icon={icUser} name="firstname" value={values.firstname} onChange={update} placeholder="Votre prénom" autoComplete="given-name" />
      </div>

      <div className="flex flex-col gap-7 sm:flex-row sm:gap-4">
        <Field label="Adresse email" icon={icMail} type="email" name="email" value={values.email} onChange={update} placeholder="exemple@email.fr" autoComplete="email" />
        <Field label="Téléphone" optional icon={icPhone} type="tel" name="phone" value={values.phone} onChange={update} placeholder="06 12 34 56 78" autoComplete="tel" />
      </div>

      <Field label="N° de commande" optional icon={icBag} name="order" value={values.order} onChange={update} placeholder="Ex. MEH-2026-0142" />

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Votre message *</span>
        <textarea
          name="message"
          required
          value={values.message}
          onChange={update}
          placeholder="Décrivez votre demande : titre recherché, budget pour un coffret, quantité pour un devis…"
          className="h-40 w-full resize-y rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] font-sans text-sm leading-5 text-[#444841] transition-colors outline-none placeholder:text-muted focus:border-sage focus:bg-white"
        />
      </label>

      {/* Champ piège pour les robots, invisible pour les visiteurs */}
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={update}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-sage bg-mint-soft px-4 py-3.5 transition-colors hover:bg-mint has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
          <img src={icClip} alt="" className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-sans leading-[18px]">
          <span className="text-[13px] font-bold text-[#444841]">
            {file ? file.name : "Ajouter une pièce jointe"}
          </span>
          <span className="text-xs text-muted">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`
              : "Photo d'un colis, liste de livres, visuel pour un coffret — JPG, PNG ou PDF, 5 Mo max."}
          </span>
        </span>
        {file ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              clearFile();
            }}
            className="cursor-pointer font-sans text-[13px] leading-[18px] font-semibold tracking-[0.26px] text-gold hover:text-gold-dark"
          >
            Retirer
          </button>
        ) : (
          <span className="font-sans text-[13px] leading-[18px] font-semibold tracking-[0.26px] text-gold">
            Parcourir
          </span>
        )}
        <input ref={fileRef} type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />
      </label>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="peer sr-only"
        />
        <span className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded border border-line bg-white peer-checked:border-sage peer-checked:bg-sage peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
          {consent && <img src={icCheckbox} alt="" className="size-[11px]" />}
        </span>
        <span className="flex-1 font-sans text-[13px] leading-5 text-[#444841]">
          J&apos;accepte que mes données soient utilisées pour traiter ma demande, conformément à la{" "}
          <Link to="/cgu" className="font-semibold text-gold underline hover:text-gold-dark">
            Politique de confidentialité RGPD
          </Link>
          .
        </span>
      </label>

      <hr className="h-px border-0 bg-line" />

      {status.message && (
        <p
          role={status.state === "error" ? "alert" : "status"}
          className={`-mt-2 rounded-lg px-4 py-3 font-sans text-[13px] leading-5 ${
            status.state === "error" ? "bg-[#fbeceb] text-danger" : "bg-mint-soft text-forest"
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center">
        <p className="flex flex-1 items-center gap-1.5 font-sans text-xs leading-[18px] text-muted">
          <img src={icLock} alt="" className="size-[13px]" />
          Vos données restent strictement confidentielles.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gold px-8 py-4 font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] text-white shadow-[0_6px_16px_-4px_rgba(120,89,26,0.25)] transition-colors hover:bg-gold-dark disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? "Envoi en cours…" : "Envoyer mon message"}
          <img src={icSend} alt="" className="size-3.5" />
        </button>
      </div>
    </form>
  );
});

export default ContactForm;
