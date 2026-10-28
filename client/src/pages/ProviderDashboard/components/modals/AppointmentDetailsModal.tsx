import { useState } from "react";
import blankProfile from "../../../../assets/img/blank-profile-picture-973460_1280.png";
import { requestErrorMessage, type AppointmentItem } from "../appointmentUtils";
import { CloseIcon, PendingClockIcon } from "../AppointmentIcons";
import { ModalOverlay } from "../../../../components/Modal";
import styles from "../../../../components/Modal/Modal.module.scss";

interface Props {
  appt: AppointmentItem;
  onClose: () => void;
  onConfirm: (appt: AppointmentItem, message: string) => Promise<void>;
  onCancel: (appt: AppointmentItem) => void;
}

export const AppointmentDetailsModal = ({ appt, onClose, onConfirm, onCancel }: Props) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());

  const isPending = appt.statusCode === "PENDING";
  const isCancelled = appt.statusCode === "CANCELLED_BY_PATIENT" || appt.statusCode === "CANCELLED_BY_PROVIDER";
  const isFuture = appt.start.getTime() >= now;
  const canManage = !isCancelled && appt.statusCode !== "COMPLETED" && isFuture;
  const statusClass = isCancelled
    ? styles.statusCancelled
    : appt.statusCode === "PENDING" ? "" : styles.statusConfirmed;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(appt, message.trim());
    } catch (e) {
      setError(requestErrorMessage(e, "Could not confirm the appointment. Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="appt-details-title" className={styles.modalDetails}>
      <div className={styles.header}>
        <h3 id="appt-details-title">Appointments details</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      <div className={styles.patient}>
        <img className={styles.patientPhoto} src={appt.patientPhotoUrl || blankProfile} alt={appt.patientName} />
        <div className={styles.patientInfo}>
          <h4>{appt.patientName}</h4>
          <p>Patient</p>
          <p>Pregnancy week: {appt.pregnancyWeek}</p>
        </div>
      </div>

      <ul className={styles.details}>
        <li>
          <span>Service</span>
          <strong>{appt.service}</strong>
        </li>
        <li>
          <span>Date and time</span>
          <strong>{appt.longDateTime}</strong>
        </li>
        <li>
          <span>Duration</span>
          <strong>{appt.duration}</strong>
        </li>
        <li>
          <span>Location</span>
          <strong>{appt.location}</strong>
        </li>
        <li>
          <span>Price</span>
          <strong className={styles.price}>{appt.price}</strong>
        </li>
        <li className={`${styles.mobileOnly} ${styles.statusRow}`}>
          <span>Status</span>
          <strong className={`${styles.statusBadge} ${statusClass}`}>
            <PendingClockIcon size={16} />
            {appt.status}
          </strong>
        </li>
      </ul>

      {isCancelled && (
        <div className={styles.statusNote}>
          <strong>{appt.status}</strong>
          {appt.cancellationReason ? `Reason: ${appt.cancellationReason}` : "No reason provided."}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {isPending && canManage && (
        <div className={styles.field}>
          <label htmlFor="appt-message">Message to patient (optional)</label>
          <textarea
            id="appt-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      )}

      {canManage && (
        <div className={styles.actions}>
          {isPending && (
            <button type="button" className={styles.btnPrimary} onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : "Confirm appointment"}
            </button>
          )}
          <button
            type="button"
            className={styles.btnOutlineDanger}
            onClick={() => onCancel(appt)}
            disabled={isSubmitting}
          >
            Cancel appointment
          </button>
        </div>
      )}
    </ModalOverlay>
  );
};
