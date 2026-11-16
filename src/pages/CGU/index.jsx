import LegalPage from "../../components/LegalPage";
import { BRAND } from "../../brand";

export default function CGU() {
  return (
    <LegalPage title="Conditions générales d’utilisation">
      <h2>Objet</h2>
      <p>Ces conditions concernent l’utilisation du site {BRAND.name}. L’identité de l’éditeur figure dans les mentions légales.</p>
      <h2>Accès et compte client</h2>
      <p>Le site permet de consulter le catalogue et de passer commande. La création d’un compte donne accès à un espace personnel. L’utilisateur doit protéger ses identifiants et communiquer des informations exactes.</p>
      <p>Conditions d’accès, disponibilité du service et gestion du compte : à compléter.</p>
      <h2>Utilisation des contenus</h2>
      <p>Les contenus du site sont protégés par les droits de leurs titulaires. Leur utilisation doit respecter la réglementation applicable.</p>
      <h2>Contact</h2>
      <p>Pour toute question : <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.</p>
    </LegalPage>
  );
}
