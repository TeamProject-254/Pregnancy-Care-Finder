import { api } from "./axios";
import type {
  ProviderSearchParams,
  ProviderSummaryResponse,
} from "./../types/filters";

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

export const getPublicProvider = async (
  id: string,
): Promise<PublicProviderDetail> => {
  const { data } = await api.get<PublicProviderDetail>(`/providers/${id}`);
  return data;
};

export interface ProviderProfileDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  professionalRole: string | null;
  yearsOfExperience: number | null;
  contactPhone: string | null;
  address: string | null;
  specialization: string | null;
  description: string | null;
  languages: string[] | null;
  photoUrl: string | null;
  published: boolean;
}

export interface ProviderProfilePayload {
  firstName: string;
  lastName: string;
  professionalRole: string;
  yearsOfExperience: number;
  contactPhone: string;
  address: string;
  specialization: string;
  description: string;
  languages: string[];
  photoUrl: string | null;
}

export const getMyProviderProfile = async (): Promise<ProviderProfileDto> => {
  const { data } = await api.get<ProviderProfileDto>("/providers/profile");
  return data;
};

export const createMyProviderProfile = async (
  payload: ProviderProfilePayload,
): Promise<ProviderProfileDto> => {
  const { data } = await api.post<ProviderProfileDto>("/providers/profile", {
    ...payload,
    accurateInfoConsent: true,
  });
  return data;
};

export const updateMyProviderProfile = async (
  payload: Partial<ProviderProfilePayload> & { published?: boolean },
): Promise<ProviderProfileDto> => {
  const { data } = await api.patch<ProviderProfileDto>("/providers/profile", payload);
  return data;
};

export const searchProviders = async (
  filters: ProviderSearchParams = {},
): Promise<ProviderSummaryResponse[]> => {
  const cleanParams = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }),
  );

  const response = await api.get<ProviderSummaryResponse[]>(
    "/providers/search",
    {
      params: cleanParams,
      paramsSerializer: {
        indexes: null,
      },
    },
  );

  return response.data;
};
