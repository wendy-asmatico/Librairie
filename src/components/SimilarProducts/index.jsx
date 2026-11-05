import { useEffect, useState } from "react";
import CatalogueCard from "../CatalogueCard";
import Loader from "../Loader";

const RECOMMENDED_COUNT = 4; // Ajusté pour un rendu optimal sur grille 4 colonnes desktop

export default function SimilarProducts({
  currentProduct,
  reduxProducts = [],
}) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (!currentProduct?.id) return;

    const fetchSimilarProducts = async () => {
      setLoadingSimilar(true);
      try {
        const baseUrl = `${import.meta.env.VITE_API_URL}/wp-json/wc/store/v1/products`;
        const categoryId = currentProduct.categories?.[0]?.id;
        let recommendations = [];

        // NIVEAU 1 : Produits de la même catégorie
        if (categoryId) {
          const response = await fetch(`${baseUrl}?category=${categoryId}&per_page=10`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const data = await response.json();
            recommendations = (Array.isArray(data) ? data : []).filter(
              (p) => p.id.toString() !== currentProduct.id.toString(),
            );
          }
        }

        // NIVEAU 2 : Complément depuis le store Redux si nécessaire
        if (
          recommendations.length < RECOMMENDED_COUNT &&
          reduxProducts.length > 0
        ) {
          const reduxExtras = reduxProducts.filter(
            (p) =>
              p.id.toString() !== currentProduct.id.toString() &&
              !recommendations.some(
                (rec) => rec.id.toString() === p.id.toString(),
              ),
          );
          recommendations = [...recommendations, ...reduxExtras];
        }

        // NIVEAU 3 : Secours via appel API global
        if (recommendations.length < RECOMMENDED_COUNT) {
          const fallbackResponse = await fetch(`${baseUrl}?per_page=10`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const apiExtras = (
              Array.isArray(fallbackData) ? fallbackData : []
            ).filter(
              (p) =>
                p.id.toString() !== currentProduct.id.toString() &&
                !recommendations.some(
                  (rec) => rec.id.toString() === p.id.toString(),
                ),
            );
            recommendations = [...recommendations, ...apiExtras];
          }
        }

        // Mélange aléatoire + sélection des premiers produits
        const randomized = recommendations.sort(() => 0.5 - Math.random());
        setSimilarProducts(randomized.slice(0, RECOMMENDED_COUNT));
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des produits similaires :",
          error.message,
        );
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarProducts();
  }, [currentProduct?.id, reduxProducts]);

  return (
    <section className="max-w-7xl mx-auto px-gutter pt-2">
      <h2 className="text-title font-serif font-medium text-ink mb-6">
        Produits similaires
      </h2>

      {loadingSimilar ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : similarProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {similarProducts.map((simProduct) => (
            <CatalogueCard key={simProduct.id} product={simProduct} compact />
          ))}
        </div>
      ) : (
        <p className="text-caption text-ink-muted italic py-4">
          Aucun produit similaire trouvé.
        </p>
      )}
    </section>
  );
}