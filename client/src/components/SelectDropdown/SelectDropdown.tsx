import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./SelectDropdown.module.scss";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  id?: string;
  options: ReadonlyArray<SelectOption | string>;
  value: string;
  placeholder?: string;
  ariaLabel?: string;
  invalid?: boolean;
  disabled?: boolean;
  variant?: "default" | "bare" | "small";
  className?: string;
  triggerClassName?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const normalize = (option: SelectOption | string): SelectOption =>
  typeof option === "string" ? { value: option, label: option } : option;

export const SelectDropdown = ({
  id,
  options,
  value,
  placeholder = "Select",
  ariaLabel,
  invalid = false,
  disabled = false,
  variant = "default",
  className = "",
  triggerClassName = "",
  onChange,
  onBlur,
}: SelectDropdownProps) => {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const items = options.map(normalize);
  const selectedIndex = items.findIndex((item) => item.value === value);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, onBlur]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const option = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    option?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const open = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    onBlur?.();
  };

  const choose = (index: number) => {
    const item = items[index];
    if (!item) return;
    onChange(item.value);
    close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, items.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
      default:
        break;
    }
  };

  const rootClasses = [styles.select, styles[`select--${variant}`], className].filter(Boolean).join(" ");
  const triggerClasses = [
    styles.select__trigger,
    invalid ? styles["select__trigger--invalid"] : "",
    isOpen ? styles["select__trigger--open"] : "",
    triggerClassName,
  ].filter(Boolean).join(" ");

  return (
    <div className={rootClasses} ref={rootRef}>
      <button
        id={id}
        type="button"
        className={triggerClasses}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? styles.select__value : styles.select__placeholder}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={styles.select__arrow} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul id={listId} ref={listRef} className={styles.select__menu} role="listbox" aria-label={ariaLabel}>
          {items.map((item, index) => (
            <li
              key={item.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={item.value === value}
              className={[
                styles.select__option,
                item.value === value ? styles["select__option--selected"] : "",
                index === activeIndex ? styles["select__option--active"] : "",
              ].filter(Boolean).join(" ")}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
