import { forwardRef } from "react";
import cautionIcon from "../../assets/img/caution.svg";
import styles from "./TextInput.module.scss";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  rightElement?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, isValid, rightElement, id, ...rest }, ref) => {
    const controlClasses = [
      styles.inputGroup__control,
      error ? styles["inputGroup__control--error"] : "",
      isValid && !error ? styles["inputGroup__control--success"] : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.inputGroup}>
        {label && (
          <label htmlFor={id} className={styles.inputGroup__label}>
            {label}
          </label>
        )}

        <div className={styles.inputGroup__fieldWrapper}>
          <input ref={ref} id={id} className={controlClasses} {...rest} />

          {rightElement && (
            <div className={styles.inputGroup__rightElement}>
              {rightElement}
            </div>
          )}

          {error && (
            <div className={styles.inputGroup__errorBadge}>
              <img
                src={cautionIcon}
                alt="Error"
                className={styles.inputGroup__cautionIcon}
              />
              <span className={styles.inputGroup__errorMessage}>{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
