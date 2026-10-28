import { useState } from "react";
import { isAxiosError } from "axios";
import { ModalOverlay } from "../../../../components/Modal";
import { ClipboardCrossIcon, CloseIcon, InfoRedIcon } from "../AppointmentIcons";
import { requestErrorMessage } from "../appointmentUtils";
import styles from "../../../../components/Modal/Modal.module.scss";

interface DeleteServiceModalProps {
  serviceName: string;
  isHidden?: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onHide?: () => Promise<void>;
}

const actionErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error) && (error.response?.status === 409 || error.response?.status === 500)) {
    return "The server could not remove this service because it already has booked appointments.";
  }
  return requestErrorMessage(error, fallback);
};

export const DeleteServiceModal = ({ serviceName, isHidden = false, onClose, onDelete, onHide }: DeleteServiceModalProps) => {
  const [pendingAction, setPendingAction] = useState<"delete" | "hide" | null>(null);
  const [error, setError] = useState("");
  const isBusy = pendingAction !== null;

  const run = async (action: "delete" | "hide") => {
    setPendingAction(action);
    setError("");
    try {
      await (action === "delete" ? onDelete() : onHide?.());
    } catch (actionError) {
      setError(actionErrorMessage(
        actionError,
        action === "delete" ? "Could not delete the service. Please try again." : "Could not hide the service. Please try again.",
      ));
      setPendingAction(null);
    }
  };

  return (
    <ModalOverlay onClose={isBusy ? () => undefined : onClose} labelledBy="delete-service-title" centered>
      <button
        type="button"
        className={`${styles.closeBtn} ${styles.closeTop}`}
        onClick={onClose}
        disabled={isBusy}
        aria-label="Close"
      >
        <CloseIcon />
      </button>

      <div className={`${styles.iconCenter} ${styles.iconDanger}`}>
        <ClipboardCrossIcon />
      </div>

      <h3 id="delete-service-title" className={styles.title}>
        Delete service?
      </h3>
      <p className={`${styles.text} ${styles.textDark}`}>
        Patients will no longer be able to book {serviceName}. Existing appointments will not be affected.
      </p>

      {onHide && !isHidden && (
        <div className={styles.alertGray}>
          <InfoRedIcon />
          <span>If you only want to stop new bookings, you can hide the service instead.</span>
        </div>
      )}

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={() => void run("delete")} disabled={isBusy}>
          {pendingAction === "delete" ? "Deleting..." : "Delete service"}
        </button>
        {onHide && !isHidden && (
          <button type="button" className={styles.btnOutline} onClick={() => void run("hide")} disabled={isBusy}>
            {pendingAction === "hide" ? "Hiding..." : "Hide service"}
          </button>
        )}
        <button type="button" className={styles.btnOutlineDanger} onClick={onClose} disabled={isBusy}>
          Cancel
        </button>
      </div>
    </ModalOverlay>
  );
};
