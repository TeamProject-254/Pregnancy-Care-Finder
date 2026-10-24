import type { AppointmentStatusCode } from "../../../api/appointments";

export type StatusOverrides = Record<string, AppointmentStatusCode>;

const storageKey = (userId: number) => `provider-appt-status:${userId}`;

export const readStatusOverrides = (userId: number | undefined): StatusOverrides => {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as StatusOverrides) : {};
  } catch {
    return {};
  }
};

export const saveStatusOverride = (
  userId: number | undefined,
  appointmentId: number,
  status: AppointmentStatusCode,
): void => {
  if (!userId) return;
  try {
    const next = { ...readStatusOverrides(userId), [String(appointmentId)]: status };
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  } catch {
    return;
  }
};
