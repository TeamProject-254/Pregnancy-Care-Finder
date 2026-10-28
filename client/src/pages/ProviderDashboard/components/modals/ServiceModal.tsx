import { useState, type FormEvent } from "react";
import type { MedicalServicePayload } from "../../../../api/medicalServices";
import { ModalOverlay } from "../../../../components/Modal";
import { SelectDropdown } from "../../../../components/SelectDropdown/SelectDropdown";
import { PROVIDER_SERVICES, SERVICE_DURATIONS } from "../../../../constants/providerOptions";
import { CloseIcon } from "../AppointmentIcons";
import styles from "../../../../components/Modal/Modal.module.scss";

export interface EditableService extends MedicalServicePayload {
  hidden: boolean;
}

interface ServiceModalProps {
  service: EditableService | null;
  existingNames: string[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: MedicalServicePayload, visible: boolean) => Promise<void>;
}

const validatePrice = (value: string): string => {
  if (!value.trim()) return "Enter a price for this service.";
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price must be a number.";
  if (price < 0) return "Price cannot be negative.";
  if (price > 100000) return "Price looks too high. Check the amount.";
  return "";
};

const validateName = (value: string, isCustom: boolean, takenNames: string[]): string => {
  const name = value.trim();
  if (!name) return isCustom ? "Enter the name of your service." : "Choose a service from the list.";
  if (name.length < 3) return "Service name must be at least 3 characters.";
  if (name.length > 100) return "Service name must be at most 100 characters.";
  if (takenNames.some((item) => item.toLowerCase() === name.toLowerCase())) return "You already offer a service with this name.";
  return "";
};

export const ServiceModal = ({ service, existingNames, isSaving, onClose, onSave }: ServiceModalProps) => {
  const isEdit = service !== null;
  const takenNames = existingNames.filter((item) => item !== service?.name);
  const serviceOptions = [...new Set([...(service ? [service.name] : []), ...PROVIDER_SERVICES])]
    .filter((item) => !takenNames.includes(item));

  const [name, setName] = useState(service?.name ?? "");
  const [isCustomName, setIsCustomName] = useState(() => Boolean(service && !PROVIDER_SERVICES.some((item) => item === service.name)));
  const [durationMinutes, setDurationMinutes] = useState(String(service?.durationMinutes ?? 45));
  const [price, setPrice] = useState(service ? String(Number(service.price)) : "");
  const [visible, setVisible] = useState(!service?.hidden);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [error, setError] = useState("");

  const durationOptions = [...new Set([...SERVICE_DURATIONS, durationMinutes])]
    .sort((a, b) => Number(a) - Number(b))
    .map((minutes) => ({ value: minutes, label: `${minutes} min` }));

  const switchNameMode = () => {
    setIsCustomName((current) => !current);
    setName("");
    setNameError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextNameError = validateName(name, isCustomName, takenNames);
    const nextPriceError = validatePrice(price);
    setNameError(nextNameError);
    setPriceError(nextPriceError);
    if (nextNameError || nextPriceError) return;

    setError("");
    try {
      await onSave({ name: name.trim(), durationMinutes: Number(durationMinutes), price: Number(price) }, visible);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the service. Please try again.");
    }
  };

  return (
    <ModalOverlay onClose={onClose} labelledBy="service-modal-title">
      <div className={styles.header}>
        <h3 id="service-modal-title">{isEdit ? "Edit service" : "Add service"}</h3>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
          <CloseIcon />
        </button>
      </div>
      <p className={styles.subtitle}>Add a service patients can book from your public profile</p>

      <form className={styles.modalForm} onSubmit={(event) => void submit(event)} noValidate>
        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={`${styles.field} ${styles.fieldLoose}`}>
          {isCustomName ? (
            <>
              <label htmlFor="service-name">Service name</label>
              <input
                id="service-name"
                value={name}
                maxLength={100}
                aria-invalid={Boolean(nameError)}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                }}
                placeholder="Write a service name"
              />
            </>
          ) : (
            <>
              <span>Service name</span>
              <SelectDropdown
                className={styles.selectLarge}
                ariaLabel="Service name"
                options={serviceOptions}
                value={name}
                placeholder="Select a service"
                invalid={Boolean(nameError)}
                onChange={(value) => {
                  setName(value);
                  setNameError("");
                }}
              />
            </>
          )}
          {nameError && <span className={styles.fieldError}>{nameError}</span>}
          <div className={styles.fieldHint}>
            {isCustomName ? (
              <>
                <span>Your service is in the list?</span>
                <button type="button" onClick={switchNameMode}>Choose from the list</button>
              </>
            ) : (
              <>
                <span>Can’t find your service?</span>
                <button type="button" onClick={switchNameMode}>Add a custom service</button>
              </>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={`${styles.field} ${styles.fieldLoose}`}>
            <span>Duration</span>
            <SelectDropdown
              className={styles.selectLarge}
              ariaLabel="Duration"
              value={durationMinutes}
              options={durationOptions}
              onChange={setDurationMinutes}
            />
          </div>
          <div className={`${styles.field} ${styles.fieldLoose}`}>
            <label htmlFor="service-price">Price</label>
            <input
              id="service-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              aria-invalid={Boolean(priceError)}
              onChange={(event) => {
                setPrice(event.target.value);
                setPriceError("");
              }}
              placeholder="Write a price"
            />
            {priceError && <span className={styles.fieldError}>{priceError}</span>}
          </div>
        </div>

        <label className={styles.toggleRow}>
          <span className={styles.switch}>
            <input
              type="checkbox"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
            />
            <span />
          </span>
          <span className={styles.toggleText}>
            <strong>Visible to patients</strong>
            <span>{visible ? "Patients can book this service" : "Patients can’t book this service"}</span>
          </span>
        </label>

        <div className={styles.actions}>
          <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Save changes" : "Add service"}
          </button>
          <button type="button" className={styles.btnOutlineDanger} onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};
