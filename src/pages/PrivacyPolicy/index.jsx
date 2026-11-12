import LegalPage from "../../components/LegalPage";
import { BRAND } from "../../brand";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Responsable du traitement</h2>
      <p>Identité juridique et coordonnées du responsable du traitement : à compléter. Pour contacter la boutique : <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.</p>
      <h2>Données et finalités</h2>
      <p>Le site recueille notamment les informations saisies lors de la création d’un compte, d’une commande, d’une demande de contact ou d’une inscription à la newsletter.</p>
      <p>Pour chaque traitement, les données concernées, finalités, bases légales, destinataires et durées de conservation doivent être détaillés : à compléter.</p>
      <h2>Prestataires</h2>
      <p>Les prestataires susceptibles d’intervenir comprennent notamment l’hébergeur, le prestataire de paiement, le transporteur et Brevo pour la newsletter. Leurs rôles, accès aux données et éventuels transferts hors de l’Espace économique européen : à compléter et à vérifier.</p>
      <h2>Newsletter</h2>
      <p>L’adresse saisie pour la newsletter est transmise à Brevo afin de gérer l’inscription. Les modalités de retrait du consentement et de désinscription doivent être confirmées dans les campagnes envoyées.</p>
      <h2>Vos droits</h2>
      <p>Selon les conditions prévues par la réglementation, vous pouvez notamment demander l’accès à vos données, leur rectification ou leur effacement, et exercer vos autres droits auprès du responsable du traitement. Vous pouvez également introduire une réclamation auprès de la CNIL.</p>
      <h2>Cookies et traceurs</h2>
      <p>Liste des cookies et traceurs, finalités, durées et modalités de gestion du consentement : à compléter après inventaire.</p>
    </LegalPage>
  );
}
