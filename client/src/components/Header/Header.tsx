import React, { useState } from "react";
import styles from "./Header.module.scss";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import profileIcon from "../../assets/img/profile-icon.svg";
import iconLogo from "../../assets/img/icon.svg";
import { BurgerMenu } from "./components/BurgerMenu";

interface HeaderProps {
  isLinksShown?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLinksShown = true }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHealthcareProfessional = user?.role?.toUpperCase() === "PROVIDER";
  const isPatient = isAuthenticated && !isHealthcareProfessional;

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive
      ? `${styles.header__link} ${styles["header__link--active"]}`
      : styles.header__link;
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.header__content}>
          <div className={styles.header__logo}>
            <img src={iconLogo} alt="Logo" />
            <Link to="/">Bloom<span>Care</span></Link>
          </div>

          {isLinksShown && (
            <>
              <div className={styles["header__left-section"]}>
                <nav className={styles.header__nav}>
                  {(!isAuthenticated || isPatient) && (
                    <NavLink to="/search" className={getLinkClass}>
                      Search
                    </NavLink>
                  )}

                  {isAuthenticated && (
                    <NavLink to={isHealthcareProfessional ? "/provider-dashboard" : "/patient-dashboard"} className={getLinkClass}>
                      My appointments
                    </NavLink>
                  )}
                </nav>

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

              <div className={styles.header__mobileActions}>
                <Link to="/search" className={styles.header__mobileSearch}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="var(--color-gray-90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="var(--color-gray-90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <button onClick={() => setIsMenuOpen(true)} className={styles.header__mobileBurger}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="var(--color-gray-90)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <BurgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};