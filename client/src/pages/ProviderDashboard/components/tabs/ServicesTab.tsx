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
import { ServiceModal, type EditableService } from "../modals/ServiceModal";
import { DeleteServiceModal } from "../modals/DeleteServiceModal";
import { InfoRedIcon } from "../AppointmentIcons";
import {
  hideMedicalService,
  readHiddenServices,
  toHiddenService,
  writeHiddenServices,
  type HiddenService,
} from "../hiddenServices";
import styles from "./ServicesTab.module.scss";

interface Props {
  services: MedicalService[];
  isLoading: boolean;
  loadError: string;
  storageKey: string;
  onServicesChange: (services: MedicalService[]) => void;
  onRetry: () => void;
}

type ServiceRow =
  | { kind: "active"; key: string; service: MedicalService }
  | { kind: "hidden"; key: string; service: HiddenService };

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

const toEditable = (row: ServiceRow): EditableService => ({
  name: row.service.name,
  durationMinutes: row.service.durationMinutes,
  price: Number(row.service.price),
  hidden: row.kind === "hidden",
});

export const ServicesTab = ({ services, isLoading, loadError, storageKey, onServicesChange, onRetry }: Props) => {
  const [hiddenServices, setHiddenServices] = useState(() => readHiddenServices(storageKey));
  const [editingRow, setEditingRow] = useState<ServiceRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<ServiceRow | null>(null);
  const [notice, setNotice] = useState("");

  const rows: ServiceRow[] = [
    ...services.map((service): ServiceRow => ({ kind: "active", key: `active-${service.id}`, service })),
    ...hiddenServices.map((service): ServiceRow => ({ kind: "hidden", key: service.id, service })),
  ];

  const updateHidden = (next: HiddenService[]) => {
    setHiddenServices(next);
    writeHiddenServices(storageKey, next);
  };

  const closeServiceModal = () => {
    setEditingRow(null);
    setIsCreating(false);
  };

  const saveService = async (payload: MedicalServicePayload, visible: boolean) => {
    setSaving(true);
    try {
      if (!editingRow) {
        if (visible) {
          const created = await createMedicalService(payload);
          onServicesChange([...services, created]);
        } else {
          updateHidden([...hiddenServices, toHiddenService(payload)]);
        }
        setNotice("Service added.");
      } else if (editingRow.kind === "active") {
        const current = editingRow.service;
        if (visible) {
          const updated = await updateMedicalService(current.id, payload);
          onServicesChange(services.map((item) => item.id === updated.id ? updated : item));
        } else {
          await deleteMedicalService(current.id);
          onServicesChange(services.filter((item) => item.id !== current.id));
          updateHidden([...hiddenServices, toHiddenService(payload)]);
        }
        setNotice(visible ? "Service updated." : `Service "${payload.name}" is hidden from patients.`);
      } else {
        const current = editingRow.service;
        if (visible) {
          const created = await createMedicalService(payload);
          onServicesChange([...services, created]);
          updateHidden(hiddenServices.filter((item) => item.id !== current.id));
        } else {
          updateHidden(hiddenServices.map((item) => item.id === current.id ? { ...item, ...payload } : item));
        }
        setNotice(visible ? `Service "${payload.name}" is visible to patients again.` : "Service updated.");
      }
      closeServiceModal();
    } catch (saveError) {
      const message = isAxiosError(saveError) && editingRow?.kind === "active" && !visible
        && (saveError.response?.status === 409 || saveError.response?.status === 500)
        ? "The server could not hide this service because it already has booked appointments."
        : errorMessage(saveError);
      throw new Error(message, { cause: saveError });
    } finally {
      setSaving(false);
    }
  };

  const removeRow = async (row: ServiceRow) => {
    if (row.kind === "active") {
      await deleteMedicalService(row.service.id);
      onServicesChange(services.filter((item) => item.id !== row.service.id));
    } else {
      updateHidden(hiddenServices.filter((item) => item.id !== row.service.id));
    }
    setRowToDelete(null);
    setNotice(`Service "${row.service.name}" deleted.`);
  };

  const hideRow = async (row: ServiceRow) => {
    if (row.kind !== "active") return;
    await hideMedicalService(storageKey, row.service);
    onServicesChange(services.filter((item) => item.id !== row.service.id));
    setHiddenServices(readHiddenServices(storageKey));
    setRowToDelete(null);
    setNotice(`Service "${row.service.name}" is hidden from patients.`);
  };

  const openEdit = (row: ServiceRow) => {
    setNotice("");
    setEditingRow(row);
  };

  const askToRemove = (row: ServiceRow) => {
    setNotice("");
    setRowToDelete(row);
  };

  const statusBadge = (row: ServiceRow) => (
    <span className={`${styles.status} ${row.kind === "hidden" ? styles.statusHidden : ""}`}>
      {row.kind === "hidden" ? "Hidden" : "Active"}
    </span>
  );

  return (
    <section className={styles.container}>
      <div className={styles.heading}>
        <h2 className={styles.title}>Services &amp; prices</h2>
        <p className={styles.subtitle}>Manage the services patients can book. Payments are made directly at the appointment</p>
      </div>

      <div className={styles.info} role="note">
        <InfoRedIcon />
        <span>Your services and prices will be visible on your public profile and during booking</span>
      </div>

      {loadError && (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      )}
      {notice && <p className={styles.notice} role="status">{notice}</p>}

      {isLoading ? (
        <p className={styles.state}>Loading services...</p>
      ) : (
        <>
          <div className={styles.mobileList}>
            {rows.map((row) => (
              <article className={styles.mobileCard} key={row.key}>
                <div className={styles.mobileInfo}>
                  <strong>{row.service.name}</strong>
                  <span className={styles.mobileMeta}>
                    <span>{row.service.durationMinutes} min</span>
                    <span>·</span>
                    <span>{Number(row.service.price)}$</span>
                  </span>
                  {statusBadge(row)}
                </div>
                <div className={styles.mobileActions}>
                  <button type="button" className={styles.editButton} onClick={() => openEdit(row)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => askToRemove(row)}
                    aria-label={`Remove ${row.service.name}`}
                  >
                    <img src={trashIcon} alt="" />
                  </button>
                </div>
              </article>
            ))}
            {!rows.length && <p className={styles.empty}>No services added yet.</p>}
            <button
              type="button"
              className={styles.mobileAddButton}
              onClick={() => { setNotice(""); setIsCreating(true); }}
            >
              Add service
            </button>
          </div>

          <div className={styles.tableCard}>
            <div className={`${styles.row} ${styles.headRow}`}>
              <span>Service</span>
              <span>Duration</span>
              <span>Price</span>
              <span>Status</span>
              <span>Action’s</span>
            </div>
            {rows.map((row) => (
              <div className={styles.row} key={row.key}>
                <span className={styles.name}>{row.service.name}</span>
                <span className={styles.value}>{row.service.durationMinutes} min</span>
                <span className={styles.value}>{Number(row.service.price)}$</span>
                <span className={styles.value}>{statusBadge(row)}</span>
                <span className={styles.rowActions}>
                  <button type="button" onClick={() => openEdit(row)} aria-label={`Edit ${row.service.name}`} title="Edit service">
                    <img src={editIcon} alt="" />
                  </button>
                  <button type="button" onClick={() => askToRemove(row)} aria-label={`Remove ${row.service.name}`} title="Remove service">
                    <img src={trashIcon} alt="" />
                  </button>
                </span>
              </div>
            ))}
            {!rows.length && <p className={styles.empty}>No services added yet.</p>}
            <div className={styles.footer}>
              <span className={styles.count}>{rows.length} Services</span>
              <button
                type="button"
                className={styles.addButton}
                onClick={() => { setNotice(""); setIsCreating(true); }}
              >
                Add another service
              </button>
            </div>
          </div>
        </>
      )}

      {(isCreating || editingRow) && (
        <ServiceModal
          key={editingRow?.key ?? "new"}
          service={editingRow ? toEditable(editingRow) : null}
          existingNames={rows.map((row) => row.service.name)}
          isSaving={saving}
          onClose={() => {
            if (!saving) closeServiceModal();
          }}
          onSave={saveService}
        />
      )}

      {rowToDelete && (
        <DeleteServiceModal
          serviceName={rowToDelete.service.name}
          isHidden={rowToDelete.kind === "hidden"}
          onClose={() => setRowToDelete(null)}
          onDelete={() => removeRow(rowToDelete)}
          onHide={() => hideRow(rowToDelete)}
        />
      )}
    </section>
  );
};
