import { NavLink } from 'react-router-dom';
import styles from './HeroSection.module.scss';
import locationIcon from '../../../../assets/img/location-icon.svg';
import doctorIcon from '../../../../assets/img/doctor-icon.svg';


export const HeroSection = () => {
  return (
    <div className={styles.hero}>
      <div className={styles['hero__text-section']}>
        <h1 className={styles.hero__title}>
          Your journey to motherhood, simplified. Find the right care.
        </h1>
        <h2 className={styles['hero__additional-text']}>
          Find and book trusted providers for prenatal care, ultrasounds, and more near you.
        </h2>
        <div className={styles.hero__interactive}>
          <img src={locationIcon} alt="Doctor icon" />
          Specialty of Service (eg. Gynecologist) | <img src={doctorIcon} alt="Location icon" /> City or location
          <NavLink to='/' className={styles.hero__button}>find doctor</NavLink>
        </div>
      </div>
    </div>
  );
};