import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchProviders } from "../../api/providers";
import type {
  ProviderSearchParams,
  ProviderSummaryResponse,
  FiltersState,
} from "../../types/filters";
import type { DoctorCardData } from "../../types/doctor";
import { SearchForm } from "../../components/SearchForm";
import { FiltersSideBar } from "./components/FiltersSideBar";
import { DoctorsCard } from "./components/DoctorsCard";
import blanckProfilePicture from "../../assets/img/blank-profile-picture-973460_1280.png";
import styles from "./ShearchPage.module.scss";

const mapProviderToCardData = (
  provider: ProviderSummaryResponse,
): DoctorCardData => ({
  id: provider.id,
  name: `Dr. ${provider.firstName} ${provider.lastName}`,
  photoUrl: provider.photoUrl || blanckProfilePicture,
  specialty:
    provider.specialization ||
    provider.professionalRole ||
    "Obstetrician-Gynecologist",
  focusAreas: provider.specialization
    ? [provider.specialization]
    : ["Prenatal care"],
  price: "40$",
  availableToday: false,
  earliestSlot: null,
});

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlLocation = searchParams.get("location") || "";
  const urlSpecialty = searchParams.get("specialty") || "";

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [sidebarFilters, setSidebarFilters] = useState<FiltersState>({
    services: [],
    procedures: [],
    availability: "",
    languages: [],
  });

  const [doctors, setDoctors] = useState<DoctorCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      let availabilityDateFrom: string | undefined;
      let availabilityDateTo: string | undefined;

      if (sidebarFilters.availability) {
        const now = new Date();
        const formatDate = (d: Date) => d.toISOString().split("T")[0];

        availabilityDateFrom = formatDate(now);

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + Number(sidebarFilters.availability));
        availabilityDateTo = formatDate(targetDate);
      }

      const combinedSpecializations = [
        ...(urlSpecialty ? [urlSpecialty] : []),
        ...(sidebarFilters.services || []),
      ];

      const queryParams: ProviderSearchParams = {
        location: urlLocation || undefined,
        specializations:
          combinedSpecializations.length > 0
            ? combinedSpecializations
            : undefined,
        services:
          sidebarFilters.procedures.length > 0
            ? sidebarFilters.procedures
            : undefined,
        languages:
          sidebarFilters.languages.length > 0
            ? sidebarFilters.languages
            : undefined,
        availabilityDateFrom,
        availabilityDateTo,
      };

      const response = await searchProviders(queryParams);
      setDoctors(response.map(mapProviderToCardData));
    } catch {
      setErrorMessage("Failed to load providers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [urlLocation, urlSpecialty, sidebarFilters]);

  useEffect(() => {
    void fetchDoctors();
  }, [fetchDoctors]);

  return (
    <main className={styles.grid__wrapper}>
      <SearchForm className={styles.wide__form} />

      <FiltersSideBar
        onFiltersChange={setSidebarFilters}
        isMobileOpen={isFiltersOpen}
        onMobileClose={() => setIsFiltersOpen(false)}
      />

      <section className={styles.doctors__list}>
        <div className={styles.search__info}>
          <h5 className={styles.search__info__title}>
            Sort by: Earliest available
          </h5>
          <span className={styles.search__info__span}>
            Showing <b>{doctors.length} doctors</b>
          </span>
        </div>

        {isLoading ? (
          <div className={styles.loading__state}>Loading doctors...</div>
        ) : errorMessage ? (
          <div className={styles.error__state}>
            <p>{errorMessage}</p>
            <button
              type="button"
              className={styles.doctors__list__button}
              onClick={() => void fetchDoctors()}
            >
              Retry
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className={styles.empty__state}>
            <p>No doctors found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.cards__grid}>
            {doctors.map((doctor) => (
              <DoctorsCard
                key={doctor.id}
                doctor={doctor}
                onBook={(id) => navigate(`/doctors/${id}`)}
              />
            ))}
          </div>
        )}

        {doctors.length > 0 && !isLoading && (
          <button className={styles.doctors__list__button}>
            Load more doctors
          </button>
        )}
      </section>
    </main>
  );
};
