import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
import styles from "./BottomNav.module.css";

function BottomNav() {
  return (
    <nav className={styles.bar} aria-label="Navegação principal">
      <NavLink
        to="/home"
        end
        className={({ isActive }) =>
          `${styles.item} ${isActive ? styles.itemActive : ""}`
        }
      >
        <Icon name="home" size={22} />
        <span className={styles.label}>Feed</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `${styles.item} ${isActive ? styles.itemActive : ""}`
        }
      >
        <Icon name="user" size={22} />
        <span className={styles.label}>Perfil</span>
      </NavLink>

      <NavLink
        to="/criar-review"
        className={styles.createSlot}
        aria-label="Criar Finis"
      >
        <span className={styles.createButton}>
          <Icon name="plus" size={26} strokeWidth={2.2} />
        </span>
      </NavLink>

      <NavLink
        to="/amigos"
        className={({ isActive }) =>
          `${styles.item} ${isActive ? styles.itemActive : ""}`
        }
      >
        <Icon name="friends" size={22} />
        <span className={styles.label}>Amigos</span>
      </NavLink>

      <NavLink
        to="/configuracoes"
        className={({ isActive }) =>
          `${styles.item} ${isActive ? styles.itemActive : ""}`
        }
      >
        <Icon name="settings" size={22} />
        <span className={styles.label}>Ajustes</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
