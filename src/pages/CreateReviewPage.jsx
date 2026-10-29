import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as profileApi from "../api/profile.js";
import { useAuth } from "../auth/AuthContext.jsx";
import Icon from "../components/ui/Icon.jsx";
import { MEDIA_CATEGORIES } from "../data/mockData.js";
import styles from "./CreateReviewPage.module.css";

/**
 * CreateReviewPage is the first step of creating a finis: the user picks which
 * media type they want to register, limited to the categories they enabled on
 * their profile (mediaPreferences). Picking one navigates to the search screen.
 */
function CreateReviewPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [mediaPreferences, setMediaPreferences] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      try {
        const profile = await profileApi.getMyProfile(token);
        if (isMounted) {
          setMediaPreferences(
            Array.isArray(profile.mediaPreferences)
              ? profile.mediaPreferences
              : [],
          );
        }
      } catch {
        if (isMounted) {
          setMediaPreferences([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreferences(false);
        }
      }
    }

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const categories = useMemo(() => {
    if (!Array.isArray(mediaPreferences) || mediaPreferences.length === 0) {
      return MEDIA_CATEGORIES;
    }
    return MEDIA_CATEGORIES.filter((item) =>
      mediaPreferences.includes(item.id),
    );
  }, [mediaPreferences]);

  if (isLoadingPreferences) {
    return (
      <div className={styles.page}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Novo Finis</h1>
        <p>Que tipo de obra você finalizou?</p>
      </header>

      <div className={styles.grid}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={styles.typeCard}
            onClick={() => navigate(`/criar-review/${category.id}`)}
          >
            <span className={styles.typeIcon} style={{ color: category.color }}>
              <Icon name={category.icon} size={28} />
            </span>
            <span className={styles.typeLabel}>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CreateReviewPage;
