import React from "react";
import { Link } from "react-router-dom";
import styles from "./PasswordUpdate.module.scss";

export const PasswordUpdated: React.FC = () => {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Password updated</h1>

      <p className={styles.description}>
        Your password has been successfully changed. You can now log in using
        your new password.
      </p>

      <Link to="/login" className={styles.button}>
        Continue to log in
      </Link>
    </div>
  );
};
