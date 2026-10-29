import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as worksApi from "../api/works.js";
import { useAuth } from "../auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import { MEDIA_CATEGORIES } from "../data/mockData.js";
import styles from "./RequestWorkPage.module.css";

/**
 * RequestWorkPage lets a user report a work missing from the catalog. It stores
 * the request (a future job will enrich it) and tells the user to try again in
 * a few hours.
 */
function RequestWorkPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const initialState = location.state ?? {};
  const [title, setTitle] = useState(initialState.title ?? "");
  const [mediaType, setMediaType] = useState(
    initialState.mediaType ?? MEDIA_CATEGORIES[0].id,
  );
  const [year, setYear] = useState(
    initialState.year ? String(initialState.year) : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const parsedYear = year.trim() ? Number(year.trim()) : undefined;
      await worksApi.requestWork(token, {
        mediaType,
        title: title.trim(),
        year: parsedYear,
      });
      setIsDone(true);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1>Recebemos sua solicitação</h1>
          <p>
            Vamos procurar os dados de <strong>{title.trim()}</strong> para
            adicionar ao nosso catálogo. Tente cadastrar seu Finis novamente em
            algumas horas.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" onClick={() => navigate("/criar-review")}>
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1>Cadastrar nova obra</h1>
          <p>
            Não encontramos essa obra no nosso sistema. Informe o nome correto e
            o tipo de mídia — vamos verificar se ela existe e adicioná-la.
          </p>
        </header>

        <div className={styles.field}>
          <label htmlFor="request-title">Nome correto da obra</label>
          <input
            id="request-title"
            className={styles.input}
            type="text"
            placeholder="Ex: Duna"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="request-year">Ano (opcional)</label>
          <input
            id="request-year"
            className={styles.input}
            type="number"
            inputMode="numeric"
            min="1"
            max="2100"
            placeholder="Ex: 1965"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="request-media-type">Tipo de mídia</label>
          <select
            id="request-media-type"
            className={styles.input}
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value)}
          >
            {MEDIA_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RequestWorkPage;
