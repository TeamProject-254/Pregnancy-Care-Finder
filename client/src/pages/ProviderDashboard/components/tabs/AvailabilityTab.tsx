import { useState } from "react";
import { isAxiosError } from "axios";
import editIcon from "../../../../assets/img/edit-icon.svg";
import calendarIcon from "../../../../assets/img/calendar-icon.svg";
import trashIcon from "../../../../assets/img/trash-icon.svg";
import {
  createProviderAvailability,
  deleteProviderAvailability,
  type ProviderAvailability,
} from "../../../../api/availabilities";
import { weeklySchedule } from "../availabilitySummary";
import { SelectDropdown } from "../../../../components/SelectDropdown/SelectDropdown";
import styles from "./AvailabilityTab.module.scss";

interface TimeInterval {
  id: number;
  start: string;
  end: string;
}

interface ScheduleDay {
  weekday: number;
  name: string;
  active: boolean;
  intervals: TimeInterval[];
}

interface BlockedPeriod {
  id: number;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  reason: string;
}

interface SavedSchedule {
  days: ScheduleDay[];
  blocked: BlockedPeriod[];
}

interface Props {
  availabilities: ProviderAvailability[];
  isLoading: boolean;
  loadError: string;
  canManage: boolean;
  scheduleStorageKey: string;
  onAvailabilityChange: (availabilities: ProviderAvailability[]) => void;
  onRetry: () => void;
}

const WEEKDAYS: ScheduleDay[] = [
  { weekday: 1, name: "Monday", active: true, intervals: [{ id: 1, start: "09:00", end: "17:00" }] },
  { weekday: 2, name: "Tuesday", active: true, intervals: [{ id: 2, start: "09:00", end: "17:00" }] },
  { weekday: 3, name: "Wednesday", active: true, intervals: [{ id: 3, start: "09:00", end: "13:00" }, { id: 4, start: "14:00", end: "17:00" }] },
  { weekday: 4, name: "Thursday", active: true, intervals: [{ id: 5, start: "09:00", end: "17:00" }] },
  { weekday: 5, name: "Friday", active: true, intervals: [{ id: 6, start: "09:00", end: "17:00" }] },
  { weekday: 6, name: "Saturday", active: false, intervals: [] },
  { weekday: 0, name: "Sunday", active: false, intervals: [] },
];

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const scheduleKey = (providerKey: string) => `provider-availability-schedule:${providerKey}`;

const readLocalSchedule = (providerKey: string): SavedSchedule | null => {
  try {
    const saved = localStorage.getItem(scheduleKey(providerKey));
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Partial<SavedSchedule>;
    if (!Array.isArray(parsed.days) || !Array.isArray(parsed.blocked)) return null;
    return { days: parsed.days, blocked: parsed.blocked };
  } catch {
    return null;
  }
};

const scheduleFromServer = (availabilities: ProviderAvailability[]): ScheduleDay[] | null => {
  const schedule = weeklySchedule(availabilities);
  if (schedule.size === 0) return null;
  return WEEKDAYS.map((day) => {
    const ranges = schedule.get(day.weekday);
    return {
      ...day,
      active: Boolean(ranges),
      intervals: ranges
        ? ranges.map((range, index) => ({ id: day.weekday * 100 + index, start: range.start, end: range.end }))
        : [],
    };
  });
};

const readSavedSchedule = (providerKey: string, availabilities: ProviderAvailability[]): SavedSchedule => {
  const local = readLocalSchedule(providerKey);
  const blocked = (local?.blocked ?? []).filter((period) => period.date >= today());
  return {
    days: scheduleFromServer(availabilities) ?? local?.days ?? WEEKDAYS,
    blocked,
  };
};

const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const availabilityKey = (slot: Pick<ProviderAvailability, "date" | "startTime" | "endTime">) =>
  `${slot.date}|${slot.startTime.slice(0, 5)}|${slot.endTime.slice(0, 5)}`;

const errorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || "Unable to save availability. Please try again.";
  }
  return error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
    .format(new Date(`${date}T00:00:00`));

const getDesiredSlots = (days: ScheduleDay[], blocked: BlockedPeriod[]) => {
  const desired: Array<{ date: string; startTime: string; endTime: string }> = [];
  const base = new Date(`${today()}T00:00:00`);

  for (let offset = 0; offset < 28; offset += 1) {
    const current = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
    const date = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    const day = days.find((item) => item.weekday === current.getDay() && item.active);
    if (!day) continue;

    const dayBlocks = blocked.filter((item) => item.date === date);
    if (dayBlocks.some((item) => item.allDay)) continue;

    for (const interval of day.intervals) {
      const start = timeToMinutes(interval.start);
      const end = timeToMinutes(interval.end);
      let segments: Array<[number, number]> = [[start, end]];

      for (const block of dayBlocks) {
        const blockStart = timeToMinutes(block.startTime);
        const blockEnd = timeToMinutes(block.endTime);
        segments = segments.flatMap(([segmentStart, segmentEnd]) => {
          if (blockEnd <= segmentStart || blockStart >= segmentEnd) return [[segmentStart, segmentEnd]];
          const pieces: Array<[number, number]> = [];
          if (blockStart > segmentStart) pieces.push([segmentStart, blockStart]);
          if (blockEnd < segmentEnd) pieces.push([blockEnd, segmentEnd]);
          return pieces;
        });
      }

      segments.forEach(([segmentStart, segmentEnd]) => {
        if (segmentEnd > segmentStart) {
          desired.push({ date, startTime: minutesToTime(segmentStart), endTime: minutesToTime(segmentEnd) });
        }
      });
    }
  }

  return desired;
};

