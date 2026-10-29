import { useState } from "react";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import StarRating from "../ui/StarRating.jsx";
import CategoryTag from "../ui/CategoryTag.jsx";
import { todayISODate } from "../../utils/reviewPost.js";
import styles from "./ReviewForm.module.css";

export const MAX_REVIEW_DESCRIPTION_LENGTH = 1902;

/**
 * ReviewForm collects the finis details for a work that was already picked from
 * the catalog. The work itself (title/author/year) is fixed and shown read-only;
 * the user only edits the finish date, rating (+obra prima), description and
 * visibility.
 *
 * `work` is the selected catalog item: { id, title, subtitle, mediaType }. In
 * edit mode it is derived from the review's editValues.
 */
function ReviewForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage = "",
  mode = "create",
  work,
  initialValues = null,
}) {
  const isEdit = mode === "edit";

  const resolvedWork =
    work ??
    (initialValues
      ? {
          id: initialValues.workId,
          title: initialValues.mediaTitle,
          subtitle: [initialValues.mediaAuthor, initialValues.mediaYear]
            .filter(Boolean)
            .join(", "),
          mediaType: initialValues.mediaType || initialValues.category,
        }
      : null);

  const [rating, setRating] = useState(initialValues?.rating ?? 0);
  const [isMasterpiece, setIsMasterpiece] = useState(
    initialValues?.isMasterpiece ?? false,
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [finishedAt, setFinishedAt] = useState(
    initialValues?.finishedAt || todayISODate(),
  );
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate ?? false);

  const descriptionLength = [...description].length;
  const remainingCharacters = MAX_REVIEW_DESCRIPTION_LENGTH - descriptionLength;
  const canSubmit =
    Boolean(resolvedWork?.id) &&
    rating > 0 &&
    finishedAt &&
    remainingCharacters >= 0 &&
    !isSubmitting;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      workId: resolvedWork.id,
      mediaType: resolvedWork.mediaType,
      rating,
      isMasterpiece,
      description,
      finishedAt,
      isPrivate,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <header className={styles.header}>
        <h1>{isEdit ? "Editar Finis" : "Novo Finis"}</h1>
        <p>
          {isEdit
            ? "Atualize os detalhes do seu Finis."
            : "Registre uma obra que você finalizou."}
        </p>
      </header>

      {resolvedWork && (
        <div className={styles.workCard}>
          {resolvedWork.mediaType && (
            <CategoryTag categoryId={resolvedWork.mediaType} />
          )}
          <div className={styles.workText}>
            <span className={styles.workTitle}>{resolvedWork.title}</span>
            {resolvedWork.subtitle && (
              <span className={styles.workSubtitle}>
                {resolvedWork.subtitle}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="review-finished-at">Data de término</label>
        <input
          id="review-finished-at"
          className={styles.input}
          type="date"
          value={finishedAt}
          onChange={(event) => setFinishedAt(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Nota</label>
        <div className={styles.ratingRow}>
          <StarRating
            value={rating}
            onChange={setRating}
            size="lg"
            allowMasterpiece
            masterpiece={isMasterpiece}
            onMasterpieceChange={setIsMasterpiece}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="review-description">Descrição / opinião</label>
        <textarea
          id="review-description"
          className={styles.textarea}
          rows={6}
          maxLength={MAX_REVIEW_DESCRIPTION_LENGTH}
          placeholder="O que você achou desta obra?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div
          className={`${styles.counter} ${remainingCharacters < 0 ? styles.counterOver : ""}`}
        >
          {remainingCharacters} caracteres restantes
        </div>
      </div>

      <button
        type="button"
        className={styles.privacyToggle}
        onClick={() => setIsPrivate((prev) => !prev)}
        aria-pressed={isPrivate}
        aria-label={isPrivate ? "Finis privado" : "Finis público"}
      >
        <Icon name={isPrivate ? "eyeOff" : "eye"} size={18} />
        <span>{isPrivate ? "Privado" : "Público"}</span>
      </button>

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}

      <footer className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {isEdit ? "Cancelar" : "Voltar"}
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {isEdit
            ? isSubmitting
              ? "Salvando..."
              : "Salvar alterações"
            : isSubmitting
              ? "Publicando..."
              : "Finis"}
        </Button>
      </footer>
    </form>
  );
}

export default ReviewForm;
