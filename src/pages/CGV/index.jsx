import LegalPage from "../../components/LegalPage";
import { BRAND } from "../../brand";

export default function CGV() {
  return (
    <LegalPage title="Conditions générales de vente et rétractation">
      <h2>Vendeur et champ d’application</h2>
      <p>Les présentes conditions concernent les commandes passées sur le site {BRAND.name}. L’identité juridique du vendeur et les éventuelles conditions particulières restent à compléter.</p>
      <h2>Produits, prix et commande</h2>
      <p>Les caractéristiques, le prix et la disponibilité des articles sont indiqués sur le site. Les frais applicables et le montant total sont présentés avant la validation de la commande.</p>
      <p>Modalités de conclusion du contrat, disponibilité et traitement des commandes : à compléter.</p>
      <h2>Paiement</h2>
      <p>Les moyens de paiement proposés sont indiqués lors de la commande. Les conditions de paiement et de confirmation restent à compléter.</p>
      <h2>Livraison et retrait</h2>
      <p>Les modes de réception et leurs frais sont présentés lors de la commande. Le retrait en boutique est proposé à l’adresse suivante : {BRAND.address}.</p>
      <p>Zones desservies, délais et modalités de livraison ou de retrait : à compléter.</p>
      <h2>Droit de rétractation</h2>
      <p>Pour les achats à distance, le consommateur bénéficie en principe d’un délai de rétractation de 14 jours, sous réserve des exceptions prévues par la loi.</p>
      <p>Modalités d’exercice, formulaire, adresse et frais de retour, délais de remboursement et exceptions applicables : à compléter et à vérifier avant publication.</p>
      <h2>Garanties et réclamations</h2>
      <p>Les garanties légales applicables, notamment de conformité et contre les vices cachés, ainsi que leurs conditions d’exercice : à compléter.</p>
      <p>Pour une réclamation : <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> ou <a href={BRAND.phoneHref}>{BRAND.phone}</a>.</p>
      <h2>Médiation</h2>
      <p>Coordonnées du médiateur de la consommation compétent et modalités de saisine : à compléter.</p>
    </LegalPage>
  );
}
