import "./index.css";
import active from "../../assets/icons/common/rating-star-active.svg";
import inactive from "../../assets/icons/common/rating-star-inactive.svg";

const AverageRating = ({ avgRating = 0, totalReviews = 0 }) => {
  const normalizedRating = Math.max(0, Math.min(Number(avgRating) || 0, 5));
  const fullStars = Math.round(normalizedRating);

  const handleReviewsClick = (event) => {
    event.preventDefault();
    const reviewsSection = document.getElementById("reviews-section");
    reviewsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rating">
      <a
        className="reviews"
        href="#reviews-section"
        onClick={handleReviewsClick}
      >
        <span className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <img
              key={star}
              src={star <= fullStars ? active : inactive}
              alt="avis"
            />
          ))}
        </span>
        <span className="reviews-count">{Number(totalReviews) || 0} avis</span>
      </a>
    </div>
  );
};

export default AverageRating;
