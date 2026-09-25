import { NavLink } from 'react-router-dom';
import styles from './Footer.module.scss';
import doctorIcon from '../../assets/img/doctor-icon.svg';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__logo}>
        <img src={doctorIcon} alt="Doctor image" className={styles.footer__logoIcon} />
        <span className={styles.footer__logoText}>
          Pregnancy Care<br />Finder
        </span>
      </div>

      <nav className={styles.footer__nav}>
        <NavLink to="/search" className={styles.footer__link}>Search</NavLink>
        <NavLink to="/about" className={styles.footer__link}>About Us</NavLink>
        <a href="tel:+380123456789" className={styles.footer__link}>Contact Us</a>
      </nav>

      <div className={styles.footer__info}>
        <p className={styles.footer__copyright}>
          Copyright: &copy; 2026 Pregnancy Care Finder.<br />
          All rights reserved.
        </p>
        <nav className={styles.footer__nav}>
          <NavLink to="/terms" className={styles.footer__link}>Terms of Service</NavLink>
          <NavLink to="/privacy" className={styles.footer__link}>Privacy Policy</NavLink>
        </nav>
      </div>
    </footer>
  );
};