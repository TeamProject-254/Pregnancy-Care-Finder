import { NavLink } from 'react-router-dom';
import styles from './Footer.module.scss';

export const Footer = () => {
  return (
      <footer className={styles.footer}>
        <div className={styles.footer__logo}>
          Pregnancy Care Finder
        </div>
        <nav className={styles.footer__nav}>
          <NavLink to="/" className={styles.footer__link}>Search</NavLink>
          <NavLink to="/" className={styles.footer__link}>About Us</NavLink>
          <a href="tel:+380123456789" className={styles.footer__link}>Contact Us</a>
      </nav>
        <nav className={styles.footer__nav}>
          <div className={styles.footer__rights}></div>
          <NavLink to="/" className={styles.footer__link}>Terms of service</NavLink>
          <NavLink to="/" className={styles.footer__link}>Privacy policy</NavLink>
        </nav>
      </footer>
  );
};