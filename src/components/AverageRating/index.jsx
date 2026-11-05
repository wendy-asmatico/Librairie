import active from "./review-active.svg";
import inactive from "./review-inactive.svg";

const AverageRating = ({ avgRating = 0, totalReviews = 0 }) => {
  const normalizedRating = Math.max(0, Math.min(Number(avgRating) || 0, 5));
  const fullStars = Math.round(normalizedRating);
  const reviewsCount = Number(totalReviews) || 0;

  const handleReviewsClick = (event) => {
    event.preventDefault();
    const reviewsSection = document.getElementById("reviews-section");
    reviewsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="inline-flex items-center">
      <a
        className="group inline-flex items-center gap-2 transition-opacity hover:opacity-85"
        href="#reviews-section"
        onClick={handleReviewsClick}
      >
        {/* Conteneur d'étoiles */}
        <span className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <img
              key={star}
              src={star <= fullStars ? active : inactive}
              alt="étoile d'avis"
              className="h-3.5 w-3.5 object-contain md:h-4 md:w-4"
            />
          ))}
        </span>

        {/* Note moyenne et nombre d'avis */}
        <span className="text-2xs font-medium text-ink-muted group-hover:underline">
          {normalizedRating > 0 && (
            <span className="font-semibold text-ink mr-1">
              {normalizedRating.toFixed(1)}
            </span>
          )}
          ({reviewsCount} avis)
        </span>
      </a>
    </div>
  );
};

export default AverageRating;