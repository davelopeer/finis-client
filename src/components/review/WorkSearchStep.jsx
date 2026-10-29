import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icon.jsx";
import * as worksApi from "../../api/works.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import styles from "./WorkSearchStep.module.css";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

/**
 * WorkSearchStep is the "busca a obra" screen: a debounced full-text search
 * against a single media type's catalog. It lists up to 15 results and always
 * offers a "não achou sua obra" escape hatch at the bottom.
 */
function WorkSearchStep({ mediaType, categoryLabel, onSelect, onRequestNew }) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    const requestId = ++requestIdRef.current;
    const timeoutId = setTimeout(async () => {
      try {
        const response = await worksApi.searchWorks(token, mediaType, trimmed);
        if (requestIdRef.current === requestId) {
          setResults(Array.isArray(response.items) ? response.items : []);
          setErrorMessage("");
          setHasSearched(true);
        }
      } catch (error) {
        if (requestIdRef.current === requestId) {
          setErrorMessage(error.message);
          setResults([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, mediaType, token]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Buscar {categoryLabel?.toLowerCase() ?? "obra"}</h1>
        <p>Encontre a obra pelo nome para registrar seu Finis.</p>
      </header>

      <div className={styles.searchInput}>
        <Icon name="search" size={18} />
        <input
          type="text"
          autoFocus
          placeholder="Digite o nome da obra..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}

      <div className={styles.results}>
        {isSearching && <p className={styles.hint}>Buscando...</p>}

        {!isSearching &&
          results.map((work) => (
            <button
              key={work.id}
              type="button"
              className={styles.resultItem}
              onClick={() => onSelect({ ...work, mediaType })}
            >
              <span className={styles.resultTitle}>
                {work.title}
                {work.year ? ` (${work.year})` : ""}
              </span>
              {work.subtitle && (
                <span className={styles.resultSubtitle}>{work.subtitle}</span>
              )}
            </button>
          ))}

        {!isSearching && hasSearched && results.length === 0 && (
          <p className={styles.hint}>Nenhuma obra encontrada.</p>
        )}

        {query.trim().length >= MIN_QUERY_LENGTH && (
          <button
            type="button"
            className={styles.requestNew}
            onClick={() => onRequestNew(query.trim())}
          >
            Não achou sua obra? Clique aqui para cadastrar
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkSearchStep;
