import type { ProviderAvailability } from "../../../api/availabilities";

export const WEEK = [
  { weekday: 1, short: "Mon", name: "Monday" },
  { weekday: 2, short: "Tue", name: "Tuesday" },
  { weekday: 3, short: "Wed", name: "Wednesday" },
  { weekday: 4, short: "Thu", name: "Thursday" },
  { weekday: 5, short: "Fri", name: "Friday" },
  { weekday: 6, short: "Sat", name: "Saturday" },
  { weekday: 0, short: "Sun", name: "Sunday" },
] as const;

const pad = (value: number) => String(value).padStart(2, "0");

const todayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const weekdayOf = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
};

export interface TimeRange {
  start: string;
  end: string;
}

export const weeklySchedule = (availabilities: ProviderAvailability[]): Map<number, TimeRange[]> => {
  const today = todayString();
  const byDate = new Map<string, TimeRange[]>();

  availabilities
    .filter((slot) => slot.status === "FREE" && slot.date >= today)
    .forEach((slot) => {
      const ranges = byDate.get(slot.date) ?? [];
      ranges.push({ start: slot.startTime.slice(0, 5), end: slot.endTime.slice(0, 5) });
      byDate.set(slot.date, ranges);
    });

  const votes = new Map<number, Map<string, { ranges: TimeRange[]; count: number }>>();
  byDate.forEach((ranges, date) => {
    const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
    const signature = sorted.map((range) => `${range.start}-${range.end}`).join("|");
    const weekday = weekdayOf(date);
    const weekdayVotes = votes.get(weekday) ?? new Map();
    const current = weekdayVotes.get(signature);
    weekdayVotes.set(signature, { ranges: sorted, count: (current?.count ?? 0) + 1 });
    votes.set(weekday, weekdayVotes);
  });

  return new Map(
    Array.from(votes.entries()).map(([weekday, weekdayVotes]) => {
      const [best] = Array.from(weekdayVotes.values()).sort((a, b) => b.count - a.count);
      return [weekday, best.ranges];
    }),
  );
};

export const weeklyHours = (availabilities: ProviderAvailability[]): Map<number, string[]> =>
  new Map(
    Array.from(weeklySchedule(availabilities).entries()).map(([weekday, ranges]) => [
      weekday,
      ranges.map((range) => `${range.start} - ${range.end}`),
    ]),
  );

export const summarizeAvailability = (availabilities: ProviderAvailability[]): string[] => {
  const hours = weeklyHours(availabilities);
  const groups: Array<{ from: string; to: string; ranges: string }> = [];
  let previousIndex = -2;

  WEEK.forEach((day, index) => {
    const ranges = hours.get(day.weekday);
    if (!ranges) return;
    const label = ranges.join(", ");
    const last = groups[groups.length - 1];
    if (last && last.ranges === label && previousIndex === index - 1) {
      last.to = day.name;
    } else {
      groups.push({ from: day.name, to: day.name, ranges: label });
    }
    previousIndex = index;
  });

  return groups.map((group) =>
    `${group.from === group.to ? group.from : `${group.from} - ${group.to}`}. ${group.ranges}`,
  );
};

export const mainWorkingHours = (availabilities: ProviderAvailability[]) => {
  const counts = new Map<string, number>();
  weeklyHours(availabilities).forEach((ranges) => {
    const first = ranges[0];
    counts.set(first, (counts.get(first) ?? 0) + 1);
  });
  const [range] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [];
  if (!range) return null;
  const [start, end] = range.split(" - ");
  return { start, end };
};
