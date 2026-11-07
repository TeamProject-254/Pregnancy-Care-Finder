import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./SearchForm.module.scss";
import locationIcon from "../../assets/img/location-icon.svg";
import doctorIcon from "../../assets/img/doctor-icon.svg";
import { CityAutocomplete } from "../CityAutocomplete/CityAutocomplete";
import { PROVIDER_SPECIALTIES } from "../../constants/providerOptions";
import { getMyPatientProfile } from "../../api/patients";
import { useAuth } from "../../context/AuthContext";
import { SelectDropdown } from "../SelectDropdown/SelectDropdown";

interface SearchFormProps {
  className?: string;
  variant?: "default" | "search";
}

export const SearchForm: React.FC<SearchFormProps> = ({ className, variant = "default" }) => {
  const [searchParams] = useSearchParams();
  const specialty = searchParams.get("specialty") || "";
  const location = searchParams.get("location") || "";

  return (
    <SearchFormFields
      key={JSON.stringify([specialty, location])}
      className={className}
      variant={variant}
      initialSpecialty={specialty}
      initialLocation={location}
    />
  );
};

interface SearchFormFieldsProps extends SearchFormProps {
  initialSpecialty: string;
  initialLocation: string;
}

const SearchFormFields: React.FC<SearchFormFieldsProps> = ({
  className,
  variant,
  initialSpecialty,
  initialLocation,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [location, setLocation] = useState(initialLocation);
  const [savedProfileLocation, setSavedProfileLocation] = useState("");
  const profileLocationRequested = useRef(false);

  const handleLocationFocus = () => {
    if (user?.role !== "PATIENT" || profileLocationRequested.current) return;
    profileLocationRequested.current = true;
    void getMyPatientProfile()
      .then((profile) => setSavedProfileLocation(profile.location || ""))
      .catch(() => undefined);
  };

  const specialtyOptions = specialty
    ? [
        { value: "", label: "Any specialty" },
        ...(PROVIDER_SPECIALTIES.includes(specialty as typeof PROVIDER_SPECIALTIES[number])
          ? []
          : [specialty]),
        ...PROVIDER_SPECIALTIES,
      ]
    : PROVIDER_SPECIALTIES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (specialty.trim()) params.append("specialty", specialty.trim());
    if (location.trim()) params.append("location", location.trim());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className={`${styles.from__wrapper} ${variant === "search" ? styles.from__wrapperSearch : ""} ${className || ""}`}>
      <form onSubmit={handleSearch} className={styles.search__form}>
        <div className={styles.search__field}>
          <img
            src={doctorIcon}
            alt="Doctor icon"
            className={styles.search__icon}
          />
          <SelectDropdown
            className={styles.searchSpecialtySelect}
            variant="search"
            value={specialty}
            placeholder="Specialty of Service (eg., Gynecologist)"
            ariaLabel="Choose a doctor's specialty"
            options={specialtyOptions}
            onChange={setSpecialty}
          />
        </div>

        <span className={styles.search__divider}>|</span>

        <div className={styles.search__field}>
          <img
            src={locationIcon}
            alt="Location icon"
            className={styles.search__icon}
          />
          <CityAutocomplete
            value={location}
            onSelectCity={(city) => setLocation(city)}
            suggestedLocation={savedProfileLocation}
            onFocus={handleLocationFocus}
          />
        </div>

        <button type="submit" className={styles.search__button}>
          Find doctor
        </button>
      </form>
    </div>
  );
};
