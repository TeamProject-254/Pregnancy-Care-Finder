import { useState } from "react";
import arrowTopIcon from "../../../../assets/img/arrow-top.svg";
import closeIcon from "../../../../assets/img/icon-close.svg";
import type { FilterOption, FiltersState } from "../../../../types/filters";
import { FiltersAccordion } from "../FiltersAccordion";
import styles from "./FiltersSideBar.module.scss";

const SERVICES_OPTIONS: FilterOption[] = [
  { label: "Obstetrician-Gynecologist", value: "Obstetrician-Gynecologist" },
  { label: "Maternal-Fetal Medicine", value: "Maternal-Fetal Medicine" },
  {
    label: "Prenatal Ultrasound Specialist",
    value: "Prenatal Ultrasound Specialist",
  },
  { label: "Perinatal Psychologist", value: "Perinatal Psychologist" },
  {
    label: "Pelvic Floor Physical Therapist",
    value: "Pelvic Floor Physical Therapist",
  },
  {
    label: "Reproductive Endocrinologist",
    value: "Reproductive Endocrinologist",
  },
];

const PROCEDURES_OPTIONS: FilterOption[] = [
  {
    label: "1st Trimester Screening Ultrasound",
    value: "1st Trimester Screening Ultrasound",
  },
  { label: "2nd Trimester Anatomy Scan", value: "2nd Trimester Anatomy Scan" },
  {
    label: "3rd Trimester Growth Ultrasound",
    value: "3rd Trimester Growth Ultrasound",
  },
  { label: "Doppler Blood Flow Study", value: "Doppler Blood Flow Study" },
  {
    label: "CTG / Fetal Heart Rate Monitoring",
    value: "CTG / Fetal Heart Rate Monitoring",
  },
  { label: "NIPT (Non-Invasive Prenatal Test)", value: "NIPT" },
];

const AVAILABILITY_OPTIONS: FilterOption[] = [
  { label: "Today", value: "0" },
  { label: "In the next 3 days", value: "3" },
  { label: "In the next 7 days", value: "7" },
  { label: "In the next 14 days", value: "14" },
];

const LANGUAGE_OPTIONS: FilterOption[] = [
  { label: "English", value: "English" },
  { label: "Polish", value: "Polish" },
  { label: "Ukrainian", value: "Ukrainian" },
];

interface FiltersSidebarProps {
  onFiltersChange?: (filters: FiltersState) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const FiltersSideBar: React.FC<FiltersSidebarProps> = ({
  onFiltersChange,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const [services, setServices] = useState<string[]>([]);
  const [procedures, setProcedures] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);

  const handleServicesChange = (updated: string[]) => setServices(updated);
  const handleProceduresChange = (updated: string[]) => setProcedures(updated);
  const handleAvailabilityChange = (updated: string) =>
    setAvailability(updated);
  const handleLanguagesChange = (updated: string[]) => setLanguages(updated);


  const handleApplyFilters = () => {
    onFiltersChange?.({
      services,
      procedures,
      availability,
      languages,
    });
  };

  const handleClearFilters = () => {
    setServices([]);
    setProcedures([]);
    setAvailability("");
    setLanguages([]);
    onFiltersChange?.({
      services: [],
      procedures: [],
      availability: "",
      languages: [],
    });
  };

  return (
    <aside className={`${styles.filter} ${isMobileOpen ? styles.filter__mobileOpen : ""}`}>
      <button
        type="button"
        className={styles.filter__top}
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <h4 className={styles.filter__title}>Filters</h4>
        <img
          src={arrowTopIcon}
          alt=""
          aria-hidden="true"
          className={`${styles.filter__icon} ${isExpanded ? "" : styles.filter__iconClosed}`}
        />
      </button>
      <div className={styles.filter__mobileTop}>
        <h4 className={styles.filter__title}>Filters</h4>
        <button type="button" className={styles.filter__close} onClick={onMobileClose} aria-label="Close filters">
          <img src={closeIcon} alt="" />
        </button>
      </div>

      <div
        className={`${styles.filter__collapse} ${isExpanded ? styles.filter__collapseOpen : ""}`}
      >
        <div className={styles.filter__collapseInner}>
          <div className={styles.filter__main}>
            <FiltersAccordion
              title="Services"
              type="checkbox"
              options={SERVICES_OPTIONS}
              selected={services}
              onChange={handleServicesChange}
            />

            <div className={styles.filter__divider} />

            <FiltersAccordion
              title="Services & Procedures"
              type="checkbox"
              options={PROCEDURES_OPTIONS}
              selected={procedures}
              onChange={handleProceduresChange}
            />

            <div className={styles.filter__divider} />

            <FiltersAccordion
              title="Availability"
              type="radio"
              options={AVAILABILITY_OPTIONS}
              selected={availability}
              onChange={handleAvailabilityChange}
            />

            <div className={styles.filter__divider} />

            <FiltersAccordion
              title="Spoken language"
              type="checkbox"
              options={LANGUAGE_OPTIONS}
              selected={languages}
              onChange={handleLanguagesChange}
            />

            <div className={styles.filter__divider} />

            <div className={styles.filter__actions}>
              <button
                type="button"
                onClick={handleApplyFilters}
                className={styles.filter__button__apply}
              >
                Apply filters
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className={styles.filter__button__clear}
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
