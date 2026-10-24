import { useState } from "react";
import { isAxiosError } from "axios";
import editIcon from "../../../../assets/img/edit-icon.svg";
import trashIcon from "../../../../assets/img/trash-icon.svg";
import {
  createMedicalService,
  deleteMedicalService,
  updateMedicalService,
  type MedicalService,
  type MedicalServicePayload,
} from "../../../../api/medicalServices";
import { ServiceModal } from "../modals/ServiceModal";
import styles from "./ServicesTab.module.scss";

export interface ServiceItem {
  id: number;
  name: string;
  duration: string;
  price: string;
  active: boolean;
}

interface Props {
  services: MedicalService[];
  isLoading: boolean;
  loadError: string;
  onServicesChange: (services: MedicalService[]) => void;
  onRetry: () => void;
}

const errorMessage = (error: unknown) => {
  if (error instanceof Error && !isAxiosError(error)) {
    return error.message;
  }
  if (isAxiosError(error)) {
    const response = error.response?.data as { message?: string; error?: string } | undefined;
    return response?.message || response?.error || "Could not save the service. Please try again.";
  }
  return "An unexpected error occurred. Please try again.";
};

export const ServicesTab = ({ services, isLoading, loadError, onServicesChange, onRetry }: Props) => {
  const [editingService, setEditingService] = useState<MedicalService | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const saveService = async (payload: MedicalServicePayload) => {
    setSaving(true);
    setError("");
    try {
      if (editingService) {
        const updated = await updateMedicalService(editingService.id, payload);
        onServicesChange(services.map((item) => item.id === updated.id ? updated : item));
        setNotice("Service updated.");
      } else {
        const created = await createMedicalService(payload);
        onServicesChange([...services, created]);
        setNotice("Service added.");
      }
      setEditingService(null);
      setIsCreating(false);
    } catch (saveError) {
      const message = errorMessage(saveError);
      setError(message);
      throw new Error(message, { cause: saveError });
    } finally {
      setSaving(false);
    }
  };

  const removeService = async (service: MedicalService) => {
    if (!window.confirm(`Remove "${service.name}"?`)) return;
    setError("");
    setNotice("");
    setDeletingId(service.id);
    try {
      await deleteMedicalService(service.id);
      onServicesChange(services.filter((item) => item.id !== service.id));
      setNotice("Service removed.");
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Services &amp; prices</h2>
      <p className={styles.subtitle}>Manage the services patients can book. Payments are made directly at the appointment.</p>

      <div className={styles.info} role="note">
        <span className={styles.infoIcon} aria-hidden="true">i</span>
        <span>Your services and prices will be visible on your public profile and during booking.</span>
      </div>

      {(error || loadError) && (
        <div className={styles.error} role="alert">
          <p>{error || loadError}</p>
          {loadError && <button type="button" onClick={onRetry}>Try again</button>}
        </div>
      )}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      <div className={styles.tableCard}>
        {isLoading ? (
          <p className={styles.state}>Loading services...</p>
        ) : (
          <>
            <div className={styles.mobileServiceList}>
              {services.map((service) => (
                <article className={styles.mobileServiceCard} key={service.id}>
                  <div className={styles.mobileServiceInfo}>
                    <strong>{service.name}</strong>
                    <span>{service.durationMinutes} min&nbsp; · &nbsp;{Number(service.price)}$</span>
                    <span className={styles.activeStatus}>Active</span>
                  </div>
                  <div className={styles.mobileServiceActions}>
                    <button
                      type="button"
                      onClick={() => { setNotice(""); setEditingService(service); }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.mobileDeleteButton}
                      onClick={() => void removeService(service)}
                      disabled={deletingId === service.id}
                      aria-label={`Remove ${service.name}`}
                    >
                      <img src={trashIcon} alt="" />
                    </button>
                  </div>
                </article>
              ))}
              {!services.length && (
                <p className={styles.empty}>No services added yet.</p>
              )}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Action’s</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.durationMinutes} min</td>
                      <td>{Number(service.price)}$</td>
                      <td><span className={styles.activeStatus}>Active</span></td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            onClick={() => { setNotice(""); setEditingService(service); }}
                            aria-label={`Edit ${service.name}`}
                            title="Edit service"
                          >
                            <img src={editIcon} alt="" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeService(service)}
                            disabled={deletingId === service.id}
                            aria-label={`Remove ${service.name}`}
                            title="Remove service"
                          >
                            <img src={trashIcon} alt="" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!services.length && (
                    <tr><td colSpan={5} className={styles.empty}>No services added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.footer}>
              <div>
                <span className={styles.count}>{services.length} Services</span>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() => { setNotice(""); setIsCreating(true); }}
                >
                  Add another service
                </button>
              </div>
              <span className={styles.savedNote}>Changes are saved when you submit the service form.</span>
            </div>
          </>
        )}
      </div>

      {(isCreating || editingService) && (
        <ServiceModal
          key={editingService?.id ?? "new"}
          service={editingService}
          isSaving={saving}
          onClose={() => {
            if (!saving) {
              setEditingService(null);
              setIsCreating(false);
            }
          }}
          onSave={saveService}
        />
      )}
    </section>
  );
};
