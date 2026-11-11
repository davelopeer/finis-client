import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar.jsx";
import CategoryTag from "../ui/CategoryTag.jsx";
import Icon from "../ui/Icon.jsx";
import RecommendationBadge from "../ui/RecommendationBadge.jsx";
import styles from "./PostCard.module.css";

function DescriptionPreview({ text, spoiler, title }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const textRef = useRef(null);
  const hasSpoiler = Boolean(spoiler);

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
      // Re-blur the spoiler every time the full view is reopened.
      setSpoilerRevealed(false);
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

  if (!text && !hasSpoiler) {
    return null;
  }

  // A spoiler-only finis still needs an entry point into the full view.
  const canOpenModal = Boolean(text)
    ? isOverflowing || text.length > 220
    : true;
  const showReadMore = canOpenModal || hasSpoiler;

  return (
    <div className={styles.descriptionBlock}>
      {text ? (
        <p ref={textRef} className={styles.description}>
          {text}
        </p>
      ) : null}
      {showReadMore ? (
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
                {text ? <p className={styles.modalText}>{text}</p> : null}
                {hasSpoiler ? (
                  <section className={styles.spoilerSection}>
                    <h3 className={styles.spoilerHeading}>Spoilers</h3>
                    <div className={styles.spoilerBody}>
                      <p
                        className={`${styles.spoilerText} ${
                          spoilerRevealed ? styles.spoilerTextRevealed : ""
                        }`}
                        aria-hidden={!spoilerRevealed}
                      >
                        {spoiler}
                      </p>
                      {!spoilerRevealed ? (
                        <button
                          type="button"
                          className={styles.spoilerReveal}
                          onClick={() => setSpoilerRevealed(true)}
                        >
                          <Icon name="eye" size={16} />
                          ver spoilers
                        </button>
                      ) : null}
                    </div>
                  </section>
                ) : null}
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

        <DescriptionPreview
          text={post.description}
          spoiler={post.spoilerDescription}
          title={post.title}
        />

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
