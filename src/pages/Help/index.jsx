import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "../../components/Seo";
import { BRAND } from "../../brand";

const questions = [
  {
    question: "Comment suivre ma commande ?",
    answer: (
      <>
        Connectez-vous et consultez <Link to="/profile?section=orders">mes commandes</Link> pour voir leur statut et leurs détails.
        Si vous avez commandé sans compte, contactez-nous avec votre numéro de commande.
      </>
    ),
  },
  {
    question: "Puis-je retirer ma commande en boutique ?",
    answer: (
      <>
        Le retrait en boutique est proposé lors de la commande lorsqu’il est disponible. L’adresse de retrait est : {BRAND.address}.
        Pour toute question sur le retrait, <Link to="/contact">contactez-nous</Link>.
      </>
    ),
  },
  {
    question: "Comment connaître les frais et délais de livraison ?",
    answer: (
      <>
        Les modes de réception disponibles et les frais sont indiqués lors de la commande, avant le paiement.
        Pour connaître les délais applicables à votre commande, <Link to="/contact?objet=commande">contactez-nous</Link>.
      </>
    ),
  },
  {
    question: "Comment demander un retour ou exercer mon droit de rétractation ?",
    answer: (
      <>
        Consultez les <Link to="/cgv">conditions générales de vente</Link> et contactez-nous à{" "}
        <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> avec les informations de votre commande.
        Les conditions de retour sont en cours de finalisation.
      </>
    ),
  },
  {
    question: "Comment demander un conseil ou un devis ?",
    answer: (
      <>
        Utilisez le <Link to="/contact">formulaire de contact</Link> pour une question ou une demande de conseil.
        Pour un devis ou un coffret sur mesure, choisissez <Link to="/contact?objet=devis">une demande de devis</Link>.
      </>
    ),
  },
  {
    question: "Comment contacter la librairie ?",
    answer: (
      <>
        Vous pouvez nous écrire à <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>, nous appeler au{" "}
        <a href={BRAND.phoneHref}>{BRAND.phone}</a> ou utiliser le <Link to="/contact">formulaire de contact</Link>.
      </>
    ),
  },
];

export default function Help() {
  const [faq, setFaq] = useState({ loading: true, error: false, items: [] });

  useEffect(() => {
    const controller = new AbortController();

    async function loadFaq() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/wp-json/custom/v1/help-settings`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Chargement de la FAQ impossible (HTTP ${response.status}).`);
        const data = await response.json();
        if (!Array.isArray(data.items)) throw new Error("Réponse FAQ invalide.");
        const items = data.items.map((item) => {
          if (typeof item.question !== "string" || typeof item.answer !== "string") {
            throw new Error("Question ou réponse FAQ invalide.");
          }
          const linkUrl = typeof item.link_url === "string" && item.link_url.startsWith("/") && !item.link_url.startsWith("//")
            ? item.link_url
            : "";
          return {
            question: item.question,
            answer: item.answer,
            linkUrl,
            linkLabel: typeof item.link_label === "string" ? item.link_label : "",
          };
        });
        setFaq({ loading: false, error: false, items });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Impossible de charger la FAQ :", error);
          setFaq({ loading: false, error: true, items: [] });
        }
      }
    }

    loadFaq();
    return () => controller.abort();
  }, []);

  const displayedQuestions = faq.error ? questions : faq.items;
  return (
    <div className="bg-white text-ink">
      <Seo title="Centre d’aide et questions fréquentes" />
      <header className="border-b border-line bg-mint">
        <div className="mx-auto max-w-4xl px-gutter py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Nous sommes là pour vous</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-forest sm:text-4xl">Centre d’aide</h1>
          <p className="mt-3 text-sm text-ink-muted">Retrouvez les réponses aux questions les plus fréquentes.</p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-gutter py-10 pb-16" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-5 font-serif text-2xl font-semibold text-forest">Questions fréquentes</h2>
        {faq.loading && <p role="status" className="py-4 text-sm text-ink-muted">Chargement des questions…</p>}
        {faq.error && <p role="alert" className="mb-4 text-sm text-ink-muted">La FAQ personnalisée est temporairement indisponible. Voici les réponses générales.</p>}
        {!faq.loading && !faq.error && displayedQuestions.length === 0 && (
          <p className="py-4 text-sm text-ink-muted">Aucune question n’est disponible pour le moment.</p>
        )}
        <div className="divide-y divide-line border-y border-line">
          {displayedQuestions.map(({ question, answer, linkUrl, linkLabel }, index) => (
            <details key={`${index}-${question}`} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-forest [&::-webkit-details-marker]:hidden">
                {question}
                <span aria-hidden="true" className="text-xl text-secondary group-open:rotate-45">+</span>
              </summary>
              <p className="whitespace-pre-line pt-3 text-sm leading-6 text-ink-muted [&_a]:font-semibold [&_a]:text-secondary [&_a]:underline">
                {answer}
              </p>
              {linkUrl && linkLabel && (
                <Link to={linkUrl} className="mt-2 inline-block text-sm font-semibold text-secondary underline">{linkLabel}</Link>
              )}
            </details>
          ))}
        </div>
        <div className="mt-8 rounded-xl bg-mint p-6">
          <h2 className="font-serif text-xl font-semibold text-forest">Vous ne trouvez pas votre réponse ?</h2>
          <p className="mt-2 text-sm text-ink-muted">Notre équipe reste à votre disposition.</p>
          <Link to="/contact" className="mt-4 inline-block font-semibold text-secondary hover:underline">
            Contacter la librairie →
          </Link>
        </div>
      </section>
    </div>
  );
}
