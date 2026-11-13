import LegalPage from "../../components/LegalPage";
import { BRAND } from "../../brand";

export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>
        Nom commercial : {BRAND.name}<br />
        Raison sociale et forme juridique : à compléter<br />
        Adresse du siège social : à compléter<br />
        Numéro SIREN / SIRET et registre d’immatriculation : à compléter<br />
        Numéro de TVA intracommunautaire, le cas échéant : à compléter
      </p>
      <h2>Nous contacter</h2>
      <p>
        Adresse de la boutique : {BRAND.address}<br />
        Téléphone : <a href={BRAND.phoneHref}>{BRAND.phone}</a><br />
        E-mail : <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
      </p>
      <h2>Responsable de la publication</h2>
      <p>Nom : à compléter.</p>
      <h2>Hébergement</h2>
      <p>Nom, adresse et coordonnées de l’hébergeur : à compléter.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus du site sont protégés par les droits de propriété intellectuelle applicables. Toute utilisation doit respecter les droits de leurs titulaires.</p>
    </LegalPage>
  );
}
