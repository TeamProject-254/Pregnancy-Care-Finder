import { api } from "./axios";

export interface PublicProvider {
  id: number;
  firstName: string;
  lastName: string;
  professionalRole: string | null;
  yearsOfExperience: number | null;
  contactPhone: string | null;
  address: string | null;
  specialization: string | null;
  description: string | null;
  languages: string[] | null;
  photoUrl: string | null;
  published?: boolean;
}

export interface PublicService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
  providerId: number;
}

export interface PublicAvailability {
  id: number;
  providerId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "FREE" | "BOOKED" | "BLOCKED";
}

export interface PublicProviderDetail extends PublicProvider {
  services: PublicService[];
  availabilities: PublicAvailability[];
}

export const getPublicProvider = async (id: string): Promise<PublicProviderDetail> => {
  const { data } = await api.get<PublicProviderDetail>(`/providers/${id}`);
  return data;
};

export interface CreateAppointmentPayload {
  providerId: number;
  serviceId: number;
  appointmentDateTime: string;
}

export const createAppointment = async (payload: CreateAppointmentPayload): Promise<void> => {
  await api.post("/appointments", payload);
};
