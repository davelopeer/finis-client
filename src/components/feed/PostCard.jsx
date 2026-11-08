import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";
import CategoryTag from "../ui/CategoryTag.jsx";
import Icon from "../ui/Icon.jsx";
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
  const author = post.author ?? {};

  const authorContent = (
    <>
      <Avatar src={author.avatarUrl} alt={author.name} size="sm" />
      <div className={styles.authorMeta}>
        <span className={styles.authorName}>{author.name}</span>
        {author.nickname ? (
          <span className={styles.authorNick}>{author.nickname}</span>
        ) : null}
      </div>
    </>
  );

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <header className={styles.header}>
          {author.username ? (
            <Link to={`/user/${author.username}`} className={styles.authorLink}>
              {authorContent}
            </Link>
          ) : (
            <div className={styles.authorLink}>{authorContent}</div>
          )}
          <span className={styles.date}>{post.postedAt}</span>
        </header>

        <div className={styles.titleRow}>
          <CategoryTag categoryId={post.category} />
          {canManage && post.isPrivate ? (
            <span className={styles.privateBadge}>Privado</span>
          ) : null}
          <RecommendationBadge
            rating={post.rating}
            masterpiece={post.isMasterpiece}
          />
        </div>

        <h3 className={styles.title}>{post.title}</h3>
        {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}

        <DescriptionPreview text={post.description} title={post.title} />

        <footer className={styles.actions}>
          <button
            className={styles.actionButton}
            type="button"
            disabled
            aria-label="Comentar (em breve)"
            title="Comentários em breve"
          >
            <Icon name="comment" size={16} />
            Comentar
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
          ) : null}
        </footer>
      </div>
    </article>
  );
}

export default PostCard;
