import { Link } from 'react-router-dom';
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
        <img src={logoIcon} alt="BloomCare logo" className={styles.footer__logoIcon} />
        <Link 
          to="/" 
          className={styles.footer__logoText}
          onClick={scrollToTop}
        >
          Bloom<span>Care</span>
        </Link>
      </div>

      <nav className={styles.footer__nav}>
        <a href="tel:+380123456789" className={styles.footer__link}>Contact Us</a>
        <a 
          href="/privacy-policy.txt" 
          download="BloomCare-Privacy-Policy.txt" 
          className={styles.footer__link}
        >
          Privacy Policy
        </a>
      </nav>

      <div className={styles.footer__info}>
        <p className={styles.footer__copyright}>
          Copyright: &copy; 2026 BloomCare.<br />
          All rights reserved.
        </p>
        <nav className={styles.footer__nav}>
          <a 
            href="/terms-of-service.txt" 
            download="BloomCare-Terms-of-Service.txt" 
            className={styles.footer__link}
          >
            Terms of Service
          </a>
        </nav>
      </div>
    </footer>
  );
};