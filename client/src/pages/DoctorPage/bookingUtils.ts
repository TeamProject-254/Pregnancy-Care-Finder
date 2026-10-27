import type { PublicAvailability } from "../../api/providers";

const SLOT_GRID_MINUTES = 15;

const pad = (value: number) => String(value).padStart(2, "0");

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const minutesToTime = (minutes: number): string => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const formatTime12 = (time: string): string => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${pad(hour)}:${pad(m)} ${suffix}`;
};

const parseDate = (date: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const dateChipParts = (date: string) => {
  const d = parseDate(date);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: String(d.getDate()),
  };
};

export const formatLongDateTime = (date: string, time: string): string => {
  const d = parseDate(date);
  const label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  return `${label}, ${time}`;
};

const todayString = (now: Date) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export interface BusyInterval {
  date: string;
  start: number;
  end: number;
}

export const busyIntervalFrom = (appointmentDateTime: string, durationMinutes: number): BusyInterval => {
  const [date, time = "00:00"] = appointmentDateTime.split("T");
  const start = toMinutes(time.slice(0, 5));
  return { date, start, end: start + durationMinutes };
};

export const buildSlotsByDate = (
  availabilities: PublicAvailability[],
  durationMinutes: number,
  now: Date,
  busy: BusyInterval[] = [],
): Record<string, string[]> => {
  const result: Record<string, Set<string>> = {};
  const today = todayString(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const duration = Math.max(durationMinutes, 1);

  availabilities.forEach((slot) => {
    if (slot.status !== "FREE" || slot.date < today) return;
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);
    const firstStart = (Math.floor(start / SLOT_GRID_MINUTES) + 1) * SLOT_GRID_MINUTES;
    for (let from = firstStart; from + duration < end; from += SLOT_GRID_MINUTES) {
      if (slot.date === today && from <= nowMinutes) continue;
      const overlapsBusy = busy.some(
        (interval) => interval.date === slot.date && from < interval.end && from + duration > interval.start,
      );
      if (overlapsBusy) continue;
      (result[slot.date] ??= new Set()).add(minutesToTime(from));
    }
  });

  return Object.fromEntries(
    Object.entries(result)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, times]) => [date, Array.from(times).sort()]),
  );
};

export const cityFromAddress = (address: string | null): string => {
  if (!address) return "";
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

export const formatPrice = (price: number) => `${Number(price)}$`;
