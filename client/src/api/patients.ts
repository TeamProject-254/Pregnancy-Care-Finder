import { api } from "./axios";

export interface PatientProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  location: string;
  languages: string[];
  pregnancyWeek: number;
  explicitConsent: boolean;
  photoUrl?: string | null;
}

export const getMyPatientProfile = async (): Promise<PatientProfileDto> => {
  const { data } = await api.get<PatientProfileDto>("/patients/profile");
  return data;
};
