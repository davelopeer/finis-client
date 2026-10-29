import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import * as reviewsApi from "../api/reviews.js";
import { useAuth } from "../auth/AuthContext.jsx";
import WorkSearchStep from "../components/review/WorkSearchStep.jsx";
import ReviewForm from "../components/review/ReviewForm.jsx";
import { MEDIA_CATEGORIES } from "../data/mockData.js";
import styles from "./CreateReviewPage.module.css";

/**
 * RegisterFinisPage handles the two steps that follow choosing a media type:
 * searching the catalog (WorkSearchStep) and, once a work is picked, filling in
 * the finis details (ReviewForm). "Não achou" routes to the request page.
 */
function RegisterFinisPage() {
  const navigate = useNavigate();
  const { mediaType } = useParams();
  const { token } = useAuth();
  const [selectedWork, setSelectedWork] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const category = MEDIA_CATEGORIES.find((item) => item.id === mediaType);
  if (!category) {
    return <Navigate to="/criar-review" replace />;
  }

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await reviewsApi.createReview(token, payload);
      navigate("/profile");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestNew = (query) => {
    navigate("/criar-review/solicitar", {
      state: { mediaType, title: query },
    });
  };

  return (
    <div className={styles.page}>
      {selectedWork ? (
        <ReviewForm
          work={selectedWork}
          onSubmit={handleSubmit}
          onCancel={() => setSelectedWork(null)}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      ) : (
        <WorkSearchStep
          mediaType={mediaType}
          categoryLabel={category.label}
          onSelect={setSelectedWork}
          onRequestNew={handleRequestNew}
        />
      )}
    </div>
  );
}

export default RegisterFinisPage;
