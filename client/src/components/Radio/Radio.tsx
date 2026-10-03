import React, { forwardRef } from "react";
import styles from "./Radio.module.scss";

interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, disabled, className = "", id, ...rest }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`${styles.radio} ${disabled ? styles["radio--disabled"] : ""} ${className}`}
      >
        <input
          ref={ref}
          id={id}
          type="radio"
          disabled={disabled}
          className={styles.radio__input}
          {...rest}
        />

        <span className={styles.radio__circle} aria-hidden="true">
          <span className={styles.radio__dot} />
        </span>

        {label && <span className={styles.radio__label}>{label}</span>}
      </label>
    );
  },
);

Radio.displayName = "Radio";