import type { PublicAvailability, PublicProvider, PublicService } from "../../api/providers";
import blankProfilePicture from "../../assets/img/blank-profile-picture-973460_1280.png";

export interface DoctorData {
  provider: PublicProvider;
  services: PublicService[];
  availabilities: PublicAvailability[];
  isDemo: boolean;
}

interface MockProfile {
  firstName: string;
  lastName: string;
  specialization: string;
  yearsOfExperience: number;
  address: string;
  languages: string[];
  description: string;
  services: Array<{ name: string; durationMinutes: number; price: number }>;
}

const MOCK_PROFILES: Record<string, MockProfile> = {
  "1": {
    firstName: "Sarah",
    lastName: "Mitchell",
    specialization: "Obstetrician-Gynecologist",
    yearsOfExperience: 12,
    address: "Medclinic, 34 Shevchenko street, Kyiv",
    languages: ["English", "Polish"],
    description:
      "Pregnancy should be a time of joyful expectation, not medical anxiety. I combine evidence-based medicine with gentle care to make your journey safe, predictable, and stress-free.",
    services: [
      { name: "Pregnancy consultation", durationMinutes: 45, price: 40 },
      { name: "High-risk pregnancy care", durationMinutes: 60, price: 70 },
      { name: "1st-3rd trimester ultrasound", durationMinutes: 30, price: 45 },
    ],
  },
  "2": {
    firstName: "Olena",
    lastName: "Kovalenko",
    specialization: "Obstetrician-Gynecologist",
    yearsOfExperience: 10,
    address: "Mama Clinic, 12 Florianska street, Krakow",
    languages: ["English", "Ukrainian"],
    description:
      "Specialist in prenatal ultrasound and maternal-fetal medicine. I focus on clear explanations so every visit leaves you calm and informed.",
    services: [
      { name: "Prenatal ultrasound", durationMinutes: 30, price: 45 },
      { name: "Pregnancy consultation", durationMinutes: 45, price: 45 },
    ],
  },
  "3": {
    firstName: "Marta",
    lastName: "Nowak",
    specialization: "Obstetrician-Gynecologist",
    yearsOfExperience: 6,
    address: "Baltic Women's Health, 5 Dluga street, Gdansk",
    languages: ["English", "Polish", "Ukrainian"],
    description:
      "Dedicated obstetrician providing gentle and focused care throughout all trimesters, from the first visit to postpartum follow-up.",
    services: [
      { name: "Pregnancy consultation", durationMinutes: 45, price: 40 },
      { name: "Postpartum follow-up", durationMinutes: 30, price: 35 },
    ],
  },
  "4": {
    firstName: "Anna",
    lastName: "Wisniewska",
    specialization: "Obstetrician-Gynecologist",
    yearsOfExperience: 12,
    address: "Central Clinic, 20 Rynek, Wroclaw",
    languages: ["English", "Polish"],
    description:
      "Senior gynecologist focusing on high-risk cases and comprehensive screenings, with a calm and respectful approach.",
    services: [
      { name: "High-risk pregnancy care", durationMinutes: 60, price: 60 },
      { name: "Screening consultation", durationMinutes: 45, price: 45 },
    ],
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

const buildAvailabilities = (providerId: number): PublicAvailability[] => {
  const result: PublicAvailability[] = [];
  const base = new Date();
  for (let offset = 0; offset < 28 && result.length < 14; offset += 1) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    result.push({
      id: result.length + 1,
      providerId,
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      startTime: "09:00:00",
      endTime: "14:00:00",
      status: "FREE",
    });
  }
  return result;
};

export const getMockDoctor = (id: string): DoctorData | null => {
  const profile = MOCK_PROFILES[id];
  if (!profile) return null;
  const providerId = Number(id);

  return {
    isDemo: true,
    provider: {
      id: providerId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      professionalRole: "Doctor",
      yearsOfExperience: profile.yearsOfExperience,
      contactPhone: "+380 00 000 00 00",
      address: profile.address,
      specialization: profile.specialization,
      description: profile.description,
      languages: profile.languages,
      photoUrl: blankProfilePicture,
    },
    services: profile.services.map((service, index) => ({
      id: providerId * 100 + index + 1,
      providerId,
      ...service,
    })),
    availabilities: buildAvailabilities(providerId),
  };
};
