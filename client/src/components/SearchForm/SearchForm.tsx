import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchFrom.module.scss";
import locationIcon from "../../assets/img/location-icon.svg";
import doctorIcon from "../../assets/img/doctor-icon.svg";

interface SearchFormProps {
  className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({ className }) => {
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (specialty.trim()) params.append("specialty", specialty.trim());
    if (location.trim()) params.append("location", location.trim());

    navigate(`/?${params.toString()}`);
  };

  return (
    <div className={`${styles.from__wrapper} ${className || ""}`}>
      <form onSubmit={handleSearch} className={styles.search__form}>
        <div className={styles.search__field}>
          <img
            src={doctorIcon}
            alt="Doctor icon"
            className={styles.search__icon}
          />
          <input
            type="text"
            className={styles.search__input}
            placeholder="Specialty of Service (eg., Gynecologist)"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </div>

        <span className={styles.search__divider}>|</span>

        <div className={styles.search__field}>
          <img
            src={locationIcon}
            alt="Location icon"
            className={styles.search__icon}
          />
          <input
            type="text"
            className={styles.search__input}
            placeholder="City or location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.search__button}>
          Find doctor
        </button>
      </form>
    </div>
  );
};
