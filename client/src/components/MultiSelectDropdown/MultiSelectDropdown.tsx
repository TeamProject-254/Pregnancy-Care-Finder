import styles from "./MultiSelectDropdown.module.scss";

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  options: readonly string[];
  value: string[];
  placeholder: string;
  onChange: (value: string[]) => void;
}

export const MultiSelectDropdown = ({
  id,
  label,
  options,
  value,
  placeholder,
  onChange,
}: MultiSelectDropdownProps) => (
  <details className={styles.dropdown}>
    <summary id={id} className={styles.dropdown__trigger} aria-label={label}>
      <span className={value.length > 0 ? "" : styles.dropdown__placeholder}>
        {value.length > 0 ? value.join(", ") : placeholder}
      </span>
      <span className={styles.dropdown__arrow} aria-hidden="true" />
    </summary>
    <div className={styles.dropdown__menu} role="group" aria-labelledby={id}>
      {options.map((option) => (
        <label key={option} className={styles.dropdown__option}>
          <input
            type="checkbox"
            checked={value.includes(option)}
            onChange={(event) => {
              onChange(
                event.target.checked
                  ? [...value, option]
                  : value.filter((selected) => selected !== option),
              );
            }}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </details>
);
