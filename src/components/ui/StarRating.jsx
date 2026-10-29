import { useState } from "react";
import styles from "./StarRating.module.css";

/**
 * StarRating renders 1–5 stars plus an optional "obra prima" (masterpiece) 6th
 * star that reads as máxima especial.
 *
 * - readOnly: display only (feed/profile). Supports half stars for legacy data
 *   and shows the masterpiece star when `masterpiece` is set.
 * - interactive (default): integer clicks only. When `allowMasterpiece` is set,
 *   a 6th star appears to the right; hovering it previews a blue-grey star with
 *   the "(obra prima)" label, and clicking it marks the finis as a masterpiece
 *   (which always means 5 stars).
 */
function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  allowMasterpiece = false,
  masterpiece = false,
  onMasterpieceChange,
}) {
  const [hovered, setHovered] = useState(null);
  const [masterpieceHovered, setMasterpieceHovered] = useState(false);

  const displayed = hovered ?? value;
  const showMasterpiece = masterpiece || masterpieceHovered;

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHovered(null);
      setMasterpieceHovered(false);
    }
  };

  const handleStarClick = (star) => {
    if (readOnly) return;
    // Choosing a regular star clears masterpiece; toggling the same star resets.
    onMasterpieceChange?.(false);
    onChange?.(value === star && !masterpiece ? 0 : star);
  };

  const handleMasterpieceClick = () => {
    if (readOnly) return;
    const next = !masterpiece;
    onMasterpieceChange?.(next);
    // Obra-prima always implies the maximum 5 stars.
    onChange?.(next ? 5 : value);
  };

  return (
    <div
      className={`${styles.stars} ${styles[`size-${size}`]}`}
      onMouseLeave={handleMouseLeave}
      role={readOnly ? undefined : "group"}
      aria-label={readOnly ? `${value} de 5 estrelas` : "Nota"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active =
          masterpiece || showMasterpiece ? true : displayed >= star;
        const fill = active
          ? "full"
          : displayed >= star - 0.5
            ? "half"
            : "empty";
        return (
          <span key={star} className={styles.slot}>
            {!readOnly && (
              <span
                className={styles.fullZone}
                onMouseEnter={() => {
                  setHovered(star);
                  setMasterpieceHovered(false);
                }}
                onClick={() => handleStarClick(star)}
                aria-label={`${star} estrelas`}
                role="button"
                tabIndex={0}
                onKeyDown={(event) =>
                  event.key === "Enter" && handleStarClick(star)
                }
              />
            )}
            <span
              className={`${styles.star} ${styles[fill]}`}
              aria-hidden="true"
            >
              ★
            </span>
          </span>
        );
      })}

      {(allowMasterpiece || masterpiece) && (
        <>
          <span className={`${styles.slot} ${styles.masterpieceSlot}`}>
            {!readOnly && (
              <span
                className={styles.fullZone}
                onMouseEnter={() => setMasterpieceHovered(true)}
                onClick={handleMasterpieceClick}
                aria-label="Obra prima"
                aria-pressed={masterpiece}
                role="button"
                tabIndex={0}
                onKeyDown={(event) =>
                  event.key === "Enter" && handleMasterpieceClick()
                }
              />
            )}
            <span
              className={`${styles.star} ${styles.masterpieceStar} ${
                showMasterpiece ? styles.masterpieceActive : styles.empty
              }`}
              aria-hidden="true"
            >
              ★
            </span>
          </span>
          {showMasterpiece && (
            <span className={styles.masterpieceLabel}>(obra prima)</span>
          )}
        </>
      )}
    </div>
  );
}

export default StarRating;
