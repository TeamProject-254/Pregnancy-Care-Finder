import { isAxiosError } from "axios";
import { api } from "./axios";
import type { PublicProviderDetail } from "./providers";

export interface ProviderAvailability {
  id: number;
  providerId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "FREE" | "BOOKED" | "BLOCKED";
}

export interface AvailabilityPayload {
  date: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityPage {
  content: ProviderAvailability[];
  last: boolean;
}

export interface ProviderAvailabilityResult {
  availabilities: ProviderAvailability[];
  canManage: boolean;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

export const getProviderAvailabilities = async (): Promise<ProviderAvailabilityResult> => {
  const availabilities: ProviderAvailability[] = [];

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const { data } = await api.get<AvailabilityPage>("/availabilities", {
        params: { page, size: PAGE_SIZE, sort: "date,asc" },
      });
      availabilities.push(...data.content);
      if (data.last) break;
    }
    return { availabilities, canManage: true };
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;

    const { data: profile } = await api.get<{ id: number }>("/providers/profile");
    const { data: provider } = await api.get<PublicProviderDetail>(`/providers/${profile.id}`);
    return {
      availabilities: provider.availabilities,
      canManage: false,
    };
  }
};

export const createProviderAvailability = async (
  payload: AvailabilityPayload,
): Promise<ProviderAvailability> => {
  const { data } = await api.post<ProviderAvailability>("/availabilities", payload);
  return data;
};

export const deleteProviderAvailability = async (id: number): Promise<void> => {
  await api.delete(`/availabilities/${id}`);
};
