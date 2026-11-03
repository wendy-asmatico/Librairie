import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import "./index.css";
import active from "../../assets/icons/common/rating-star-active.svg";
import inactive from "../../assets/icons/common/rating-star-inactive.svg";

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

        // WooCommerce renvoie le total des pages dans les headers
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
  // 1. Relance le fetch à chaque fois que le produit OU la page change
  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage]);

  // 2. Remet la page à 1 uniquement si on change de produit
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
            const isCompleted = ["completed", "processing", "paid"].includes(
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
            const isCompleted = ["completed", "processing", "paid"].includes(
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

  const renderStars = (rating = 0) => {
    const normalizedRating = Math.max(0, Math.min(Number(rating) || 0, 5));
    const fullStars = Math.round(normalizedRating);

    return [1, 2, 3, 4, 5].map((star) => (
      <img
        key={star}
        className="review-star-icon"
        src={star <= fullStars ? active : inactive}
        alt="avis"
      />
    ));
  };

  // --- Calculs pour la pagination ---

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const getPaginationRange = (current, total) => {
    const delta = 1; // Nombre de pages affichées autour de la page active
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
    <div id="reviews-section" className="review-list">
      <h2>Avis</h2>

      {/* --- BLOC NOUVEL AVIS --- */}
      <div className="add-review-section">
        {!user ? (
          <p className="review-info">ℹ️ Connectez-vous pour ajouter un avis.</p>
        ) : checkingPurchase ? (
          <p className="review-info">Vérification de vos achats...</p>
        ) : hasPurchased ? (
          <form onSubmit={handleSubmitReview} className="review-form">
            <h3>Rédiger un avis </h3>

            {submitSuccess && <p>Merci ! Votre avis a été publié.</p>}
            {submitError && <p>{submitError}</p>}

            <div>
              <div className="review-rating">
                <label>Note : </label>

                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    type="button"
                    className="review-star-button"
                    key={star}
                    onClick={() => setRating(star)}
                    aria-label={`Choisir ${star} étoiles`}
                    src={star <= rating ? active : inactive}
                    alt="avis"
                  />
                ))}
              </div>
              {!rating && (
                <p className="review-helper-text">
                  Choisissez une note de 1 à 5.
                </p>
              )}
            </div>

            <div>
              <textarea
                rows="3"
                className="review-textarea"
                placeholder="Votre avis sur ce produit..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Envoi..." : "Publier l'avis"}
            </button>
          </form>
        ) : (
          <p className="review-info">
            🔒 Seuls les clients ayant acheté cet article peuvent laisser un
            avis.
          </p>
        )}
      </div>

      {/* --- LISTE DES AVIS --- */}
      {/* {loading && <Loader size="lg" />} */}
      {error && <p className="review-error">Erreur : {error}</p>}
      {!loading && !error && reviews.length === 0 && <p>Aucun avis trouvé.</p>}
      <div className="reviews-block">
        {reviews.map((review) => (
          <article key={review.id || review.review_id} className="review-item">
            <div className="review-stars">{renderStars(review.rating)}</div>
            <div className="review-meta">
              <strong>
                {review.reviewer ?? "Anonyme"}
                {" - "}
              </strong>
              <span>
                {review.date_created
                  ? new Date(review.date_created).toLocaleDateString("fr-FR")
                  : ""}
              </span>
            </div>
            <div
              className="review-content"
              dangerouslySetInnerHTML={{
                __html: review.review || "",
              }}
            />
          </article>
        ))}
      </div>
      {/* --- BARRE DE PAGINATION --- */}
      {totalPages > 1 && (
        <div className="pagination">
          {currentPage > 1 ? (
            <a
              className="pageChange"
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            >
              Précédent
            </a>
          ) : (
            <a className="pageChange inactive">Précédent</a>
          )}

          {getPaginationRange(currentPage, totalPages).map((page, index) => {
            // Affichage des points de suspension
            if (page === "...") {
              return (
                <span key={`dots-${index}`} className="pagination-dots">
                  ...
                </span>
              );
            }

            // Affichage des numéros de page
            return (
              <a
                key={page}
                href="#reviews-section"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                className={currentPage === page ? "active" : ""}
              >
                {page}
              </a>
            );
          })}

          {currentPage < totalPages ? (
            <a
              className="pageChange"
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            >
              Suivant
            </a>
          ) : (
            <a className="pageChange inactive">Suivant</a>
          )}
        </div>
      )}
    </div>
  );
};

export default Review;