export const AvailabilityTab = ({
  availabilities,
  isLoading,
  loadError,
  canManage,
  scheduleStorageKey,
  onAvailabilityChange,
  onRetry,
}: Props) => {
  const [savedSchedule, setSavedSchedule] = useState(() => readSavedSchedule(scheduleStorageKey, availabilities));
  const [days, setDays] = useState(savedSchedule.days);
  const [blocked, setBlocked] = useState(savedSchedule.blocked);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const updateDay = (weekday: number, update: (day: ScheduleDay) => ScheduleDay) =>
    setDays((current) => current.map((day) => day.weekday === weekday ? update(day) : day));

  const addInterval = (weekday: number) => updateDay(weekday, (day) => ({
    ...day,
    intervals: [...day.intervals, { id: Date.now(), start: "09:00", end: "17:00" }],
  }));

  const updateInterval = (weekday: number, id: number, key: "start" | "end", value: string) =>
    updateDay(weekday, (day) => ({
      ...day,
      intervals: day.intervals.map((interval) => interval.id === id ? { ...interval, [key]: value } : interval),
    }));

  const removeInterval = (weekday: number, id: number) => updateDay(weekday, (day) => ({
    ...day,
    intervals: day.intervals.filter((interval) => interval.id !== id),
  }));

  const addBlockedPeriod = () => {
    setBlocked((current) => [...current, {
      id: Date.now(),
      date: today(),
      allDay: true,
      startTime: "09:00",
      endTime: "17:00",
      reason: "Unavailable",
    }]);
  };

  const updateBlockedPeriod = (id: number, update: Partial<BlockedPeriod>) =>
    setBlocked((current) => current.map((period) => period.id === id ? { ...period, ...update } : period));

  const cancelScheduleChanges = () => {
    setDays(savedSchedule.days);
    setBlocked(savedSchedule.blocked);
    setError("");
  };

  const saveSchedule = async () => {
    setError("");
    for (const day of days.filter((item) => item.active)) {
      const intervals = [...day.intervals].sort((a, b) => a.start.localeCompare(b.start));
      for (let index = 0; index < intervals.length; index += 1) {
        if (intervals[index].start >= intervals[index].end) {
          setError(`${day.name}: end time must be later than start time.`);
          return;
        }
        if (index > 0 && intervals[index - 1].end > intervals[index].start) {
          setError(`${day.name}: working intervals cannot overlap.`);
          return;
        }
      }
    }

    for (const period of blocked) {
      if (!period.allDay && period.startTime >= period.endTime) {
        setError("End time for a blocked period must be later than its start time.");
        return;
      }
    }

    if (!canManage) {
      setError("This server currently does not allow saving availability slots. Your weekly schedule was not saved.");
      return;
    }

    setIsSaving(true);
    let currentSlots = [...availabilities];
    try {
      const desired = getDesiredSlots(days, blocked);
      const desiredKeys = new Set(desired.map(availabilityKey));
      const firstDate = today();
      const lastDateObj = new Date(`${firstDate}T00:00:00`);
      lastDateObj.setDate(lastDateObj.getDate() + 27);
      const lastDate = `${lastDateObj.getFullYear()}-${String(lastDateObj.getMonth() + 1).padStart(2, "0")}-${String(lastDateObj.getDate()).padStart(2, "0")}`;
      const obsolete = currentSlots.filter((slot) =>
        slot.status === "FREE"
        && slot.date >= firstDate
        && slot.date <= lastDate
        && !desiredKeys.has(availabilityKey(slot)),
      );

      for (const slot of obsolete) {
        await deleteProviderAvailability(slot.id);
        currentSlots = currentSlots.filter((item) => item.id !== slot.id);
        onAvailabilityChange(currentSlots);
      }

      for (const desiredSlot of desired) {
        const key = availabilityKey(desiredSlot);
        if (currentSlots.some((slot) => availabilityKey(slot) === key)) continue;
        const created = await createProviderAvailability(desiredSlot);
        currentSlots = [...currentSlots, created];
        onAvailabilityChange(currentSlots);
      }

      localStorage.setItem(scheduleKey(scheduleStorageKey), JSON.stringify({ days, blocked }));
      setSavedSchedule({ days, blocked });
      setError("");
    } catch (saveError) {
      setError(`${errorMessage(saveError)} Any slots already saved have been kept; retry to finish syncing the schedule.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Availability</h2>
      <p className={styles.subtitle}>Set your regular working hours and block dates when you are unavailable</p>

      {!canManage && !loadError && (
        <div className={styles.warning} role="status">
          This server does not allow saving availability yet. Your weekly schedule is shown in read-only mode.
        </div>
      )}
      {error && <div className={styles.error} role="alert">{error}</div>}
      {loadError && (
        <div className={styles.error} role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      )}

      <h3 className={`${styles.sectionTitle} ${styles.weeklyHeading}`}>Weekly schedule</h3>
      <p className={`${styles.sectionDescription} ${styles.weeklyHeading}`}>Patients can book available times during these hours.</p>

      <div className={styles.weekSchedule}>
        {days.map((day) => (
          <div
            className={`${styles.dayRow} ${expandedDay === day.weekday ? styles.dayRowExpanded : ""}`}
            key={day.weekday}
          >
            <strong className={styles.dayName}>{day.name}</strong>
            <label className={styles.switch} aria-label={`${day.active ? "Disable" : "Enable"} ${day.name}`}>
              <input
                type="checkbox"
                checked={day.active}
                onChange={(event) => updateDay(day.weekday, (current) => ({ ...current, active: event.target.checked }))}
              />
              <span />
            </label>
            <span className={styles.daySummary}>
              {day.active && day.intervals.length
                ? day.intervals.map((interval) => <span key={interval.id}>{interval.start} - {interval.end}</span>)
                : <span>Unavailable</span>}
            </span>
            <div className={styles.intervals}>
              {day.active ? day.intervals.map((interval) => (
                <div className={styles.interval} key={interval.id}>
                  <input type="time" value={interval.start} onChange={(event) => updateInterval(day.weekday, interval.id, "start", event.target.value)} aria-label={`${day.name} start time`} />
                  <span>to</span>
                  <input type="time" value={interval.end} onChange={(event) => updateInterval(day.weekday, interval.id, "end", event.target.value)} aria-label={`${day.name} end time`} />
                  {day.intervals.length > 1 && (
                    <button type="button" className={styles.iconButton} onClick={() => removeInterval(day.weekday, interval.id)} aria-label={`Remove ${day.name} interval`}>
                      <img src={trashIcon} alt="" />
                    </button>
                  )}
                </div>
              )) : <span className={styles.unavailable}>Unavailable</span>}
            </div>
            {day.active && (
              <button type="button" className={styles.addInterval} onClick={() => addInterval(day.weekday)}>
                + Add interval
              </button>
            )}
            {day.active && (
              <button type="button" className={styles.dayDelete} onClick={() => updateDay(day.weekday, (current) => ({ ...current, active: false }))} aria-label={`Disable ${day.name}`}>
                <img src={trashIcon} alt="" />
              </button>
            )}
            <button
              type="button"
              className={styles.dayExpand}
              aria-label={`${expandedDay === day.weekday ? "Hide" : "Edit"} ${day.name} hours`}
              aria-expanded={expandedDay === day.weekday}
              onClick={() => setExpandedDay((current) => current === day.weekday ? null : day.weekday)}
            >
              <img src={editIcon} alt="" />
            </button>
          </div>
        ))}
      </div>

      <section className={styles.blockSection}>
        <h3 className={styles.sectionTitle}>Blocked dates and times</h3>
        <p className={styles.sectionDescription}>Add time off, holidays, or other unavailable periods.</p>
        <div className={styles.blockedList}>
            {blocked.map((period) => (
              <div className={`${styles.blockedRow} ${period.allDay ? "" : styles.blockedRowTimed}`} key={period.id}>
                <label className={styles.blockDate}>
                  <img src={calendarIcon} alt="" />
                  <input
                    type="date"
                    min={today()}
                    value={period.date}
                    onChange={(event) => updateBlockedPeriod(period.id, { date: event.target.value })}
                    aria-label="Blocked date"
                  />
                </label>
                <SelectDropdown
                  variant="small"
                  className={styles.blockRange}
                  ariaLabel="Blocked time range"
                  value={period.allDay ? "all-day" : "time"}
                  options={[
                    { value: "all-day", label: "All day" },
                    { value: "time", label: "Time range" },
                  ]}
                  onChange={(value) => updateBlockedPeriod(period.id, { allDay: value === "all-day" })}
                />
                {!period.allDay && (
                  <div className={styles.blockTimes}>
                    <input type="time" value={period.startTime} onChange={(event) => updateBlockedPeriod(period.id, { startTime: event.target.value })} aria-label="Blocked period start time" />
                    <span>–</span>
                    <input type="time" value={period.endTime} onChange={(event) => updateBlockedPeriod(period.id, { endTime: event.target.value })} aria-label="Blocked period end time" />
                  </div>
                )}
                <input
                  className={styles.reasonInput}
                  value={period.reason}
                  onChange={(event) => updateBlockedPeriod(period.id, { reason: event.target.value })}
                  placeholder="Unavailable"
                  aria-label="Reason"
                />
                <button type="button" className={styles.iconButton} onClick={() => setBlocked((current) => current.filter((item) => item.id !== period.id))} aria-label={`Remove blocked period on ${formatDate(period.date)}`}>
                  <img src={trashIcon} alt="" />
                </button>
              </div>
            ))}
        </div>
        <button type="button" className={styles.addBlocked} onClick={addBlockedPeriod}>
          + Add blocked date
        </button>
        <div className={styles.blockActions}>
          <button type="button" className={styles.cancelButton} onClick={cancelScheduleChanges} disabled={isSaving}>
            Cancel
          </button>
          <button type="button" className={styles.saveButton} onClick={() => void saveSchedule()} disabled={!canManage || isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </section>
    </section>
  );
};
