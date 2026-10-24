import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { getPublicProvider } from "../../api/providers";
import blankProfilePicture from "../../assets/img/blank-profile-picture-973460_1280.png";
import { BookingPanel } from "./components/BookingPanel";
import { BackIcon, BriefcaseIcon, GlobeIcon, PinIcon } from "./components/DoctorIcons";
import { cityFromAddress, formatPrice } from "./bookingUtils";
import { PUBLIC_DOCTOR_API_READY } from "../../config/features";
import { getMockDoctor, type DoctorData } from "./mockDoctor";
import styles from "./DoctorPage.module.scss";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: DoctorData };

const loadDoctor = async (id: string): Promise<DoctorData | null> => {
  if (!PUBLIC_DOCTOR_API_READY) return getMockDoctor(id);

  const provider = await getPublicProvider(id);
  return {
    provider,
    services: provider.services,
    availabilities: provider.availabilities.filter((slot) => slot.status === "FREE"),
    isDemo: false,
  };
};

const DoctorProfile = ({ id }: { id: string }) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      try {
        const data = await loadDoctor(id);
        if (!isCurrent) return;
        setState(
          data
            ? { status: "ready", data }
            : { status: "error", message: "We could not find this doctor." },
        );
      } catch (error) {
        if (!isCurrent) return;
        const notFound = isAxiosError(error) && error.response?.status === 404;
        setState({
          status: "error",
          message: notFound ? "We could not find this doctor." : "Unable to load the doctor profile. Please try again later.",
        });
      }
    };

    void load();
    return () => {
      isCurrent = false;
    };
  }, [id]);

  return (
    <main className={styles.page}>
      <Link to="/search" className={styles.back}>
        <BackIcon /> Back to all doctors
      </Link>

      {state.status === "loading" && <p className={styles.state}>Loading doctor profile...</p>}

      {state.status === "error" && (
        <div className={styles.state}>
          <p>{state.message}</p>
          <Link to="/search" className={styles.stateLink}>
            Go to search
          </Link>
        </div>
      )}

      {state.status === "ready" && <DoctorContent data={state.data} />}
    </main>
  );
};

const DoctorContent = ({ data }: { data: DoctorData }) => {
  const { provider, services } = data;
  const fullName = `Dr. ${provider.firstName} ${provider.lastName}`;
  const specialty = provider.specialization || provider.professionalRole || "Healthcare professional";
  const languages = provider.languages?.length ? provider.languages.join(", ") : "";
  const city = cityFromAddress(provider.address);
  const minPrice = services.length ? Math.min(...services.map((service) => Number(service.price))) : null;
  const expertise = services.length ? services.map((service) => service.name) : [specialty];

  return (
    <>
      <section className={styles.hero}>
        <img className={styles.photo} src={provider.photoUrl || blankProfilePicture} alt={fullName} />

        <div className={styles.heroInfo}>
          <h1 className={styles.name}>{fullName}</h1>
          <p className={styles.specialty}>{specialty}</p>

          <ul className={styles.meta}>
            {provider.yearsOfExperience !== null && provider.yearsOfExperience !== undefined && (
              <li>
                <BriefcaseIcon /> {provider.yearsOfExperience} years of experience
              </li>
            )}
            {city && (
              <li>
                <PinIcon /> {city}
              </li>
            )}
            {languages && (
              <li>
                <GlobeIcon /> {languages}
              </li>
            )}
          </ul>

          {minPrice !== null && (
            <p className={styles.from}>
              <span>From {formatPrice(minPrice)}</span> per consultation
            </p>
          )}
          <p className={styles.disclaimer}>Professional information is provided by the healthcare professional.</p>
        </div>
      </section>

      <div className={styles.columns}>
        <section className={`${styles.card} ${styles.about}`}>
          <h2 className={styles.cardTitle}>About the Doctor</h2>
          <p className={styles.aboutText}>{provider.description || "The doctor has not added a description yet."}</p>

          <hr className={styles.divider} />

          <h2 className={styles.cardTitle}>Services and expertise</h2>
          <ul className={styles.chips}>
            {expertise.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <hr className={styles.divider} />

          <h2 className={styles.cardTitle}>Consultation location</h2>
          <p className={styles.location}>
            <PinIcon /> {provider.address || "Location not specified"}
          </p>
        </section>

        <BookingPanel data={data} />
      </div>

      {data.isDemo && (
        <p className={styles.demoNote}>
          Demo mode: this is a sample doctor and booking is simulated until the server provides public doctor data.
        </p>
      )}
    </>
  );
};

export const DoctorPage = () => {
  const { id } = useParams();
  if (!id) return <Navigate to="/search" replace />;
  return <DoctorProfile key={id} id={id} />;
};
