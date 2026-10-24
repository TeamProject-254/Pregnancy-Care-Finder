import { isAxiosError } from "axios";
import type { AppointmentDto, AppointmentStatusCode } from "../../../api/appointments";
import type { StatusOverrides } from "./appointmentStatusStore";

export type AppointmentStatusLabel =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled by patient"
  | "Cancelled by Doctor";

export type AppointmentTab = "Upcoming" | "Past" | "Cancelled";

export interface AppointmentItem {
  id: number;
  start: Date;
  date: string;
  time: string;
  longDateTime: string;
  patientName: string;
  patientPhotoUrl: string | null;
  pregnancyWeek: string;
  service: string;
  durationMinutes: number;
  duration: string;
  location: string;
  price: string;
  status: AppointmentStatusLabel;
  statusCode: AppointmentStatusCode;
  cancellationReason: string;
  message: string;
}

export const CANCEL_REASONS = [
  "Doctor unavailable",
  "Rescheduling needed",
  "Schedule conflict",
  "Other",
] as const;

const STATUS_LABELS: Record<AppointmentStatusCode, AppointmentStatusLabel> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED_BY_PATIENT: "Cancelled by patient",
  CANCELLED_BY_PROVIDER: "Cancelled by Doctor",
};

export const isCancelledCode = (code: AppointmentStatusCode) =>
  code === "CANCELLED_BY_PATIENT" || code === "CANCELLED_BY_PROVIDER";

const parseLocalDateTime = (value: string): Date => {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
};

export const partitionProviderAppointments = (
  appointments: AppointmentDto[],
  overrides: StatusOverrides = {},
  now = new Date(),
) => {
  const upcoming: AppointmentDto[] = [];
  const past: AppointmentDto[] = [];
  const cancelled: AppointmentDto[] = [];

  appointments.forEach((appointment) => {
    const override = overrides[String(appointment.id)];
    const status = appointment.status ?? override;
    const isCancelled = status?.startsWith("CANCELLED")
      || (!status && Boolean(appointment.cancellationReason));

    if (isCancelled) {
      cancelled.push(appointment);
    } else if (parseLocalDateTime(appointment.appointmentDateTime) < now) {
      past.push(appointment);
    } else {
      upcoming.push(appointment);
    }
  });

  return { upcoming, past, cancelled };
};

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const longDate = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });
const hourMinute = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

const formatWeek = (week: string | null): string => {
  const trimmed = week?.toString().trim();
  if (!trimmed) return "Week not shared";
  return /^\d+$/.test(trimmed) ? `Week ${trimmed}` : trimmed;
};

const resolveStatusCode = (
  dto: AppointmentDto,
  overrides: StatusOverrides,
  fromCancelledList: boolean,
): AppointmentStatusCode => {
  const direct =
    dto.status ?? (dto as unknown as { appointmentStatus?: AppointmentStatusCode }).appointmentStatus;
  if (direct) return direct;
  const override = overrides[String(dto.id)];
  if (override) return override;
  if (fromCancelledList) return dto.cancellationReason ? "CANCELLED_BY_PROVIDER" : "CANCELLED_BY_PATIENT";
  return "PENDING";
};

export const toAppointmentItem = (
  dto: AppointmentDto,
  overrides: StatusOverrides = {},
  fromCancelledList = false,
): AppointmentItem => {
  const start = parseLocalDateTime(dto.appointmentDateTime);
  const code = resolveStatusCode(dto, overrides, fromCancelledList);
  const name = [dto.patientFirstName, dto.patientLastName].filter(Boolean).join(" ").trim();

  return {
    id: dto.id,
    start,
    date: shortDate.format(start),
    time: hourMinute.format(start),
    longDateTime: `${longDate.format(start)}, ${hourMinute.format(start)}`,
    patientName: name || "Patient",
    patientPhotoUrl: dto.patientPhotoUrl,
    pregnancyWeek: formatWeek(dto.patientPregnancyWeek),
    service: dto.serviceName,
    durationMinutes: dto.durationMinutes,
    duration: `${dto.durationMinutes} min`,
    location: dto.providerLocation || "Location not specified",
    price: dto.price === null || dto.price === undefined ? "—" : `${Number(dto.price)}$`,
    status: STATUS_LABELS[code] ?? "Pending",
    statusCode: code,
    cancellationReason: dto.cancellationReason ?? "",
    message: dto.message ?? "",
  };
};

export const buildTabs = (
  upcoming: AppointmentDto[],
  past: AppointmentDto[],
  cancelled: AppointmentDto[],
  overrides: StatusOverrides = {},
): Record<AppointmentTab, AppointmentItem[]> => {
  const byStart = (a: AppointmentItem, b: AppointmentItem) => a.start.getTime() - b.start.getTime();

  const cancelledIds = new Set(cancelled.map((dto) => dto.id));
  const seen = new Set<number>();
  const keep = (list: AppointmentDto[]) =>
    list
      .filter((dto) => !cancelledIds.has(dto.id))
      .map((dto) => toAppointmentItem(dto, overrides))
      .filter((item) => !isCancelledCode(item.statusCode) && !seen.has(item.id) && seen.add(item.id));

  const upcomingItems = keep(upcoming).sort(byStart);
  const pastItems = keep(past)
    .map((item) =>
      item.statusCode === "CONFIRMED"
        ? { ...item, status: "Completed" as const, statusCode: "COMPLETED" as const }
        : item,
    )
    .sort((a, b) => byStart(b, a));
  const cancelledItems = cancelled
    .map((dto) => toAppointmentItem(dto, overrides, true))
    .sort((a, b) => byStart(b, a));

  return { Upcoming: upcomingItems, Past: pastItems, Cancelled: cancelledItems };
};

export type DateFilter = "All dates" | "Today" | "This week" | "This month";
export const DATE_FILTERS: DateFilter[] = ["All dates", "Today", "This week", "This month"];

export const matchesDateFilter = (start: Date, filter: DateFilter, now = new Date()): boolean => {
  if (filter === "All dates") return true;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = startOfDay(start).getTime();
  const today = startOfDay(now);

  if (filter === "Today") return day === today.getTime();
  if (filter === "This week") {
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
    const nextMonday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
    return day >= monday.getTime() && day < nextMonday.getTime();
  }
  return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
};

export const requestErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) return fallback;
  if (error.response?.status === 403) {
    return "Access denied (403). This dashboard requires a provider account. Sign in with the provider account and try again.";
  }
  if (error.response?.status === 401) {
    return "Your session has expired. Sign in again.";
  }
  const data = error.response?.data as { message?: string; error?: string } | undefined;
  return data?.message || data?.error || fallback;
};
