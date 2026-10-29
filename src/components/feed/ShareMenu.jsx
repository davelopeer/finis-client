import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { downloadStoryImage } from "../../utils/storyCard.js";
import styles from "./ShareMenu.module.css";

function ShareMenu({ post, buttonClassName }) {
  const menuId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const busyRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const closeMenu = () => {
      setOpen(false);
      setStatus("");
    };

    const handlePointerDown = (event) => {
      if (
        rootRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const width = 220;
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - width - 8,
      );
      const estimatedHeight = status ? 96 : 56;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openBelow =
        spaceBelow >= estimatedHeight + 12 || spaceBelow >= spaceAbove;
      setCoords(
        openBelow
          ? { top: rect.bottom + 8, left, width }
          : { top: rect.top - 8, left, width, transform: "translateY(-100%)" },
      );
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, status, busy]);

  useEffect(() => {
    if (open) {
      menuRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const handleSave = () => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setStatus("");

    downloadStoryImage(post)
      .then(() => {
        setStatus("Imagem salva neste computador.");
      })
      .catch(() => {
        setStatus("Não foi possível salvar a imagem. Tente de novo.");
      })
      .finally(() => {
        busyRef.current = false;
        setBusy(false);
      });
  };

  return (
    <div className={styles.share} ref={rootRef}>
      <button
        ref={buttonRef}
        className={buttonClassName}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() =>
          setOpen((current) => {
            if (current) {
              setStatus("");
            }
            return !current;
          })
        }
      >
        Compartilhar
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className={styles.menu}
              style={coords ?? { visibility: "hidden" }}
              role="menu"
              aria-label="Salvar imagem do finis"
              tabIndex={-1}
            >
              <button
                className={styles.menuItem}
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={handleSave}
              >
                <DownloadIcon />
                Salvar
              </button>
              {status ? (
                <p className={styles.status} aria-live="polite">
                  {status}
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

export default ShareMenu;
