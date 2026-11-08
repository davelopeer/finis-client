import { Outlet } from "react-router-dom";
import TopNavigation from "./TopNavigation.jsx";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";
import styles from "./AppLayout.module.css";

function AppLayout() {
  return (
    <div className={styles.shell}>
      <TopNavigation />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default AppLayout;
