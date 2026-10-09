import styles from "./Header.module.scss";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import profileIcon from "../../assets/img/profile-icon.svg";
import iconLogo from "../../assets/img/icon.svg";

interface HeaderProps {
  isLinksShown?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLinksShown = true }) => {
  // Дістаємо logout (або твою функцію виходу) з контексту
  const { isAuthenticated, user, logout } = useAuth();

  const isHealthcareProfessional = user?.role?.toUpperCase() === "PROVIDER";
  const isPatient = isAuthenticated && !isHealthcareProfessional;

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? `${styles.header__link} ${styles["header__link--active"]}`
      : styles.header__link;
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__content}>
        <div className={styles.header__logo}>
          <img src={iconLogo} alt="Logo" />
          <Link to="/">Bloom<span>Care</span></Link>
        </div>

        {isLinksShown && (
          <div className={styles["header__left-section"]}>
            <nav className={styles.header__nav}>
              
              {/* Search: показуємо тільки якщо це неавторизований юзер АБО пацієнт */}
              {(!isAuthenticated || isPatient) && (
                <NavLink to="/search" className={getLinkClass}>
                  Search
                </NavLink>
              )}

              {/* Appointments: показуємо для всіх авторизованих (і лікарям, і пацієнтам) */}
              {isAuthenticated && (
                <NavLink to="/appointments" className={getLinkClass}>
                  My appointments
                </NavLink>
              )}
            </nav>

            {/* Profile / Auth Button */}
            {isAuthenticated ? (
              <button 
                onClick={logout} 
                className={`${styles.header__profile} ${styles["header__profile--outline"]}`}
              >
                <img src={profileIcon} alt="Profile icon" />
                Log out
              </button>
            ) : (
              <Link to="/login" className={styles.header__profile}>
                <img src={profileIcon} alt="Profile icon" />
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};