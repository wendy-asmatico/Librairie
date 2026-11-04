import { useEffect, useState } from "react";
import Seo from "../../components/Seo";
import Loader from "../../components/Loader";

export default function AcfExample() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadContent() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wp-json/custom/v1/acf-demo`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(
            result?.message || "Impossible de charger le contenu ACF.",
          );
        }

        setContent(await response.json());
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadContent();
    return () => controller.abort();
  }, []);

  if (loading) return <Loader size="lg" />;

  if (error) {
    return (
      <section className="bg-ivory px-4 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-forest-deep">
            Exemple ACF
          </h1>
          <p role="alert" className="mt-4 text-[#444841]">
            {error}
          </p>
          <p className="mt-3 text-sm text-muted">
            Consultez le guide dans wordpress/EXEMPLE-ACF.md pour configurer
            la page et ses champs dans WordPress.
          </p>
        </div>
      </section>
    );
  }

  return (
    <main className="bg-ivory px-4 py-10 lg:px-12 lg:py-16">
      <Seo
        title={content.title || "Exemple ACF"}
        description={content.text || "Une page pilotée par les champs ACF."}
        image={content.image}
      />
      <section className="mx-auto grid max-w-[1184px] overflow-hidden rounded-3xl bg-white shadow-sm lg:grid-cols-2">
        <div className="flex flex-col items-start justify-center p-8 lg:p-14">
          <p className="text-xs font-bold tracking-[0.16em] text-gold uppercase">
            Contenu géré dans WordPress
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight font-bold text-forest-deep lg:text-5xl">
            {content.title || "Votre titre ACF apparaîtra ici"}
          </h1>
          {content.text && (
            <p className="mt-5 whitespace-pre-line text-base leading-7 text-[#444841]">
              {content.text}
            </p>
          )}
          {content.button_text && content.button_url && (
            <a
              href={content.button_url}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-control bg-secondary px-6 text-sm font-bold text-white transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {content.button_text}
            </a>
          )}
        </div>

        {content.image ? (
          <img
            src={content.image}
            alt=""
            className="h-72 w-full object-cover lg:h-full lg:min-h-[480px]"
          />
        ) : (
          <div className="flex min-h-72 items-center justify-center bg-leaf-soft p-8 text-center font-serif text-2xl text-forest-deep lg:min-h-[480px]">
            L’image ACF apparaîtra ici
          </div>
        )}
      </section>
    </main>
  );
}