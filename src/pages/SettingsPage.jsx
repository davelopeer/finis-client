import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Icon from "../components/ui/Icon.jsx";
import styles from "./SettingsPage.module.css";

const links = [
  { to: "/quem-somos", label: "Quem somos" },
  { to: "/contato", label: "Contato" },
  { to: "/faq", label: "FAQ" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Configurações</h1>
        <p>Sua conta e informações do Finis.</p>
      </header>

      <nav className={styles.list} aria-label="Configurações">
        <div
          className={`${styles.item} ${styles.itemDisabled}`}
          aria-disabled="true"
        >
          <span className={styles.itemLabel}>Conta</span>
          <span className={styles.badge}>em breve</span>
        </div>

        {links.map((item) => (
          <Link key={item.to} to={item.to} className={styles.item}>
            <span className={styles.itemLabel}>{item.label}</span>
            <Icon name="chevron" size={18} className={styles.chevron} />
          </Link>
        ))}
      </nav>

      <button type="button" className={styles.logout} onClick={handleLogout}>
        <Icon name="logout" size={18} />
        Sair
      </button>
    </section>
  );
}

export default SettingsPage;
