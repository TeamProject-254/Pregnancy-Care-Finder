import { ModalOverlay } from "../../../components/Modal";
import { CheckBigIcon, CloseIcon } from "../../ProviderDashboard/components/AppointmentIcons";
import styles from "../../../components/Modal/Modal.module.scss";

interface Props {
  doctorName: string;
  dateTime: string;
  onGoToCabinet: () => void;
  onClose: () => void;
}

export const BookingDoneModal = ({ doctorName, dateTime, onGoToCabinet, onClose }: Props) => (
  <ModalOverlay onClose={onClose} labelledBy="booking-done-title" centered>
    <button type="button" className={`${styles.closeBtn} ${styles.closeTop}`} onClick={onClose} aria-label="Close">
      <CloseIcon />
    </button>

    <div className={`${styles.iconCenter} ${styles.iconSuccess}`}>
      <CheckBigIcon />
    </div>

    <h3 id="booking-done-title" className={styles.title}>
      Appointment requested
    </h3>
    <p className={styles.text}>
      Your request to <strong>{doctorName}</strong> for {dateTime} was sent. You will see the updated status in your
      personal cabinet once the doctor confirms it.
    </p>

    <div className={styles.actions}>
      <button type="button" className={styles.btnPrimary} onClick={onGoToCabinet}>
        Go to personal cabinet
      </button>
      <button type="button" className={styles.btnOutline} onClick={onClose}>
        Back to the doctor
      </button>
    </div>
  </ModalOverlay>
);
