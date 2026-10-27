import React, { useState } from "react";
import styles from "./Header.module.scss";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePendingAppointments } from "../../hooks/usePendingAppointments";
import profileIcon from "../../assets/img/profile-icon.svg";
import iconLogo from "../../assets/img/icon.svg";
import { BurgerMenu } from "./components/BurgerMenu/BurgerMenu";
import burgerMenuIcon from '../../assets/img/burgermenu-icon.svg';
import searchIcom from '../../assets/img/search-icon.svg';

interface HeaderProps {
  isLinksShown?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLinksShown = true }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHealthcareProfessional = user?.role?.toUpperCase() === "PROVIDER";
  const isPatient = isAuthenticated && !isHealthcareProfessional;
  const pendingCount = usePendingAppointments();
  const location = useLocation();
  const isOnProviderDashboard = location.pathname === "/provider-dashboard";
  const isAppointmentsTab = new URLSearchParams(location.search).get("tab") === "appointments";
  const pendingLabel = pendingCount > 99 ? "99+" : String(pendingCount);

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

                  {isHealthcareProfessional && (
                    <>
                      <NavLink
                        to="/provider-dashboard?tab=appointments"
                        className={() => getLinkClass({ isActive: isOnProviderDashboard && isAppointmentsTab })}
                        aria-label={pendingCount > 0 ? `Appointments, ${pendingCount} awaiting your response` : "Appointments"}
                      >
                        <span className={styles.header__linkWithBadge}>
                          Appointments
                          {pendingCount > 0 && (
                            <span className={styles.header__badge} aria-hidden="true">{pendingLabel}</span>
                          )}
                        </span>
                      </NavLink>
                      <NavLink
                        to="/provider-dashboard?tab=profile"
                        className={() => getLinkClass({ isActive: isOnProviderDashboard && !isAppointmentsTab })}
                      >
                        Personal cabinet
                      </NavLink>
                    </>
                  )}

                  {isPatient && (
                    <>
                      <NavLink to="/patient-dashboard" className={getLinkClass}>
                        My appointments
                      </NavLink>
                      <NavLink to="/patient-dashboard" className={getLinkClass}>
                        Personal cabinet
                      </NavLink>
                    </>
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
                  <img src={searchIcom} alt="Search" />
                </Link>
                <button onClick={() => setIsMenuOpen(true)} className={styles.header__mobileBurger}>
                  <img src={burgerMenuIcon} alt="Menu" />
                  {pendingCount > 0 && (
                    <span className={`${styles.header__badge} ${styles["header__badge--corner"]}`} aria-hidden="true">
                      {pendingLabel}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <BurgerMenu isOpen={isMenuOpen} pendingCount={pendingCount} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
