import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { SearchForm } from "../../components/SearchForm";
import type { DoctorCardData } from "../../types/doctor";
import { FiltersSideBar } from "./components/FiltersSideBar";
import styles from "./ShearchPage.module.scss";
import blankProfilePicture from "../../assets/img/blank-profile-picture-973460_1280.png";
import chevronDownIcon from "../../assets/img/icon-chevron-down.svg";
import filterIcon from "../../assets/img/icon-filter.svg";
import { DoctorsCard } from "./components/DoctorsCard";
import {
  getPublicProvider,
  searchProviders,
  type PublicAvailability,
  type PublicProvider,
  type PublicProviderDetail,
} from "../../api/providers";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../utils/validation";

const PAGE_SIZE = 6;
const MAX_FOCUS_AREAS = 4;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string; needsLogin: boolean }
  | { status: "ready"; doctors: DoctorCardData[] };

const pad = (value: number) => String(value).padStart(2, "0");

const nowParts = () => {
  const now = new Date();
  return {
    today: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
};

const earliestFreeSlot = (availabilities: PublicAvailability[]) => {
  const { today, time } = nowParts();
  const upcoming = availabilities
    .filter((slot) => slot.status === "FREE")
    .filter((slot) => slot.date > today || (slot.date === today && slot.endTime.slice(0, 5) > time))
    .map((slot) => `${slot.date}T${slot.startTime.slice(0, 5)}`)
    .sort();
  return upcoming[0] ?? null;
};

const toCard = (provider: PublicProvider, detail: PublicProviderDetail | null): DoctorCardData => {
  const services = detail?.services ?? [];
  const prices = services.map((service) => Number(service.price)).filter((price) => Number.isFinite(price));
  const earliestSlot = detail ? earliestFreeSlot(detail.availabilities) : null;

  return {
    id: provider.id,
    name: `Dr. ${provider.firstName} ${provider.lastName}`,
    photoUrl: provider.photoUrl || blankProfilePicture,
    specialty: provider.specialization || provider.professionalRole || "Healthcare professional",
    focusAreas: services.slice(0, MAX_FOCUS_AREAS).map((service) => service.name),
    price: prices.length ? `${Math.min(...prices)}$` : null,
    availableToday: earliestSlot !== null && earliestSlot.startsWith(nowParts().today),
    earliestSlot,
  };
};

const byEarliestAvailable = (a: DoctorCardData, b: DoctorCardData) => {
  if (a.earliestSlot && b.earliestSlot) return a.earliestSlot.localeCompare(b.earliestSlot);
  if (a.earliestSlot) return -1;
  if (b.earliestSlot) return 1;
  return a.name.localeCompare(b.name);
};

const loadDoctors = async (): Promise<DoctorCardData[]> => {
  const providers = await searchProviders();
  const details = await Promise.allSettled(providers.map((provider) => getPublicProvider(String(provider.id))));
  return providers
    .map((provider, index) => {
      const result = details[index];
      return toCard(provider, result.status === "fulfilled" ? result.value : null);
    })
    .sort(byEarliestAvailable);
};

interface DoctorsResultsProps {
  onOpenFilters: () => void;
}

const DoctorsResults = ({ onOpenFilters }: DoctorsResultsProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      setState({ status: "loading" });
      try {
        const doctors = await loadDoctors();
        if (isCurrent) setState({ status: "ready", doctors });
      } catch (error) {
        if (!isCurrent) return;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const needsLogin = !isAuthenticated && (status === 401 || status === 403);
        setState({
          status: "error",
          needsLogin,
          message: needsLogin
            ? "The server does not share the list of doctors without signing in yet."
            : apiErrorMessage(error, "Unable to load doctors. Please try again."),
        });
      }
    };

    void load();
    return () => {
      isCurrent = false;
    };
  }, [reloadToken, isAuthenticated]);

  if (state.status === "loading") {
    return <p className={styles.search__state}>Loading doctors...</p>;
  }

  if (state.status === "error") {
    return (
      <div className={styles.search__state}>
        <p>{state.message}</p>
        {state.needsLogin ? (
          <Link to="/login" state={{ from: "/search" }} className={styles.doctors__list__button}>
            Log in
          </Link>
        ) : (
          <button type="button" className={styles.doctors__list__button} onClick={() => setReloadToken((token) => token + 1)}>
            Try again
          </button>
        )}
      </div>
    );
  }

  const { doctors } = state;
  const visibleDoctors = doctors.slice(0, visibleCount);

  return (
    <>
      <div className={styles.search__info}>
        <div className={styles.search__info__text}>
          <h5 className={styles.search__info__title}>
            <b>Sort by:</b> Earliest available
            <img src={chevronDownIcon} alt="" className={styles.search__info__chevron} />
          </h5>
          <span className={styles.search__info__span}>
            Showing <b>{visibleDoctors.length} of {doctors.length} doctors</b>
          </span>
        </div>
        <button type="button" className={styles.search__filters__button} onClick={onOpenFilters} aria-label="Open filters">
          <img src={filterIcon} alt="" />
        </button>
      </div>

      {doctors.length === 0 ? (
        <p className={styles.search__state}>No doctors have published their profiles yet.</p>
      ) : (
        <div className={styles.cards__grid}>
          {visibleDoctors.map((doctor) => (
            <DoctorsCard key={doctor.id} doctor={doctor} onBook={(id) => navigate(`/doctors/${id}`)} />
          ))}
        </div>
      )}

      {visibleCount < doctors.length && (
        <button
          type="button"
          className={styles.doctors__list__button}
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          Load more doctors
        </button>
      )}
    </>
  );
};

export const SearchPage = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <main className={styles.grid__wrapper}>
      <SearchForm className={styles.wide__form} variant="search" />

      <FiltersSideBar isMobileOpen={isFiltersOpen} onMobileClose={() => setIsFiltersOpen(false)} />

      <section className={styles.doctors__list}>
        <DoctorsResults onOpenFilters={() => setIsFiltersOpen(true)} />
      </section>
    </main>
  );
};
