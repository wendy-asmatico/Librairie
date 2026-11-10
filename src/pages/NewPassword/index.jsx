import { useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const strength = (pwd) =>
  pwd
    ? [pwd.length >= 8, /[A-Z]/.test(pwd), /\d/.test(pwd), /[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12]
        .filter(Boolean).length || 1
    : 0;

const STRENGTH = [
  { label: "", color: "" },
  { label: "Faible", color: "text-danger", bar: "bg-danger" },
  { label: "Moyen", color: "text-gold", bar: "bg-gold" },
  { label: "Bon", color: "text-[#4f8a3f]", bar: "bg-sage" },
  { label: "Excellent", color: "text-[#4f8a3f]", bar: "bg-sage" },
];

export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const key = searchParams.get("key");
  const login = searchParams.get("login");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const level = useMemo(() => strength(password), [password]);
  const currentStrength = STRENGTH[level];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key || !login) {
      setError("Le lien de réinitialisation est invalide ou incomplet.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/new-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, login, password }),
      },
    );
    const data = await response.json();
    setMessage(data.message || "");
    if (response.ok) {
      setTimeout(() => navigate("/"), 1200);
    } else {
      setError(data.message || "Impossible de modifier le mot de passe.");
    }
  };

  return (
    <main className="min-h-screen bg-ivory px-gutter py-12 font-sans text-ink">
      <div className="mx-auto max-w-xl rounded-[28px] border border-line bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-10">
        <p className="text-[11px] leading-4 font-bold tracking-[1.2px] text-gold uppercase">Sécurité</p>
        <h1 className="mt-3 font-serif text-[38px] leading-[44px] font-semibold text-forest-deep">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm leading-[22px] text-[#444841]">
          Choisissez un mot de passe fort pour sécuriser votre compte.
        </p>

        <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[13px] leading-[18px] font-semibold text-[#444841]">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] text-sm leading-5 text-[#444841] outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/30"
            />
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                <span>Force du mot de passe</span>
                <span className={currentStrength.color}>{currentStrength.label || ""}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#eef2ea]">
                <div
                  className={`h-full rounded-full transition-all ${currentStrength.bar || "bg-transparent"}`}
                  style={{ width: `${(level / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-[13px] leading-[18px] font-semibold text-[#444841]">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-line bg-[#f8fbf6] px-4 py-[13px] text-sm leading-5 text-[#444841] outline-none transition-colors focus:border-sage focus:ring-2 focus:ring-sage/30"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[#f8dcd5] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a2c1b]">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-mint px-4 py-3 text-sm text-forest-deep">{message}</p>
          )}

          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-gold py-4 text-sm leading-[18px] font-semibold tracking-[0.56px] text-white shadow-[0_6px_16px_-4px_rgba(120,89,26,0.25)] transition-colors hover:bg-gold-dark"
          >
            Confirmer
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-semibold text-gold hover:text-gold-dark">
            ← Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
