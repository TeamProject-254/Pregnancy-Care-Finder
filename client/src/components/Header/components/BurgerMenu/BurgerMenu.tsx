import React from "react";
import styles from "./BurgerMenu.module.scss";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import closeIcon from "../../../../assets/img/icon-close.svg";

interface BurgerMenuProps {
  isOpen: boolean;
  pendingCount: number;
  onClose: () => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ isOpen, pendingCount, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();
  
  const isHealthcareProfessional = user?.role?.toUpperCase() === "PROVIDER";
  const isPatient = isAuthenticated && !isHealthcareProfessional;

  if (!isOpen) return null;

  return (
    <div className={styles.burgerMenu}>
      <div className={styles.burgerMenu__header}>
        <button onClick={onClose} className={styles.burgerMenu__close} aria-label="Close menu">
          <img src={closeIcon} width={32} height={32} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className={styles.burgerMenu__content}>
        {(!isAuthenticated || isPatient) && (
          <NavLink to="/search" onClick={onClose} className={styles.burgerMenu__link}>
            Search
          </NavLink>
        )}

        {isHealthcareProfessional && (
          <>
            <NavLink to="/provider-dashboard?tab=appointments" onClick={onClose} className={styles.burgerMenu__link}>
              Appointments
              {pendingCount > 0 && (
                <span className={styles.burgerMenu__badge}>{pendingCount > 99 ? "99+" : pendingCount}</span>
              )}
            </NavLink>
            <NavLink to="/provider-dashboard?tab=profile" onClick={onClose} className={styles.burgerMenu__link}>
              Personal cabinet
            </NavLink>
          </>
        )}

        {isPatient && (
          <NavLink to="/patient-dashboard" onClick={onClose} className={styles.burgerMenu__link}>
            My appointments
          </NavLink>
        )}

        {isAuthenticated ? (
          <button 
            onClick={() => {
              logout();
              onClose();
            }} 
            className={styles.burgerMenu__link}
          >
            Log out
          </button>
        ) : (
          <Link to="/login" onClick={onClose} className={styles.burgerMenu__link}>
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};