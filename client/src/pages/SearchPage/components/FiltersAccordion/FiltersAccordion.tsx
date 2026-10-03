import React, { useState } from "react";
import arrowTopIcon from "../../../../assets/img/arrow-top.svg";
import { Checkbox } from "../../../../components/Checkbox";
import { Radio } from "../../../../components/Radio";
import styles from "./FiltersAccordion.module.scss";
import type { FilterOption } from "../../../../types/filters";

interface SingleFilterProps {
  type: "radio";
  selected: string;
  onChange: (value: string) => void;
}

interface MultiFilterProps {
  type: "checkbox";
  selected: string[];
  onChange: (value: string[]) => void;
}

type FilterAccordionProps = {
  title: string;
  options: FilterOption[];
  defaultOpen?: boolean;
} & (SingleFilterProps | MultiFilterProps);

export const FiltersAccordion: React.FC<FilterAccordionProps> = (props) => {
  const { title, options, defaultOpen = true, type } = props;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleCheckboxClick = (val: string) => {
    if (props.type !== "checkbox") return;
    const exists = props.selected.includes(val);
    const updated = exists
      ? props.selected.filter((item) => item !== val)
      : [...props.selected, val];
    props.onChange(updated);
  };

  const handleRadioClick = (val: string) => {
    if (props.type !== "radio") return;
    props.onChange(val);
  };

  return (
    <div className={styles.accordion}>
      <button type="button" className={styles.header} onClick={handleToggle}>
        <span className={styles.title}>{title}</span>
        <img
          src={arrowTopIcon}
          alt="toggle"
          className={`${styles.icon} ${isOpen ? "" : styles.iconClosed}`}
        />
      </button>
      <div
        className={`${styles.collapseWrapper} ${isOpen ? styles.collapseWrapperOpen : ""}`}
      >
        <div className={styles.collapseInner}>
          <div className={styles.optionsList}>
            {options.map((option) => {
              const inputId = `${title}-${option.value}`;

              if (type === "checkbox") {
                const isChecked = props.selected.includes(option.value);
                return (
                  <Checkbox
                    key={option.value}
                    id={inputId}
                    label={option.label}
                    value={option.value}
                    checked={isChecked}
                    onChange={() => handleCheckboxClick(option.value)}
                  />
                );
              }

              const isChecked = props.selected === option.value;
              return (
                <Radio
                  key={option.value}
                  id={inputId}
                  name={title}
                  label={option.label}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleRadioClick(option.value)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
