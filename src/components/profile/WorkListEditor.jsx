import { useState } from "react";
import { MEDIA_CATEGORIES } from "../../data/mockData.js";
import Icon from "../ui/Icon.jsx";
import WorkSearchStep from "../review/WorkSearchStep.jsx";
import styles from "./WorkListEditor.module.css";

const MAX_ITEMS = 5;

const categoryById = Object.fromEntries(
  MEDIA_CATEGORIES.map((category) => [category.id, category]),
);

function formatMeta(item) {
  const parts = [];
  if (item.author) parts.push(item.author);
  if (item.year) parts.push(String(item.year));
  return parts.join(", ");
}

/**
 * WorkListEditor renders an ordered list of up to five works (a profile's Top 5
 * or Próximas obras). When `editable`, it shows the filled slots with a remove
 * button plus a single "add next" slot — the slot for position N only appears
 * once position N-1 is filled. Picking a work opens a media → search flow.
 *
 * It is controlled: `items` comes from the loaded profile and `onChange` is given
 * the new ordered list of { workId, mediaType } refs to persist. Read-only mode
 * (other people's profiles) just lists the works.
 */
function WorkListEditor({
  items = [],
  editable = false,
  emptyLabel = "Nenhuma obra por aqui ainda.",
  mediaType,
  mediaLabel,
  onChange,
}) {
  const [isPicking, setIsPicking] = useState(false);
  const [pickMedia, setPickMedia] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toRefs = (list) =>
    list.map((item) => ({ workId: item.workId, mediaType: item.mediaType }));

  const closePicker = () => {
    setIsPicking(false);
    setPickMedia(null);
  };

  async function persist(nextItems) {
    if (!onChange) return;
    setIsSaving(true);
    setErrorMessage("");
    try {
      await onChange(toRefs(nextItems));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelect(work) {
    closePicker();
    await persist([
      ...items,
      {
        workId: work.id,
        mediaType: work.mediaType,
      },
    ]);
  }

  async function handleRemove(position) {
    await persist(items.filter((item) => item.position !== position));
  }

  if (!editable) {
    if (items.length === 0) {
      return (
        <section className={styles.emptyState}>
          <h3>{emptyLabel}</h3>
        </section>
      );
    }
    return (
      <ol className={styles.list}>
        {items.map((item) => (
          <WorkRow key={item.position} item={item} />
        ))}
      </ol>
    );
  }

  return (
    <div className={styles.editor}>
      <ol className={styles.list}>
        {items.map((item) => (
          <WorkRow
            key={item.position}
            item={item}
            onRemove={() => handleRemove(item.position)}
            disabled={isSaving}
          />
        ))}

        {items.length < MAX_ITEMS && (
          <li className={styles.addSlot}>
            <button
              type="button"
              className={styles.addButton}
              onClick={() => setIsPicking(true)}
              disabled={isSaving}
            >
              <span className={styles.position}>{items.length + 1}</span>
              <span className={styles.addLabel}>
                {isSaving
                  ? "Salvando..."
                  : `Adicionar obra #${items.length + 1}`}
              </span>
              <Icon name="plus" size={18} />
            </button>
          </li>
        )}
      </ol>

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}

      {isPicking && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={closePicker}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={closePicker}
              aria-label="Fechar"
            >
              ×
            </button>

            {mediaType ? (
              <WorkSearchStep
                mediaType={mediaType}
                categoryLabel={mediaLabel}
                onSelect={handleSelect}
              />
            ) : !pickMedia ? (
              <div className={styles.mediaStep}>
                <header className={styles.mediaHeader}>
                  <h2>Escolha o tipo de obra</h2>
                  <p>Qual mídia você quer adicionar à lista?</p>
                </header>
                <div className={styles.mediaGrid}>
                  {MEDIA_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={styles.mediaCard}
                      onClick={() => setPickMedia(category)}
                    >
                      <span
                        className={styles.mediaIcon}
                        style={{ color: category.color }}
                      >
                        <Icon name={category.icon} size={26} />
                      </span>
                      <span className={styles.mediaLabel}>
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <WorkSearchStep
                mediaType={pickMedia.id}
                categoryLabel={pickMedia.label}
                onSelect={handleSelect}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkRow({ item, onRemove, disabled }) {
  const category = categoryById[item.mediaType];
  const meta = formatMeta(item);
  return (
    <li className={styles.row}>
      <span className={styles.position}>{item.position}</span>
      {category && (
        <span className={styles.rowIcon} style={{ color: category.color }}>
          <Icon name={category.icon} size={18} />
        </span>
      )}
      <span className={styles.rowBody}>
        <span className={styles.rowTitle}>{item.title}</span>
        {meta && <span className={styles.rowMeta}>{meta}</span>}
      </span>
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remover ${item.title}`}
        >
          <Icon name="trash" size={16} />
        </button>
      )}
    </li>
  );
}

export default WorkListEditor;
