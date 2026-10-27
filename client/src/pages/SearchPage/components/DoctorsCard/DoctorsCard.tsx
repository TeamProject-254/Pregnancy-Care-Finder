import React from "react";
import styles from "./DoctorsCard.module.scss";
import type { DoctorCardData } from "../../../../types/doctor";

interface DoctorCardProps {
  doctor: DoctorCardData;
  onBook?: (id: number) => void;
}

export const DoctorsCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => (
  <article className={styles.card}>
    <div className={styles.imageWrapper}>
      <img src={doctor.photoUrl} alt={doctor.name} className={styles.image} />
      {doctor.availableToday && (
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span className={styles.badgeText}>Available today</span>
        </div>
      )}
    </div>

    <div className={styles.content}>
      <div className={styles.mainInfo}>
        <h3 className={styles.name}>{doctor.name}</h3>
        <p className={styles.specialty}>{doctor.specialty}</p>

        {doctor.focusAreas.length > 0 && (
          <div className={styles.focusAreas}>
            <h4 className={styles.focusTitle}>Specialization & Focus Areas:</h4>
            <ul className={styles.focusList}>
              {doctor.focusAreas.map((item) => (
                <li key={item} className={styles.focusItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.priceContainer}>
          {doctor.price ? (
            <>
              <span className={styles.price}>{doctor.price}</span>
              <span className={styles.priceUnit}>/visit</span>
            </>
          ) : (
            <span className={styles.priceUnit}>Price on request</span>
          )}
        </div>

        <button type="button" className={styles.bookButton} onClick={() => onBook?.(doctor.id)}>
          Book
        </button>
      </div>
    </div>
  </article>
);
