import Seo from "../Seo";

export default function LegalPage({ title, children }) {
  return (
    <div className="mx-auto max-w-4xl px-gutter py-12">
      <Seo title={title} noIndex />
      <h1 className="mb-6 font-serif text-3xl font-semibold text-forest sm:text-4xl">{title}</h1>
      <p role="note" className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-ink">
        Document provisoire : les informations indiquées « à compléter » et les conditions applicables doivent être vérifiées et validées avant la mise en ligne.
      </p>
      <div className="prose max-w-none text-ink">{children}</div>
    </div>
  );
}
