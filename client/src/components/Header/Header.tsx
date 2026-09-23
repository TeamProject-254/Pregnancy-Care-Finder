import styles from './Header.module.scss';
import { Link, NavLink } from 'react-router-dom';

export const Header = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive 
      ? `${styles.header__link} ${styles['header__link--active']}`
      : `${styles.header__link}`
  };
  return (
    <header className={styles.header}>
      <div className={styles.header__logo}>
        <Link to="/">Pregnancy Care Finder</Link>
      </div>
      <div className={styles['header__left-section']}>
        <nav className={styles.header__nav}>
          <NavLink to="/" className={getLinkClass}>Search</NavLink>
          <NavLink to="/" className={getLinkClass}>About Us</NavLink>
          <NavLink to="/" className={getLinkClass}>Personal Cabinet</NavLink>
        </nav>
        <NavLink to="/profile" className={styles.header__profile}>
        Log in
        </NavLink>
      </div>
    </header>
  );
};
