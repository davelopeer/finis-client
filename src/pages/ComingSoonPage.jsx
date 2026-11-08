import styles from "./ComingSoonPage.module.css";

function ComingSoonPage({ title, description }) {
  return (
    <section className={styles.page} aria-live="polite">
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.badge}>Em breve</p>
      <p className={styles.description}>
        {description ?? "Estamos construindo esta parte do Finis."}
      </p>
    </section>
  );
}

export default ComingSoonPage;
