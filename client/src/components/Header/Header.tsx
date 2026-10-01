import styles from "./Header.module.scss";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import profileIcon from "../../assets/img/profile-icon.svg";
import iconLogo from "../../assets/img/icon.svg";

interface HeaderProps {
  isLinksShown?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isLinksShown = true,
}) => {
  const { isAuthenticated, user } = useAuth();

  const isHealthcareProfessional = user?.role?.toUpperCase() === "PROVIDER";

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? `${styles.header__link} ${styles["header__link--active"]}`
      : styles.header__link;
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__logo}>
        <img src={iconLogo} alt="Logo" />
        <Link to="/">Pregnancy Care Finder</Link>
      </div>

      {isLinksShown && (
        <div className={styles["header__left-section"]}>
          <nav className={styles.header__nav}>

            {isAuthenticated && isHealthcareProfessional && (
              <NavLink to="/professionals" className={styles.header__button}>
                For healthcare professionals
              </NavLink>
            )}

            {isAuthenticated && !isHealthcareProfessional && (
              <NavLink to="/search" className={getLinkClass}>
                Find a doctor
              </NavLink>
            )}

          </nav>

          {/* Profile / Login */}
          {isAuthenticated ? (
            <Link to="/profile" className={styles.header__profile}>
              <img src={profileIcon} alt="Profile icon" />
              Personal Cabinet
            </Link>
          ) : (
            <Link to="/login" className={styles.header__profile}>
              <img src={profileIcon} alt="Profile icon" />
              Log in
            </Link>
          )}
        </div>
      )}
    </header>
  );
};