import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";

export const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.notFound__title}>404</h1>
      <p className={styles.notFound__text}>
        Page not found
      </p>
      <Link to="/" className={styles.notFound__button}>
        Go back
      </Link>
    </div>
  );
};