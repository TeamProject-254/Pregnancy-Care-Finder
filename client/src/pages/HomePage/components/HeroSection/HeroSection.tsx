import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeroSection.module.scss';
import locationIcon from '../../../../assets/img/location-icon.svg';
import doctorIcon from '../../../../assets/img/doctor-icon.svg';
import mainImage from '../../../../assets/img/mom and doctor.svg';

export const HeroSection = () => {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (specialty.trim()) params.append('specialty', specialty.trim());
    if (location.trim()) params.append('location', location.trim());

    navigate(`/?${params.toString()}`);
  };

  return (
    <section className={styles.hero}>
      <div className={styles['hero__text-section']}>
        <h1 className={styles.hero__title}>
          Your journey to<br />motherhood, simplified.
          <div className={styles['hero__text-section-text']}>
            Find the right care.
          </div>
        </h1>
        <h2 className={styles['hero__additional-text']}>
          Find and book trusted providers for prenatal<br />care, ultrasounds, and more near you.
        </h2>

        <form onSubmit={handleSearch} className={styles.hero__interactive}>
          <div className={styles.hero__field}>
            <img src={doctorIcon} alt="Doctor icon" className={styles.hero__icon} />
            <input
              type="text"
              className={styles.hero__input}
              placeholder="Specialty of Service (eg., Gynecologist)"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>

          <span className={styles.hero__divider}>|</span>

          <div className={styles.hero__field}>
            <img src={locationIcon} alt="Location icon" className={styles.hero__icon} />
            <input
              type="text"
              className={styles.hero__input}
              placeholder="City or location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.hero__button}>
            Find doctor
          </button>
        </form>
      </div>

      <div className={styles.hero__photoBox}>
        <img 
          src={mainImage}
          alt="Mom and doctor" 
          className={styles.hero__photo} 
        />
      </div>
    </section>
  );
};