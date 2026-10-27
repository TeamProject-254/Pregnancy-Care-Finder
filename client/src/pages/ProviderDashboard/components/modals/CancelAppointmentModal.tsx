import { useState } from "react";
import { CANCEL_REASONS, requestErrorMessage, type AppointmentItem } from "../appointmentUtils";
import { ClipboardCrossIcon, CloseIcon, InfoIcon } from "../AppointmentIcons";
import { ModalOverlay } from "../../../../components/Modal";
import { SelectDropdown } from "../../../../components/SelectDropdown/SelectDropdown";
import styles from "../../../../components/Modal/Modal.module.scss";

interface Props {
  appt: AppointmentItem;
  onClose: () => void;
  onSubmit: (reason: string, message: string) => Promise<void>;
}

export const CancelAppointmentModal = ({ appt, onClose, onSubmit }: Props) => {
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit(reason, message.trim());
    } catch (e) {
      setError(requestErrorMessage(e, "Could not cancel the appointment. Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="appt-cancel-title" centered>
      <button type="button" className={`${styles.closeBtn} ${styles.closeTop}`} onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>

      <div className={`${styles.iconCenter} ${styles.iconDanger}`}>
        <ClipboardCrossIcon />
      </div>

      <h3 id="appt-cancel-title" className={styles.title}>
        Cancel appointment?
      </h3>
      <p className={styles.text}>
        The time will become available for booking again.
        <br />
        <strong>
          {appt.patientName}, {appt.date} at {appt.time}
        </strong>
      </p>

      <div className={styles.field}>
        <label htmlFor="cancel-reason">Cancellation reason</label>
        <SelectDropdown
          id="cancel-reason"
          ariaLabel="Cancellation reason"
          options={CANCEL_REASONS}
          value={reason}
          onChange={setReason}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="cancel-message">Message to patient (optional)</label>
        <textarea id="cancel-message" rows={3} value={message} onChange={(event) => setMessage(event.target.value)} />
      </div>

      <div className={styles.alert}>
        <InfoIcon />
        <span>The patient will be notified.</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Cancelling..." : "Cancel appointment"}
        </button>
        <button type="button" className={styles.btnOutlineDanger} onClick={onClose} disabled={isSubmitting}>
          Keep appointment
        </button>
      </div>
    </ModalOverlay>
  );
};
