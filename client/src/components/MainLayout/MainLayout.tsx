import { Outlet } from "react-router-dom";
import { Footer } from "../Footer";
import { Header } from "../Header";
import styles from './MainLayout.module.scss';

export const MainLayout = () => (
  <>
    <Header />
    <div className={styles.content}>
      <Outlet />
    </div>
    <Footer />
  </>
);