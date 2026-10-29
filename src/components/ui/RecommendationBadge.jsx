import StarRating from "./StarRating.jsx";
import styles from "./RecommendationBadge.module.css";

function RecommendationBadge({ rating, masterpiece = false }) {
  if (!rating || rating <= 0) return null;

  return (
    <span
      className={styles.badge}
      aria-label={
        masterpiece ? "Obra prima, 5 de 5 estrelas" : `${rating} de 5 estrelas`
      }
    >
      <StarRating value={rating} readOnly size="sm" masterpiece={masterpiece} />
    </span>
  );
}

export default RecommendationBadge;
