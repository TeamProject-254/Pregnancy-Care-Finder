import { NavLink } from 'react-router-dom';
import styles from './HeroSection.module.scss';
import locationIcon from '../../../../assets/img/location-icon.svg';
import doctorIcon from '../../../../assets/img/doctor-icon.svg';

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles['hero__text-section']}>
        <h1 className={styles.hero__title}>
          Your journey to<br />motherhood, simplified.<br />Find the right care.
        </h1>
        <h2 className={styles['hero__additional-text']}>
          Find and book trusted providers for prenatal<br />care, ultrasounds, and more near you.
        </h2>

        <div className={styles.hero__interactive}>
          <div className={styles.hero__field}>
            <img src={doctorIcon} alt="Doctor icon" className={styles.hero__icon} />
            <span className={styles.hero__placeholder}>Specialty of Service (eg., Gynecologist)</span>
          </div>

          <span className={styles.hero__divider}>|</span>

          <div className={styles.hero__field}>
            <img src={locationIcon} alt="Location icon" className={styles.hero__icon} />
            <span className={styles.hero__placeholder}>City or location</span>
          </div>

          <NavLink to="/" className={styles.hero__button}>
            Find doctor
          </NavLink>
        </div>
      </div>

      <div className={styles.hero__photoBox}>
        <img 
          src="" 
          alt="Mom and doctor" 
          className={styles.hero__photo} 
        />
      </div>
    </section>
  );
};