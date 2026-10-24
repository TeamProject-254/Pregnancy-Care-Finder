import { useState, type FormEvent } from "react";
import type { MedicalService, MedicalServicePayload } from "../../../../api/medicalServices";
import { ModalOverlay } from "../../../../components/Modal";
import styles from "./ServiceModal.module.scss";

interface ServiceModalProps {
  service: MedicalService | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: MedicalServicePayload) => Promise<void>;
}

export const ServiceModal = ({ service, isSaving, onClose, onSave }: ServiceModalProps) => {
  const [name, setName] = useState(service?.name ?? "");
  const [durationMinutes, setDurationMinutes] = useState(String(service?.durationMinutes ?? 45));
  const [price, setPrice] = useState(String(service?.price ?? ""));
  const [error, setError] = useState("");
  const isEdit = service !== null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const duration = Number(durationMinutes);
    const parsedPrice = Number(price);
    if (!name.trim() || !Number.isInteger(duration) || duration <= 0 || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a service name, a positive duration, and a non-negative price.");
      return;
    }
    setError("");
    try {
      await onSave({ name: name.trim(), durationMinutes: duration, price: parsedPrice });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the service. Please try again.");
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="service-modal-title" className={styles.modal}>
      <div className={styles.header}>
        <h2 id="service-modal-title">{isEdit ? "Edit service" : "Add service"}</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close dialog">×</button>
      </div>
      <p className={styles.subtitle}>Add a service patients can book from your public profile</p>

      <form onSubmit={(event) => void submit(event)}>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <label className={styles.field}>
          <span>Service name</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Gynecologist consultation"
            maxLength={120}
            required
          />
        </label>
        <div className={styles.formRow}>
          <label className={styles.field}>
            <span>Duration</span>
            <select value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)}>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              {!["30", "45", "60"].includes(durationMinutes) && (
                <option value={durationMinutes}>{durationMinutes} min</option>
              )}
            </select>
          </label>
          <label className={styles.field}>
            <span>Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Write a price"
              required
            />
          </label>
        </div>

        <div className={styles.visibility} aria-disabled="true" title="Visibility status is not supported by the current server API">
          <span className={styles.toggle}><span /></span>
          <div>
            <strong>Visible to patients</strong>
            <p>Visibility status is managed by the server and cannot be changed here.</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primary} disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save changes" : "Add service"}
          </button>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};
