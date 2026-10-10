import React, { forwardRef } from "react";
import styles from "./Checkbox.module.scss";
import { CheckIcon } from "../icons/CheckIcon";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  compact?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, disabled, compact = false, className = "", id, ...rest }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`${styles.checkbox} ${compact ? styles["checkbox--compact"] : ""} ${disabled ? styles["checkbox--disabled"] : ""} ${className}`}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          disabled={disabled}
          className={styles.checkbox__input}
          {...rest}
        />

        <span className={styles.checkbox__box} aria-hidden="true">
          <CheckIcon className={styles.checkbox__icon} size={16} />
        </span>

        {label && <span className={styles.checkbox__label}>{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
