import { useState } from "react";
import { requestErrorMessage, type AppointmentItem } from "../appointmentUtils";
import { CheckBigIcon, CloseIcon, InfoIcon } from "../AppointmentIcons";
import { ModalOverlay } from "../../../../components/Modal";
import styles from "../../../../components/Modal/Modal.module.scss";

interface Props {
  appt: AppointmentItem;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmAppointmentModal = ({ appt, onClose, onConfirm }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError(requestErrorMessage(e, "Could not confirm the appointment. Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="appt-confirm-title" centered>
      <button type="button" className={`${styles.closeBtn} ${styles.closeTop}`} onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      <div className={`${styles.iconCenter} ${styles.iconSuccess}`}>
        <CheckBigIcon />
      </div>

      <h3 id="appt-confirm-title" className={styles.title}>
        Confirm appointment?
      </h3>
      <p className={styles.text}>
        Confirm the appointment with <strong>{appt.patientName}</strong>
        <br />
        on {appt.date} at {appt.time}
      </p>

      <div className={styles.alert}>
        <InfoIcon />
        <span>The patient will see the updated status in her personal cabinet</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Confirming..." : "Confirm appointment"}
        </button>
        <button type="button" className={styles.btnOutlineDanger} onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </ModalOverlay>
  );
};
