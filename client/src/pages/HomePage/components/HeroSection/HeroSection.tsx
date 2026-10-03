import styles from "./HeroSection.module.scss";
import mainImage from "../../../../assets/img/mom and doctor.svg";
import { SearchForm } from "../../../../components/SearchForm";

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles["hero__text-section"]}>
        <h1 className={styles.hero__title}>
          Your journey to
          <br />
          motherhood, simplified.
          <div className={styles["hero__text-section-text"]}>
            Find the right care.
          </div>
        </h1>
        <h2 className={styles["hero__additional-text"]}>
          Find and book trusted providers for prenatal
          <br />
          care, ultrasounds, and more near you.
        </h2>

        <SearchForm />
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
