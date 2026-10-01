import { SearchForm } from "../../components/SearchForm";
import type { Doctor } from "../../types/doctor";
import { FiltersSideBar } from "./components/FiltersSideBar";
import styles from "./ShearchPage.module.scss";
import blanckProfilePicture from "../../assets/img/blank-profile-picture-973460_1280.png";
import { DoctorsCard } from "./components/DoctorsCard";

const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Doctor name",
    photoUrl: blanckProfilePicture,
    specialty: "Obstetrician-Gynecologist",
    isVerified: true,
    experience: "8 years",
    location: "Warsaw",
    rating: 4.9,
    reviewsCount: 124,
    languages: ["English", "Polish"],
    price: "40$",
    about:
      "Specialist in comprehensive prenatal care and pregnancy monitoring.",
    expertise: [
      "Prenatal care & pregnancy monitoring (1st–3rd trimester)",
      "High-risk pregnancy management",
      "1st and 2nd-trimester screening ultrasounds",
    ],
    availabilitySlots: ["today"],
  },
  {
    id: 2,
    name: "Doctor name",
    photoUrl: blanckProfilePicture,
    specialty: "Obstetrician-Gynecologist",
    isVerified: true,
    experience: "10 years",
    location: "Krakow",
    rating: 5.0,
    reviewsCount: 98,
    languages: ["English", "Ukrainian"],
    price: "45$",
    about: "Specialist in prenatal ultrasound and maternal-fetal medicine.",
    expertise: [
      "Prenatal care & pregnancy monitoring (1st–3rd trimester)",
      "High-risk pregnancy management",
      "1st and 2nd-trimester screening ultrasounds",
    ],
    availabilitySlots: ["today"],
  },
  {
    id: 3,
    name: "Doctor name",
    photoUrl: blanckProfilePicture,
    specialty: "Obstetrician-Gynecologist",
    isVerified: true,
    experience: "6 years",
    location: "Gdansk",
    rating: 4.8,
    reviewsCount: 76,
    languages: ["English", "Polish", "Ukrainian"],
    price: "40$",
    about:
      "Dedicated obstetrician providing gentle and focused care throughout all trimesters.",
    expertise: [
      "Prenatal care & pregnancy monitoring (1st–3rd trimester)",
      "High-risk pregnancy management",
      "1st and 2nd-trimester screening ultrasounds",
    ],
    availabilitySlots: ["today"],
  },
  {
    id: 4,
    name: "Doctor name",
    photoUrl: blanckProfilePicture,
    specialty: "Obstetrician-Gynecologist",
    isVerified: true,
    experience: "12 years",
    location: "Wroclaw",
    rating: 4.95,
    reviewsCount: 142,
    languages: ["English", "Polish"],
    price: "45$",
    about:
      "Senior gynecologist focusing on high-risk cases and comprehensive screenings.",
    expertise: [
      "Prenatal care & pregnancy monitoring (1st–3rd trimester)",
      "High-risk pregnancy management",
      "1st and 2nd-trimester screening ultrasounds",
    ],
    availabilitySlots: ["today"],
  },
];

export const SearchPage = () => {
  return (
    <main className={styles.grid__wrapper}>
      <SearchForm className={styles.wide__form} />

      <FiltersSideBar />

      <section className={styles.doctors__list}>
        <div className={styles.search__info}>
          <h5 className={styles.search__info__title}>
            Sort by: Earliest available
          </h5>
          <span className={styles.search__info__span}>
            Showing <b>4 of 6 doctors</b>
          </span>
        </div>

        <div className={styles.cards__grid}>
          {MOCK_DOCTORS.map((doctor) => (
            <DoctorsCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        <button className={styles.doctors__list__button}>
          Load more doctors
        </button>
      </section>
    </main>
  );
};
