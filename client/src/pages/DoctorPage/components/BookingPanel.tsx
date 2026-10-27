import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAppointment } from "../../../api/providers";
import { getPatientAppointments } from "../../../api/appointments";
import { useAuth } from "../../../context/AuthContext";
import blankProfilePicture from "../../../assets/img/blank-profile-picture-973460_1280.png";
import type { DoctorData } from "../mockDoctor";
import {
  busyIntervalFrom,
  buildSlotsByDate,
  type BusyInterval,
  dateChipParts,
  formatLongDateTime,
  formatPrice,
  formatTime12,
} from "../bookingUtils";
import { BookingDoneModal } from "./BookingDoneModal";
import { SelectDropdown } from "../../../components/SelectDropdown/SelectDropdown";
import { CalendarSmallIcon, ClockSmallIcon, PinIcon, ServiceIcon, WalletIcon } from "./DoctorIcons";
import { ReviewAppointmentModal } from "./ReviewAppointmentModal";
import { CloseIcon } from "../../ProviderDashboard/components/AppointmentIcons";
import styles from "../DoctorPage.module.scss";

const VISIBLE_DATES = 3;
const VISIBLE_TIMES = 6;

interface Props {
  data: DoctorData;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const BookingPanel = ({ data, isMobileOpen, onMobileClose }: Props) => {
  const { provider, services, availabilities, isDemo } = data;
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [now] = useState(() => new Date());

  const [serviceId, setServiceId] = useState<number | null>(services[0]?.id ?? null);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [showAllDates, setShowAllDates] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [bookedDateTime, setBookedDateTime] = useState("");

  const service = services.find((item) => item.id === serviceId) ?? null;
  const isProvider = user?.role === "PROVIDER";
  const isPatient = isAuthenticated && user?.role === "PATIENT";

  useEffect(() => {
    if (!isPatient || isDemo) return;
    let isCurrent = true;

    const loadBusy = async () => {
      try {
        const appointments = await getPatientAppointments();
        if (!isCurrent) return;
        setBusy(
          appointments
            .filter((appointment) => appointment.providerId === provider.id)
            .filter((appointment) => appointment.status === null || appointment.status === "PENDING" || appointment.status === "CONFIRMED")
            .map((appointment) => busyIntervalFrom(appointment.appointmentDateTime, appointment.durationMinutes)),
        );
      } catch {
        return;
      }
    };

    void loadBusy();
    return () => {
      isCurrent = false;
    };
  }, [isPatient, isDemo, provider.id]);

  const slotsByDate = useMemo(
    () => (service ? buildSlotsByDate(availabilities, service.durationMinutes, now, busy) : {}),
    [availabilities, service, now, busy],
  );
  const dates = Object.keys(slotsByDate);

  const date = pickedDate && slotsByDate[pickedDate] ? pickedDate : (dates[0] ?? null);
  const times = date ? slotsByDate[date] : [];
  const time = pickedTime && times.includes(pickedTime) ? pickedTime : null;

  const visibleDates = showAllDates ? dates : dates.slice(0, VISIBLE_DATES);
  const visibleTimes = showAllTimes ? times : times.slice(0, VISIBLE_TIMES);

  const doctorName = `Dr. ${provider.firstName} ${provider.lastName}`;
  const address = provider.address || "Location not specified";
  const longDateTime = date && time ? formatLongDateTime(date, time) : "";

  const handleServiceChange = (value: string) => {
    setServiceId(Number(value));
    setPickedDate(null);
    setPickedTime(null);
    setShowAllTimes(false);
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/doctors/${provider.id}` } });
      return;
    }
    setIsReviewOpen(true);
  };

  const handleConfirm = async () => {
    if (!service || !date || !time) return;
    if (isDemo) {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
    } else {
      await createAppointment({
        providerId: provider.id,
        serviceId: service.id,
        appointmentDateTime: `${date}T${time}:00`,
      });
    }
    setBookedDateTime(longDateTime);
    setBusy((current) => [...current, busyIntervalFrom(`${date}T${time}`, service.durationMinutes)]);
    setPickedTime(null);
    setIsReviewOpen(false);
    setIsDone(true);
  };

  const bookingBlockedReason = isProvider ? "Only patients can book appointments." : "";

  useEffect(() => {
    if (!isMobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isReviewOpen && !isDone) onMobileClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen, isReviewOpen, isDone, onMobileClose]);

  return (
    <>
      {isMobileOpen && <div className={styles.bookingBackdrop} onClick={onMobileClose} aria-hidden="true" />}
      <section
        className={`${styles.card} ${styles.booking} ${isMobileOpen ? styles.bookingOpen : ""}`}
        aria-labelledby="booking-title"
      >
        <div className={styles.bookingHeader}>
          <h2 id="booking-title" className={styles.cardTitle}>Book an appointment</h2>
          <button type="button" className={styles.bookingClose} onClick={onMobileClose} aria-label="Close booking">
            <CloseIcon />
          </button>
        </div>

        {services.length === 0 ? (
          <p className={styles.muted}>This doctor has not added any bookable services yet.</p>
        ) : (
          <>
            <h3 className={styles.step}>1. Service</h3>
            <SelectDropdown
              ariaLabel="Service"
              value={serviceId === null ? "" : String(serviceId)}
              placeholder="Select service"
              options={services.map((item) => ({
                value: String(item.id),
                label: `${item.name}, ${item.durationMinutes}min, ${formatPrice(item.price)}`,
              }))}
              onChange={handleServiceChange}
            />

            <h3 className={styles.step}>2. Date</h3>
            {dates.length === 0 ? (
              <p className={styles.muted}>No available dates at the moment.</p>
            ) : (
              <div className={styles.dates}>
                {visibleDates.map((item) => {
                  const parts = dateChipParts(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.dateChip} ${item === date ? styles.chipActive : ""}`}
                      onClick={() => {
                        setPickedDate(item);
                        setPickedTime(null);
                        setShowAllTimes(false);
                      }}
                    >
                      <span>{parts.weekday}</span>
                      <strong>{parts.day}</strong>
                    </button>
                  );
                })}
                {dates.length > VISIBLE_DATES && (
                  <button type="button" className={styles.dateChip} onClick={() => setShowAllDates((value) => !value)}>
                    <span>{showAllDates ? "Less" : "More"}</span>
                    <strong>{showAllDates ? "−" : "+"}</strong>
                  </button>
                )}
              </div>
            )}

            <h3 className={styles.step}>3. Time</h3>
            {times.length === 0 ? (
              <p className={styles.muted}>Choose a date to see available time.</p>
            ) : (
              <div className={styles.times}>
                {visibleTimes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.timeChip} ${item === time ? styles.chipActive : ""}`}
                    onClick={() => setPickedTime(item)}
                  >
                    {formatTime12(item)}
                  </button>
                ))}
                {times.length > VISIBLE_TIMES && (
                  <button
                    type="button"
                    className={`${styles.timeChip} ${styles.timeMore}`}
                    onClick={() => setShowAllTimes((value) => !value)}
                  >
                    {showAllTimes ? "Less" : "More"}
                  </button>
                )}
              </div>
            )}

            {service && time && date && (
              <div className={styles.summary}>
                <h4>Booking summary</h4>
                <ul>
                  <li>
                    <ServiceIcon /> {service.name}
                  </li>
                  <li>
                    <CalendarSmallIcon /> {longDateTime}
                  </li>
                  <li>
                    <PinIcon size={16} /> {address}
                  </li>
                  <li>
                    <ClockSmallIcon /> {service.durationMinutes} min
                  </li>
                  <li>
                    <WalletIcon /> <b>{formatPrice(service.price)}</b> pay in appointment
                  </li>
                </ul>
              </div>
            )}

            {bookingBlockedReason && <p className={styles.muted}>{bookingBlockedReason}</p>}

            <button
              type="button"
              className={styles.bookBtn}
              disabled={!service || !time || Boolean(bookingBlockedReason)}
              onClick={handleBook}
            >
              Book appointment
            </button>
          </>
        )}

        {isReviewOpen && service && date && time && (
          <ReviewAppointmentModal
            review={{
              doctorName,
              specialty: provider.specialization || provider.professionalRole || "Healthcare professional",
              photoUrl: provider.photoUrl || blankProfilePicture,
              service: service.name,
              dateTime: longDateTime,
              duration: `${service.durationMinutes} min`,
              location: address,
              price: formatPrice(service.price),
            }}
            onClose={() => setIsReviewOpen(false)}
            onConfirm={handleConfirm}
          />
        )}

        {isDone && (
          <BookingDoneModal
            doctorName={doctorName}
            dateTime={bookedDateTime}
            onGoToCabinet={() => navigate("/patient-dashboard")}
            onClose={() => setIsDone(false)}
          />
        )}
      </section>
    </>
  );
};
