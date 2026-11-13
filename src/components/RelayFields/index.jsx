const fields = [
  { name: "company", label: "Nom du point relais" },
  { name: "address_1", label: "Adresse du point relais" },
  { name: "postcode", label: "Code postal" },
  { name: "city", label: "Ville" },
];

export default function RelayFields({ address, onChange }) {
  return (
    <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <legend className="mb-2 font-semibold">Point relais choisi</legend>
      <p className="text-sm text-ink-muted sm:col-span-2">
        Choisissez un point auprès du transporteur et saisissez ses coordonnées.
        Vérifiez qu’il appartient bien au réseau sélectionné : cette saisie n’est pas vérifiée automatiquement.
      </p>
      {fields.map(({ name, label }) => (
        <label key={name} className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">{label}</span>
          <input
            name={name}
            value={address[name]}
            onChange={onChange}
            required
            maxLength={name === "postcode" ? 5 : 100}
            pattern={name === "postcode" ? "[0-9]{5}" : undefined}
            className={paymentInput}
          />
        </label>
      ))}
    </fieldset>
  );
}
import { paymentInput } from "../PaymentForm/styles";
