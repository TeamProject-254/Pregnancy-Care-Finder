import styles from './Header.module.scss';
import { Link, NavLink } from 'react-router-dom';
import profileIcon from '../../assets/img/profile-icon.svg';

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
          <NavLink to="/" className={getLinkClass}>
            <div className={styles.header__button}>Are you a health professional?</div>
          </NavLink>
          <NavLink to="/" className={getLinkClass}>Search</NavLink>
          <NavLink to="/" className={getLinkClass}>Personal Cabinet</NavLink>
        </nav>
        <NavLink to="/profile" className={styles.header__profile}>
        <img src={profileIcon} alt="Profile icon"/>
          Log in
        </NavLink>
      </div>
    </header>
  );
};
