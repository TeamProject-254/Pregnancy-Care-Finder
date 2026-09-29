import React, { forwardRef } from "react";
import styles from "./TextInput.module.scss";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, rightElement, id, ...rest }, ref) => {
    return (
      <div className={styles.inputGroup}>

        {label && (
          <label htmlFor={id} className={styles.inputGroup__label}>
            {label}
          </label>
        )}

        <div className={styles.inputGroup__fieldWrapper}>
          <input
            ref={ref}
            id={id}
            className={`${styles.inputGroup__control} ${error ? styles["inputGroup__control--error"] : ""}`}
            {...rest}
          />

          {rightElement && (
            <div className={styles.inputGroup__rightElement}>
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <span className={styles.inputGroup__errorMessage}>{error}</span>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
