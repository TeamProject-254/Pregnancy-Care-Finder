import { ModalOverlay } from "../../../components/Modal";
import { CheckBigIcon, CloseIcon } from "../../ProviderDashboard/components/AppointmentIcons";
import type { BookingReview } from "./ReviewAppointmentModal";
import styles from "../../../components/Modal/Modal.module.scss";

interface Props {
  booking: BookingReview;
  onGoToCabinet: () => void;
  onClose: () => void;
}

export const BookingDoneModal = ({ booking, onGoToCabinet, onClose }: Props) => (
  <ModalOverlay onClose={onClose} labelledBy="booking-done-title" centered className={styles.modalBooking}>
    <button type="button" className={`${styles.closeBtn} ${styles.closeTop} ${styles.mobileOnly}`} onClick={onClose} aria-label="Close">
      <CloseIcon />
    </button>

    <div className={`${styles.iconCenter} ${styles.iconSuccess}`}>
      <CheckBigIcon />
    </div>

    <h3 id="booking-done-title" className={styles.title}>
      Appointment booked
    </h3>
    <p className={styles.text}>
      Your appointment with {booking.doctorName}
      <br />
      has been successfully booked.
    </p>

    <ul className={`${styles.details} ${styles.detailsInset}`}>
      <li className={styles.stackRow}>
        <span>Service</span>
        <strong>{booking.service}</strong>
      </li>
      <li className={styles.stackRow}>
        <span>Date and time</span>
        <strong>{booking.dateTime}</strong>
      </li>
      <li>
        <span>Duration</span>
        <strong>{booking.duration}</strong>
      </li>
      <li className={styles.stackRow}>
        <span>Location</span>
        <strong>{booking.location}</strong>
      </li>
      <li>
        <span>Price</span>
        <strong className={styles.price}>{booking.price}</strong>
      </li>
    </ul>

    <div className={styles.actions}>
      <button type="button" className={styles.btnPrimary} onClick={onGoToCabinet}>
        View my appointments
      </button>
      <button type="button" className={styles.btnOutline} onClick={onClose}>
        Back to doctor profile
      </button>
    </div>
  </ModalOverlay>
);
