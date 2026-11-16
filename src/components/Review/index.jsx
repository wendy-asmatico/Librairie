import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import active from "./review-active.svg";
import inactive from "./review-inactive.svg";

const Review = ({ productId }) => {
  const userState = useSelector((state) => state.user || {});

  const user = userState.profile || userState.customer || null;
  const token = userState.token || localStorage.getItem("wc_user_token");
  const userOrders = useSelector((state) => state.user?.orders ?? []);

  // États pour les avis
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la pagination
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // États pour l'achat et le formulaire
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  // --- Chargement des avis ---
  const fetchReviews = () => {
    if (!productId) return;
    setLoading(true);

    fetch(
      `${baseUrl}/wp-json/wc/store/v1/products/reviews?product_id=${productId}&per_page=5&page=${currentPage}`,
    )
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");

        const totalPagesHeader = response.headers.get("X-WP-TotalPages");
        if (totalPagesHeader) {
          setTotalPages(parseInt(totalPagesHeader, 10));
        }

        return response.json();
      })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [productId]);

  // Helper pour vérifier si une liste d'articles contient le produit
  const containsProduct = (lineItems, targetId) => {
    if (!Array.isArray(lineItems)) return false;

    const target = targetId?.toString();

    return lineItems.some((item) => {
      if (!item || typeof item !== "object") return false;

      const candidates = [
        item.product_id,
        item.variation_id,
        item.product,
        item.id,
        item.name,
      ]
        .filter(Boolean)
        .map((value) => value?.toString());

      return candidates.some(
        (value) => value === target || value?.includes(target),
      );
    });
  };

  // --- Vérification de l'achat du produit ---
  useEffect(() => {
    if (!user || !productId) {
      setHasPurchased(false);
      return;
    }

    const checkPurchase = async () => {
      setCheckingPurchase(true);
      try {
        if (Array.isArray(userOrders) && userOrders.length > 0) {
          const purchased = userOrders.some((order) => {
            const status = order?.status?.toLowerCase?.() || "";
            const isCompleted = ["completed", "processing", "shipped", "paid"].includes(
              status,
            );
            const hasProduct = [
              order?.line_items,
              order?.items,
              order?.products,
            ].some((items) => containsProduct(items, productId));

            return isCompleted && hasProduct;
          });

          if (purchased) {
            setHasPurchased(true);
            setCheckingPurchase(false);
            return;
          }
        }

        const response = await fetch(
          `${baseUrl}/wp-json/wc/v3/orders?customer=${user?.id}&status=completed`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const orders = await response.json();
          const purchased = orders.some((order) => {
            const status = order?.status?.toLowerCase?.() || "";
            const isCompleted = ["completed", "processing", "shipped", "paid"].includes(
              status,
            );
            const hasProduct = [
              order?.line_items,
              order?.items,
              order?.products,
            ].some((items) => containsProduct(items, productId));

            return isCompleted && hasProduct;
          });
          setHasPurchased(purchased);
        } else {
          console.error(
            `❌ [Review] Erreur API Orders (${response.status}) :`,
            await response.text(),
          );
          setHasPurchased(false);
        }
      } catch (err) {
        console.error(
          "❌ [Review] Erreur lors de la vérification de l'achat :",
          err,
        );
        setHasPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchase();
  }, [user, productId, userOrders, token, baseUrl]);

  // --- Soumission d'un avis ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !rating) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(
        `${baseUrl}/wp-json/wc/v3/products/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            review: comment,
            reviewer: user?.username,
            reviewer_email: user?.email,
            rating: rating,
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erreur lors de l'envoi de l'avis");
      }

      setSubmitSuccess(true);
      setComment("");
      setRating(0);
      fetchReviews();
    } catch (err) {
      setSubmitError(err.message || "Erreur lors de la publication.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (starRating = 0) => {
    const normalizedRating = Math.max(0, Math.min(Number(starRating) || 0, 5));
    const fullStars = Math.round(normalizedRating);

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <img
            key={star}
            className="h-4 w-4 object-contain"
            src={star <= fullStars ? active : inactive}
            alt="étoile"
          />
        ))}
      </div>
    );
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginationRange = (current, total) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <section id="reviews-section" className="border-t border-b border-line font-sans max-w-7xl mx-auto px-gutter pt-5 mt-10 pb-10">
      <h2 className="text-title font-serif font-medium text-ink mb-6">
        Avis clients
      </h2>

      {/* --- BLOC NOUVEL AVIS / FORMULAIRE --- */}
      <div className="mb-8 rounded-card bg-mint-soft border border-line p-5">
        {!user ? (
          <p className="text-caption text-ink-muted flex items-center gap-2">
            <span>ℹ️</span> Connectez-vous pour ajouter un avis.
          </p>
        ) : checkingPurchase ? (
          <div className="flex items-center gap-3 py-2 text-caption text-ink-muted">
            <Loader size="sm" />
            <span>Vérification de vos achats...</span>
          </div>
        ) : hasPurchased ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <h3 className="text-md font-serif font-medium text-ink">
              Rédiger un avis
            </h3>

            {submitSuccess && (
              <p className="text-caption text-success font-medium bg-mint p-3 rounded-control border border-line">
                ✓ Merci ! Votre avis a été publié.
              </p>
            )}
            {submitError && (
              <p className="text-caption text-danger font-medium bg-sand p-3 rounded-control border border-line">
                {submitError}
              </p>
            )}

            <div className="space-y-1">
              <label className="block text-2xs font-semibold text-ink-soft uppercase tracking-wider">
                Votre note
              </label>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    aria-label={`Choisir ${star} étoiles`}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <img
                      className="h-5 w-5 object-contain"
                      src={star <= rating ? active : inactive}
                      alt={`${star} étoile(s)`}
                    />
                  </button>
                ))}
              </div>
              {!rating && (
                <p className="text-2xs text-ink-muted">
                  Choisissez une note de 1 à 5.
                </p>
              )}
            </div>

            <div>
              <textarea
                rows="3"
                className="w-full rounded-control border border-line bg-white p-3 text-caption text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="Votre avis sur ce produit..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !rating}
              className="bg-forest hover:bg-forest-deep disabled:bg-line disabled:text-muted text-white font-medium py-2.5 px-6 rounded-control text-caption shadow-raised transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? "Envoi..." : "Publier l'avis"}
            </button>
          </form>
        ) : (
          <p className="text-caption text-ink-muted flex items-center gap-2">
            <span>🔒</span> Seuls les clients ayant acheté cet article peuvent laisser un avis.
          </p>
        )}
      </div>

      {/* --- LISTE DES AVIS --- */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader size="md" />
        </div>
      )}

      {error && (
        <p className="text-caption text-danger bg-sand p-3 rounded-control border border-line mb-4">
          Erreur : {error}
        </p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-caption text-ink-muted italic py-4">
          Aucun avis trouvé pour ce produit.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id || review.review_id}
              className="rounded-card border border-line bg-white p-4 space-y-2 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-caption text-ink">
                    {review.reviewer ?? "Anonyme"}
                  </span>
                  <span className="text-2xs text-muted">
                    {review.date_created
                      ? new Date(review.date_created).toLocaleDateString("fr-FR")
                      : ""}
                  </span>
                </div>
                {renderStars(review.rating)}
              </div>

              <div
                className="prose prose-sm max-w-none text-caption text-ink-soft leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: review.review || "",
                }}
              />
            </article>
          ))}
        </div>
      )}

      {/* --- BARRE DE PAGINATION --- */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-2xs">
          {currentPage > 1 ? (
            <a
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              className="px-3 py-1.5 rounded-control border border-line bg-white text-ink hover:bg-mint-soft transition-colors"
            >
              Précédent
            </a>
          ) : (
            <span className="px-3 py-1.5 rounded-control border border-line bg-sand text-muted cursor-not-allowed">
              Précédent
            </span>
          )}

          {getPaginationRange(currentPage, totalPages).map((page, index) => {
            if (page === "...") {
              return (
                <span key={`dots-${index}`} className="px-2 text-muted">
                  ...
                </span>
              );
            }

            return (
              <a
                key={page}
                href="#reviews-section"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                className={`px-3 py-1.5 rounded-control font-medium transition-colors ${
                  currentPage === page
                    ? "bg-forest text-white"
                    : "border border-line bg-white text-ink hover:bg-mint-soft"
                }`}
              >
                {page}
              </a>
            );
          })}

          {currentPage < totalPages ? (
            <a
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              className="px-3 py-1.5 rounded-control border border-line bg-white text-ink hover:bg-mint-soft transition-colors"
            >
              Suivant
            </a>
          ) : (
            <span className="px-3 py-1.5 rounded-control border border-line bg-sand text-muted cursor-not-allowed">
              Suivant
            </span>
          )}
        </div>
      )}
    </section>
  );
};

export default Review;