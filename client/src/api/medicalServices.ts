import { api } from "./axios";
import { isAxiosError } from "axios";

export interface MedicalService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
  providerId: number;
}

export interface MedicalServicePayload {
  name: string;
  durationMinutes: number;
  price: number;
}

interface ServicePage {
  content: MedicalService[];
  last: boolean;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

export const getMyMedicalServices = async (): Promise<MedicalService[]> => {
  const services: MedicalService[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data } = await api.get<ServicePage>("/services/my", {
      params: { page, size: PAGE_SIZE },
    });
    services.push(...data.content);
    if (data.last) break;
  }
  return services;
};

export const createMedicalService = async (
  payload: MedicalServicePayload,
): Promise<MedicalService> => {
  const { data } = await api.post<MedicalService>("/services", payload);
  return data;
};

export const updateMedicalService = async (
  id: number,
  payload: MedicalServicePayload,
): Promise<MedicalService> => {
  try {
    const { data } = await api.put<MedicalService>(`/services/${id}`, payload);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new Error(
        "The server could not find this service for your provider account. Check that the service still exists and that the deployed API supports PUT /services/{id}.",
        { cause: error },
      );
    }
    throw error;
  }
};

export const deleteMedicalService = async (id: number): Promise<void> => {
  await api.delete(`/services/${id}`);
};
