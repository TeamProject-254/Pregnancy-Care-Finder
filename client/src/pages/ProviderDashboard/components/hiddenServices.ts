import {
  deleteMedicalService,
  type MedicalService,
  type MedicalServicePayload,
} from "../../../api/medicalServices";

export interface HiddenService extends MedicalServicePayload {
  id: string;
}

const storageKey = (owner: string) => `provider-hidden-services:${owner}`;

const isHiddenService = (value: unknown): value is HiddenService => {
  const item = value as Partial<HiddenService> | null;
  return Boolean(item)
    && typeof item?.id === "string"
    && typeof item.name === "string"
    && typeof item.durationMinutes === "number"
    && typeof item.price === "number";
};

export const readHiddenServices = (owner: string): HiddenService[] => {
  try {
    const saved = localStorage.getItem(storageKey(owner));
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter(isHiddenService) : [];
  } catch {
    return [];
  }
};

export const writeHiddenServices = (owner: string, services: HiddenService[]) => {
  try {
    localStorage.setItem(storageKey(owner), JSON.stringify(services));
  } catch {
    return;
  }
};

export const toHiddenService = (payload: MedicalServicePayload): HiddenService => ({
  id: `hidden-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: payload.name,
  durationMinutes: payload.durationMinutes,
  price: payload.price,
});

export const hideMedicalService = async (owner: string, service: MedicalService) => {
  await deleteMedicalService(service.id);
  const hidden = toHiddenService(service);
  writeHiddenServices(owner, [...readHiddenServices(owner), hidden]);
  return hidden;
};
