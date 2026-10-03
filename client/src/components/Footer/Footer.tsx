import { NavLink, Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import logoIcon from '../../assets/img/icon.svg';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__logo}>
        <img src={logoIcon} alt="Doctor image" className={styles.footer__logoIcon} />
        <Link 
          to="/" 
          className={styles.footer__logoText}
          onClick={scrollToTop}
        >
          Pregnancy Care<br />Finder
        </Link>
      </div>

      <nav className={styles.footer__nav}>
        <a href="tel:+380123456789" className={styles.footer__link}>Contact Us</a>
        <NavLink to="/about" className={styles.footer__link}>Privacy Policy</NavLink>
      </nav>

      <div className={styles.footer__info}>
        <p className={styles.footer__copyright}>
          Copyright: &copy; 2026 Pregnancy Care Finder.<br />
          All rights reserved.
        </p>
        <nav className={styles.footer__nav}>
          <NavLink to="/terms" className={styles.footer__link}>Terms of Service</NavLink>
        </nav>
      </div>
    </footer>
  );
};