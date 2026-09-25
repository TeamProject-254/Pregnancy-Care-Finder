export interface Doctor {
  id: string | number;
  name: string;
  photoUrl: string;
  specialty: string;
  isVerified: boolean;
  experience: string;
  location: string;
  rating: number;
  reviewsCount: number;
  languages: string[];
  price: string;
  about: string;
  expertise: string[];
  availabilitySlots: string[];
}

export interface Review {
  id: number;
  name: string;
  date: string;
  rating: string;
  text: string;
}