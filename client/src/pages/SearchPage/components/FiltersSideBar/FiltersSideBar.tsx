import { useState } from "react";
import arrowTopIcon from "../../../../assets/img/arrow-top.svg";
import type { FilterOption, FiltersState } from "../../../../types/filters";
import { FiltersAccordion } from "../FiltersAccordion";
import styles from "./FiltersSideBar.module.scss";

const SERVICES_OPTIONS: FilterOption[] = [
  { label: "Obstetrician-Gynecologist", value: "obgyn" },
  { label: "Maternal-Fetal Medicine", value: "mfm" },
  { label: "Prenatal Ultrasound Specialist", value: "ultrasound" },
  { label: "Perinatal Psychologist", value: "psychologist" },
  { label: "Pelvic Floor Physical Therapist", value: "physical_therapist" },
  { label: "Reproductive Endocrinologist", value: "endocrinologist" },
];

const PROCEDURES_OPTIONS: FilterOption[] = [
  { label: "1st Trimester Screening Ultrasound", value: "1st_screening" },
  { label: "2nd Trimester Anatomy Scan", value: "2nd_scan" },
  { label: "3rd Trimester Growth Ultrasound", value: "3rd_growth" },
  { label: "Doppler Blood Flow Study", value: "doppler" },
  { label: "CTG / Fetal Heart Rate Monitoring", value: "ctg" },
  { label: "NIPT (Non-Invasive Prenatal Test)", value: "nipt" },
];

const AVAILABILITY_OPTIONS: FilterOption[] = [
  { label: "Today", value: "today" },
  { label: "In the next 3 days", value: "next_3_days" },
  { label: "In the next 7 days", value: "next_7_days" },
  { label: "In the next 14 days", value: "next_14_days" },
];

const LANGUAGE_OPTIONS: FilterOption[] = [
  { label: "English", value: "en" },
  { label: "Polish", value: "pl" },
  { label: "Ukrainian", value: "ua" },
];

interface FiltersSidebarProps {
  onFiltersChange?: (filters: FiltersState) => void;
}

export const FiltersSideBar: React.FC<FiltersSidebarProps> = ({
  onFiltersChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [procedures, setProcedures] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);

  const handleServicesChange = (updated: string[]) => {
    setServices(updated);
    onFiltersChange?.({
      services: updated,
      procedures,
      availability,
      languages,
    });
  };

  const handleProceduresChange = (updated: string[]) => {
    setProcedures(updated);
    onFiltersChange?.({
      services,
      procedures: updated,
      availability,
      languages,
    });
  };

  const handleAvailabilityChange = (updated: string) => {
    setAvailability(updated);
    onFiltersChange?.({
      services,
      procedures,
      availability: updated,
      languages,
    });
  };

  const handleLanguagesChange = (updated: string[]) => {
    setLanguages(updated);
    onFiltersChange?.({
      services,
      procedures,
      availability,
      languages: updated,
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
    <aside className={styles.filter}>
      <button
        type="button"
        className={styles.filter__top}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <h4 className={styles.filter__title}>Filters</h4>
        <img
          src={arrowTopIcon}
          alt="hideFilters"
          className={`${styles.filter__icon} ${isExpanded ? "" : styles.filter__iconClosed}`}
        />
      </button>

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
    </aside>
  );
};
