import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import Icon from "../ui/Icon.jsx";
import styles from "./TopNavigation.module.css";

const secondaryLinks = [
  { to: "/quem-somos", label: "Quem somos" },
  { to: "/contato", label: "Contato" },
  { to: "/faq", label: "FAQ" },
];

function TopNavigation() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/home" className={styles.brand}>
          <span className={styles.brandMark}>F</span>
          <span className={styles.brandName}>Finis</span>
        </Link>

        <nav className={styles.links} aria-label="Navegação principal">
          {secondaryLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className={styles.logout}
            aria-label="Sair"
            onClick={handleLogout}
          >
            <Icon name="logout" size={16} />
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}

export default TopNavigation;
