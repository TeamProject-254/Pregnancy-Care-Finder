import { useState } from "react";
import { ModalOverlay } from "../../../components/Modal";
import { CloseIcon } from "../../ProviderDashboard/components/AppointmentIcons";
import { requestErrorMessage } from "../../ProviderDashboard/components/appointmentUtils";
import styles from "../../../components/Modal/Modal.module.scss";

export interface BookingReview {
  doctorName: string;
  specialty: string;
  photoUrl: string;
  service: string;
  dateTime: string;
  duration: string;
  location: string;
  price: string;
}

interface Props {
  review: BookingReview;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ReviewAppointmentModal = ({ review, onClose, onConfirm }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError(requestErrorMessage(e, "Could not book the appointment. Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="review-title" className={styles.modalBooking}>
      <div className={styles.header}>
        <h3 id="review-title">Review appointment</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <p className={styles.subtitle}>Please check the details before confirming.</p>

      <div className={styles.patient}>
        <img className={styles.patientPhoto} src={review.photoUrl} alt={review.doctorName} />
        <div className={styles.patientInfo}>
          <h4>{review.doctorName}</h4>
          <p>{review.specialty}</p>
        </div>
      </div>

      <ul className={`${styles.details} ${styles.detailsInset}`}>
        <li className={styles.stackRow}>
          <span>Service</span>
          <strong>{review.service}</strong>
        </li>
        <li className={styles.stackRow}>
          <span>Date and time</span>
          <strong>{review.dateTime}</strong>
        </li>
        <li>
          <span>Duration</span>
          <strong>{review.duration}</strong>
        </li>
        <li className={styles.stackRow}>
          <span>Location</span>
          <strong>{review.location}</strong>
        </li>
        <li>
          <span>Price</span>
          <strong className={styles.price}>{review.price}</strong>
        </li>
      </ul>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Booking..." : "Confirm booking"}
        </button>
        <button type="button" className={styles.btnOutline} onClick={onClose} disabled={isSubmitting}>
          Back and edit
        </button>
      </div>
    </ModalOverlay>
  );
};
