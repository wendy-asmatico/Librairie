import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../slices/toastSlice";
import { updateCurrentUserThunk } from "../../thunkActionsCreator/userThunks";

const fields = [
  { name: "firstName", label: "Prénom", type: "text", autocomplete: "given-name" },
  { name: "lastName", label: "Nom", type: "text", autocomplete: "family-name" },
  { name: "email", label: "Adresse e-mail", type: "email", autocomplete: "email" },
];

const inputClass = "mt-2 h-12 w-full rounded-control border border-line-strong bg-white px-3 text-sm text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/15";

export default function AccountProfileForm() {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" });

  useEffect(() => {
    setValues((current) => ({
      ...current,
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
    }));
  }, [profile]);

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(updateCurrentUserThunk({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password || undefined,
    }));

    if (updateCurrentUserThunk.fulfilled.match(result)) {
      setValues((current) => ({ ...current, password: "" }));
      dispatch(showToast("Vos informations ont été mises à jour."));
    } else {
      dispatch(showToast(result.payload || "La mise à jour a échoué."));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="block text-sm font-medium text-ink-soft">
            {field.label}
            <input
              className={inputClass}
              type={field.type}
              name={field.name}
              autoComplete={field.autocomplete}
              required
              value={values[field.name]}
              onChange={handleChange}
            />
          </label>
        ))}
        <label className="block text-sm font-medium text-ink-soft">
          Nouveau mot de passe
          <input
            className={inputClass}
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Laisser vide pour ne pas le modifier"
            value={values.password}
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        <p className="text-xs text-ink-muted">Identifiant : {profile?.username || "—"}</p>
        <button
          type="submit"
          disabled={loading}
          className="min-h-12 rounded-control bg-secondary px-6 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}