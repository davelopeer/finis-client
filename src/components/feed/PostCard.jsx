import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CategoryTag from "../ui/CategoryTag.jsx";
import RecommendationBadge from "../ui/RecommendationBadge.jsx";
import styles from "./PostCard.module.css";

function DescriptionPreview({ text, title }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) {
      return undefined;
    }

    const checkOverflow = () => {
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  if (!text) {
    return null;
  }

  return (
    <div className={styles.descriptionBlock}>
      <p ref={textRef} className={styles.description}>
        {text}
      </p>
      {isOverflowing || text.length > 220 ? (
        <button
          type="button"
          className={styles.readMore}
          onClick={() => setIsModalOpen(true)}
        >
          ver mais...
        </button>
      ) : null}
      {isModalOpen
        ? createPortal(
            <div
              className={styles.modalOverlay}
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-description-title"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className={styles.modalContent}
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="review-description-title" className={styles.modalTitle}>
                  {title}
                </h2>
                <p className={styles.modalText}>{text}</p>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.modalClose}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function PostCard({ post, canManage = false, onEdit, onDelete }) {
  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <CategoryTag categoryId={post.category} />
            {canManage && post.isPrivate ? (
              <span className={styles.privateBadge}>Privado</span>
            ) : null}
          </div>
          <span className={styles.date}>{post.postedAt}</span>
        </div>

        <h3 className={styles.title}>{post.title}</h3>
        {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}

        <div className={styles.ratingRow}>
          <RecommendationBadge
            rating={post.rating}
            masterpiece={post.isMasterpiece}
          />
        </div>

        <DescriptionPreview text={post.description} title={post.title} />

        <footer className={styles.actions}>
          <button className={styles.actionButton} type="button">
            Compartilhar
          </button>
          {canManage ? (
            <>
              <button
                className={styles.actionButton}
                type="button"
                onClick={() => onEdit?.(post)}
              >
                Editar
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                type="button"
                onClick={() => onDelete?.(post)}
              >
                Deletar
              </button>
            </>
          ) : (
            <button className={styles.actionButton} type="button">
              Salvar
            </button>
          )}
        </footer>
      </div>
    </article>
  );
}

export default PostCard;
