import { api } from "./axios";

export type AppointmentStatusCode =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED_BY_PATIENT"
  | "CANCELLED_BY_PROVIDER";

export interface AppointmentDto {
  id: number;
  appointmentDateTime: string;
  status: AppointmentStatusCode | null;
  message: string | null;
  cancellationReason: string | null;
  patientId: number;
  patientFirstName: string | null;
  patientLastName: string | null;
  patientPregnancyWeek: string | null;
  patientPhotoUrl: string | null;
  providerId: number;
  providerFirstName: string | null;
  providerLastName: string | null;
  providerSpecialization: string | null;
  providerLocation: string | null;
  providerPhotoUrl: string | null;
  serviceName: string;
  durationMinutes: number;
  price: number | null;
}

export interface ProviderStats {
  pendingCount: number;
  confirmedCount: number;
  todayCount: number;
}

interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

const fetchAllPages = async (url: string): Promise<AppointmentDto[]> => {
  const all: AppointmentDto[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data } = await api.get<Page<AppointmentDto>>(url, {
      params: { page, size: PAGE_SIZE },
    });
    all.push(...data.content);
    if (data.last) break;
  }
  return all;
};

export const getProviderStats = async (): Promise<ProviderStats> => {
  const { data } = await api.get<ProviderStats>("/appointments/provider/stats");
  return data;
};

export const getProviderAppointments = () =>
  fetchAllPages("/appointments/provider");

export const getPatientAppointments = () =>
  fetchAllPages("/appointments/patient");

export const confirmProviderAppointment = async (
  id: number,
  message?: string,
): Promise<AppointmentDto> => {
  const { data } = await api.patch<AppointmentDto>(
    `/appointments/provider/${id}/confirm`,
    message ? { message } : undefined,
  );
  return data;
};

export const cancelProviderAppointment = async (
  id: number,
  cancellationReason: string,
  message?: string,
): Promise<void> => {
  await api.delete(`/appointments/provider/${id}`, {
    data: { cancellationReason, message: message || null },
  });
};
