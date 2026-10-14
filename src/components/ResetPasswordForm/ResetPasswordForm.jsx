import { useState } from "react";
import { useDispatch } from "react-redux";

import { updateModalProps } from "../../slices/modalSlice";

export default function ResetPasswordForm() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <>
      <h1 className="font-['Cormorant_Garamond',serif] text-[38px] leading-[44px] font-semibold text-forest-deep">Mot de passe oublié</h1>
      <p className="mt-2 font-sans text-sm leading-[22px] text-[#444841]">
        Recevez un lien pour réinitialiser votre mot de passe
      </p>

      <form className="mt-6 flex w-[440px] max-w-full flex-col gap-5 font-sans" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="reset-email" className="font-sans text-[13px] leading-[18px] font-semibold text-[#444841]">Votre email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] font-sans text-sm leading-5 text-[#444841] outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/30"
          />
        </div>

        {message && <p className="rounded-lg bg-mint px-4 py-3 font-sans text-[13px] leading-5 text-forest-deep">{message}</p>}

        <button className="cursor-pointer rounded-lg bg-gold py-4 font-sans text-sm leading-[18px] font-semibold tracking-[0.56px] text-white shadow-[0_6px_16px_-4px_rgba(120,89,26,0.25)] transition-colors hover:bg-gold-dark" type="submit">
          Envoyer le lien
        </button>
      </form>

      <p className="mt-5 text-center">
        <button
          type="button"
          className="cursor-pointer font-sans text-xs leading-[18px] font-semibold text-gold hover:text-gold-dark"
          onClick={() => dispatch(updateModalProps({ view: "login" }))}
        >
          Retour à la connexion
        </button>
      </p>
    </>
  );
}
