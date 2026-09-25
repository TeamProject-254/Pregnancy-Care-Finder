import { CardsSection } from './components/CardsSection';
import { HeroSection } from './components/HeroSection';
import styles from './HomePage.module.scss';
import informationIcon from '../../assets/img/information-icon.svg';

export const HomePage = () => {
  return (
    <div className={styles.home}>
      <HeroSection />
      <CardsSection />
      <div className={styles.home__disclaimer}>
        <img src={informationIcon} alt="Information icon" />
        <div className={styles['home__disclaimer-text']}>
          Medical Disclaimer: Pregnancy Care Finder is an informational service for finding healthcare providers and booking appointments. This service does not provide medical advice, diagnoses, or emergency care, and does not replace an in-person doctor visit.
        </div>
      </div>
    </div>
  );
};