export interface UserProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  languages: string[];
  pregnancyWeek: number;
}

export interface DoctorInfo {
  name: string;
  speciality: string;
}

export interface NextAppointment {
  id: string;
  doctor: DoctorInfo;
  procedure: string;
  date: string;
  location: string;
}

export type AppointmentType = 'upcoming' | 'past';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface AppointmentItem {
  id: string;
  type: AppointmentType;
  date: string;
  time: string;
  doctorName: string;
  speciality: string;
  status: AppointmentStatus;
}

export interface DashboardData {
  user: UserProfile;
  nextAppointment: NextAppointment;
  appointments: AppointmentItem[];
}