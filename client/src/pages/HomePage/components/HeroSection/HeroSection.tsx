import styles from "./HeroSection.module.scss";
import mainImage from "../../../../assets/img/mom and doctor.svg";
import { SearchForm } from "../../../../components/SearchForm";

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.hero__main}>
        <h1 className={styles.hero__title}>
          Your journey to motherhood, simplified.
          <div className={styles["hero__title-accent"]}>
            Find the right care.
          </div>
        </h1>

        <div className={styles.hero__imageMobile}>
          <img
            src={mainImage}
            alt="Mom and doctor"
            className={styles.hero__photo}
          />
        </div>

        <h2 className={styles["hero__additional-text"]}>
          Find and book trusted providers for prenatal
          <br className={styles.hero__brDesktop} />
          care, ultrasounds, and more near you.
        </h2>

        <div className={styles.hero__search}>
          <SearchForm />
        </div>
      </div>

      <div className={styles.hero__imageDesktop}>
        <img
          src={mainImage}
          alt="Mom and doctor"
          className={styles.hero__photo}
        />
      </div>
    </section>
  );
};