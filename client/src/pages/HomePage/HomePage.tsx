import { CardsSection } from './components/CardsSection';
import { HeroSection } from './components/HeroSection';
import styles from './HomePage.module.scss';

export const HomePage = () => {
  return (
    <div className={styles.home}>
      <HeroSection />
      <CardsSection />
      <div className={styles.home__disclaimer}></div>
    </div>
  );
};