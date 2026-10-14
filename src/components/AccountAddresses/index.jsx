import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../slices/toastSlice";
import { updateCurrentCustomerThunk } from "../../thunkActionsCreator/userThunks";

const addressFields = [
  { name: "firstName", label: "Prénom", autocomplete: "given-name" },
  { name: "lastName", label: "Nom", autocomplete: "family-name" },
  { name: "company", label: "Entreprise", autocomplete: "organization" },
  { name: "address1", label: "Adresse", autocomplete: "address-line1" },
  { name: "address2", label: "Complément d’adresse", autocomplete: "address-line2" },
  { name: "city", label: "Ville", autocomplete: "address-level2" },
  { name: "state", label: "Région", autocomplete: "address-level1" },
  { name: "postcode", label: "Code postal", autocomplete: "postal-code" },
  { name: "country", label: "Code pays", autocomplete: "country" },
];

const inputClass = "mt-1.5 h-11 w-full rounded-control border border-line-strong bg-white px-3 text-sm text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/15";

function AddressForm({ addressType, title, customer, loading }) {
  const dispatch = useDispatch();
  const address = customer?.[addressType] || {};
  const [values, setValues] = useState(address);

  useEffect(() => {
    setValues(address);
  }, [addressType, JSON.stringify(address)]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(updateCurrentCustomerThunk({ [addressType]: values }));
    dispatch(showToast(
      updateCurrentCustomerThunk.fulfilled.match(result)
        ? "Adresse enregistrée."
        : result.payload || "Impossible d’enregistrer cette adresse.",
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-serif text-xl font-semibold text-forest">{title}</h3>
      <div className="mt-5 grid gap-x-4 gap-y-4 sm:grid-cols-2">
        {addressFields.map((field) => (
          <label key={field.name} className={`block text-sm font-medium text-ink-soft ${field.name === "address1" || field.name === "address2" ? "sm:col-span-2" : ""}`}>
            {field.label}
            <input
              className={inputClass}
              type="text"
              name={field.name}
              autoComplete={field.autocomplete}
              value={values[field.name] || ""}
              onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
            />
          </label>
        ))}
        {addressType === "billing" && (
          <label className="block text-sm font-medium text-ink-soft">
            Téléphone
            <input
              className={inputClass}
              type="tel"
              name="phone"
              autoComplete="tel"
              value={values.phone || ""}
              onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 rounded-control bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : "Enregistrer l’adresse"}
        </button>
      </div>
    </form>
  );
}

export default function AccountAddresses() {
  const { customer, loading } = useSelector((state) => state.user);

  if (!customer) {
    return <p className="py-6 text-sm text-ink-muted">Chargement de vos adresses…</p>;
  }

  return (
    <div className="space-y-8">
      <AddressForm addressType="billing" title="Adresse de facturation" customer={customer} loading={loading} />
      <AddressForm addressType="shipping" title="Adresse de livraison" customer={customer} loading={loading} />
    </div>
  );
}