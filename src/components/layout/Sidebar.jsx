import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { resolveApiAssetUrl } from "../../api/client.js";
import * as friendsApi from "../../api/friends.js";
import * as profileApi from "../../api/profile.js";
import * as reviewsApi from "../../api/reviews.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import Avatar from "../ui/Avatar.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { currentUser } from "../../data/mockData.js";
import styles from "./Sidebar.module.css";

const sidebarLinks = [
  { to: "/home", label: "Feed", icon: "home" },
  { to: "/profile", label: "Meu perfil", icon: "user" },
  { to: "/amigos", label: "Amigos", icon: "friends" },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const displayName =
    profile?.displayName ??
    (user ? `${user.firstName} ${user.lastName}` : currentUser.name);
  const displayUsername = profile?.username
    ? `@${profile.username}`
    : (user?.email ?? currentUser.nickname);
  const avatarUrl = resolveApiAssetUrl(profile?.profileImageUrl);

  useEffect(() => {
    let isMounted = true;

    async function loadSidebarData() {
      if (!token) {
        return;
      }

      const [profileData, friendsData, reviewsData] = await Promise.all([
        profileApi.getMyProfile(token).catch(() => null),
        friendsApi.listFriends(token).catch(() => ({ items: [] })),
        reviewsApi.getMyProfileReviews(token).catch(() => ({ items: [] })),
      ]);

      if (isMounted) {
        setProfile(profileData);
        setFriendsCount(friendsData?.items?.length ?? 0);
        setPostsCount(reviewsData?.items?.length ?? 0);
      }
    }

    loadSidebarData();

    return () => {
      isMounted = false;
    };
  }, [token, location.pathname]);

  return (
    <aside className={styles.sidebar}>
      <section className={styles.userCard}>
        <Avatar src={avatarUrl} alt={displayName} size="lg" />
        <div className={styles.userMeta}>
          <h3 className={styles.userName}>{displayName}</h3>
          <span className={styles.userNickname}>{displayUsername}</span>
        </div>

        <div className={styles.stats}>
          <button
            type="button"
            className={styles.stat}
            onClick={() => navigate("/amigos")}
          >
            <strong>{friendsCount}</strong>
            <span>amigos</span>
          </button>
          <div className={styles.stat}>
            <strong>{postsCount}</strong>
            <span>posts</span>
          </div>
        </div>
      </section>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        iconLeft={<Icon name="plus" size={16} />}
        onClick={() => navigate("/criar-review")}
      >
        Finis
      </Button>

      <nav className={styles.nav} aria-label="Navegação do usuário">
        {sidebarLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <footer className={styles.pillars}>
        <h4 className={styles.pillarsTitle}>Finis</h4>
        <p>
          <strong>Memória</strong> do que você consumiu.
        </p>
        <p>
          <strong>Compartilhe</strong> o que vale recomendar.
        </p>
        <p>
          <strong>Descoberta</strong> de novas obras.
        </p>
      </footer>
    </aside>
  );
}

export default Sidebar;
