import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import {
  cancelPatientAppointment,
  getPatientAppointments,
  type AppointmentDto,
} from "../../api/appointments";
import {
  getMyPatientProfile,
  type PatientProfileDto,
} from "../../api/patients";
import { PatientEditForm } from "./components/PatientEditForm";
import defaultAvatar from "../../assets/img/profile-icon.svg";
import cancelAppointmentIcon from "../../assets/img/cancel-appointment-icon.svg";
import locationIcon from "../../assets/img/location-icon.svg";
import languagesIcon from "../../assets/img/languages-icon.svg";
import appointmentsIcon from "../../assets/img/appointments-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import styles from "./PatientDashboard.module.scss";

export type PatientResponse = PatientProfileDto;

type AppointmentTab = "Upcoming" | "Past" | "Cancelled";

const parseAppointmentDate = (value: string) => {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0);
};

const appointmentStatus = (status: AppointmentDto["status"]) => {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED_BY_PATIENT":
      return "Cancelled by you";
    case "CANCELLED_BY_PROVIDER":
      return "Cancelled by provider";
    default:
      return "Awaiting confirmation";
  }
};

const statusClassName = (
  status: AppointmentDto["status"],
  stylesMap: typeof styles,
) => {
  if (status === "CONFIRMED" || status === "COMPLETED")
    return stylesMap.statusConfirmed;
  if (status?.startsWith("CANCELLED")) return stylesMap.statusCancelled;
  return stylesMap.statusPending;
};

const formatAppointmentDate = (value: string) => {
  const date = parseAppointmentDate(value);
  return {
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date),
    fullDate: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
};

const isCancelled = (appointment: AppointmentDto) =>
  appointment.status === "CANCELLED_BY_PATIENT" ||
  appointment.status === "CANCELLED_BY_PROVIDER";

export const PatientDashboard = () => {
  const [profile, setProfile] = useState<PatientResponse | null>(null);
  const [pregnancyWeek, setPregnancyWeek] = useState<number | string>(1);
  const [activeSection, setActiveSection] = useState<"profile" | "appointments" | "faq">("appointments");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentTab>("Upcoming");
  const [cancelTarget, setCancelTarget] = useState<AppointmentDto | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const patient = await getMyPatientProfile();
      setProfile(patient);
      setPregnancyWeek(patient.pregnancyWeek || 1);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          setProfile(null);
        } else if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          setErrorMessage("Your session has expired. Please sign in again.");
        } else {
          setErrorMessage("Failed to load profile details. Please try again.");
        }
      } else {
        setErrorMessage(
          "An unexpected error occurred while loading your profile.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");
      setAppointments(await getPatientAppointments());
    } catch (error) {
      const data = isAxiosError(error)
        ? (error.response?.data as
            | { message?: string; error?: string }
            | undefined)
        : undefined;
      setAppointmentsError(
        data?.message ||
          data?.error ||
          (isAxiosError(error) && !error.response
            ? "Unable to reach the server. Check your connection and try again."
            : "Could not load your appointments. Please try again."),
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
    void fetchAppointments();
  }, [fetchProfile, fetchAppointments]);

  const visibleAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appointment) => {
        if (activeTab === "Cancelled") return isCancelled(appointment);
        if (isCancelled(appointment)) return false;
        const isPast =
          appointment.status === "COMPLETED" ||
          parseAppointmentDate(appointment.appointmentDateTime) < now;
        return activeTab === "Past" ? isPast : !isPast;
      })
      .sort((a, b) => {
        const difference =
          parseAppointmentDate(a.appointmentDateTime).getTime() -
          parseAppointmentDate(b.appointmentDateTime).getTime();
        return activeTab === "Upcoming" ? difference : -difference;
      });
  }, [appointments, activeTab]);

  const nextAppointment = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            !isCancelled(appointment) &&
            appointment.status !== "COMPLETED" &&
            parseAppointmentDate(appointment.appointmentDateTime) >= new Date(),
        )
        .sort(
          (a, b) =>
            parseAppointmentDate(a.appointmentDateTime).getTime() -
            parseAppointmentDate(b.appointmentDateTime).getTime(),
        )[0],
    [appointments],
  );

  const handleWeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      setPregnancyWeek("");
      return;
    }
    const number = Number(value);
    if (!Number.isNaN(number)) setPregnancyWeek(number);
  };

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await cancelPatientAppointment(cancelTarget.id);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === cancelTarget.id
            ? {
                ...appointment,
                status: "CANCELLED_BY_PATIENT",
                cancellationReason: "Cancelled by patient",
              }
            : appointment,
        ),
      );
      setActiveTab("Cancelled");
      setCancelTarget(null);
    } catch (error) {
      const data = isAxiosError(error)
        ? (error.response?.data as
            | { message?: string; error?: string }
            | undefined)
        : undefined;
      setCancelError(
        data?.message ||
          data?.error ||
          "Could not cancel this appointment. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const displayName = profile?.firstName || "there";
  const cancelAppointmentDate = cancelTarget
    ? formatAppointmentDate(cancelTarget.appointmentDateTime)
    : null;
  const cancelProviderName = cancelTarget
    ? [cancelTarget.providerFirstName, cancelTarget.providerLastName]
        .filter(Boolean)
        .join(" ") || "your provider"
    : "";

  return (
    <div className={styles.main__content}>
      <main className={styles.content__wrapper}>
        <div className={styles.title__block}>
          <div>
            <p className={styles.eyebrow}>YOUR BLOOMCARE ACCOUNT</p>
            <h1 className={styles.title}>Welcome back, {displayName}!</h1>
            <p className={styles.title__desc}>
              Your care and appointments, all in one place.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className={styles.error__banner} role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className={styles.retry__button}
              onClick={() => void fetchProfile()}
            >
              Retry
            </button>
          </div>
        )}

        <div className={styles.dashboard__body}>
          <aside className={styles.profile__card}>
            {isLoading ? (
              <div className={styles.loading__state}>Loading your profile…</div>
            ) : errorMessage ? (
              <div className={styles.empty__state}>
                <p>Your profile could not be loaded.</p>
              </div>
            ) : profile ? (
              <>
                <div className={styles.avatar__wrapper}>
                  <img
                    src={profile.photoUrl || defaultAvatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.user__info}>
                  <h2 className={styles.user__name}>
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <span className={styles.user__role}>Patient account</span>
                </div>
                <div className={styles.profileDivider} />
                <div className={styles.meta__list}>
                  <div className={styles.meta__item}>
                    <img
                      src={locationIcon}
                      alt=""
                      className={styles.meta__icon}
                    />
                    <div className={styles.meta__texts}>
                      <span className={styles.meta__label}>Location</span>
                      <span className={styles.meta__value}>
                        {profile.location || "Not specified"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.meta__item}>
                    <img
                      src={languagesIcon}
                      alt=""
                      className={styles.meta__icon}
                    />
                    <div className={styles.meta__texts}>
                      <span className={styles.meta__label}>
                        Preferred languages
                      </span>
                      <span className={styles.meta__value}>
                        {profile.languages?.length
                          ? profile.languages.join(", ")
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.pregnancy__block}>
                  <label
                    className={styles.pregnancy__label}
                    htmlFor="pregnancy-week"
                  >
                    Pregnancy week
                  </label>
                  {activeSection === "profile" ? (
                    <input
                      id="pregnancy-week"
                      type="number"
                      min={1}
                      max={42}
                      className={styles.pregnancy__input}
                      value={pregnancyWeek}
                      onChange={handleWeekChange}
                    />
                  ) : (
                    <div className={styles.pregnancy__badge}>
                      Week {profile.pregnancyWeek || "—"}
                    </div>
                  )}
                </div>
                <nav
                  className={styles.profileMenu}
                  aria-label="Patient dashboard sections"
                >
                  <button
                    type="button"
                    className={`${styles.profileMenuItem} ${activeSection === "profile" ? styles.profileMenuItemActive : ""}`}
                    onClick={() => setActiveSection("profile")}
                  >
                    <svg viewBox="0 0 28 28" aria-hidden="true">
                      <path d="M17.8 20.1c-1.1 1-2.5 1.6-4.1 1.6-3.4 0-6.2-2.7-6.2-6.1 0-2.1 1.1-4 2.8-5.1m1.5 14c1.9 1.3 4.7 1.4 6.8.1m-6.2-15.1a4.1 4.1 0 1 1 8.2 0 4.1 4.1 0 0 1-8.2 0Z" />
                      <path d="m21 20 2.2 2.2 3.3-3.7" />
                    </svg>
                    <span>
                      Personal profile
                    </span>
                    <img
                      className={styles.menuEditIcon}
                      src={editIcon}
                      alt=""
                    />
                  </button>
                  <button
                    type="button"
                    className={`${styles.profileMenuItem} ${activeSection === "appointments" ? styles.profileMenuItemActive : ""}`}
                    onClick={() => {
                      if (activeSection === "profile")
                        setPregnancyWeek(profile.pregnancyWeek || 1);
                      setActiveSection("appointments");
                    }}
                  >
                    <img src={appointmentsIcon} alt="" />
                    <span>My appointments</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.profileMenuItem} ${activeSection === "faq" ? styles.profileMenuItemActive : ""}`}
                    onClick={() => {
                      if (activeSection === "profile")
                        setPregnancyWeek(profile.pregnancyWeek || 1);
                      setActiveSection("faq");
                    }}
                  >
                    <svg viewBox="0 0 28 28" aria-hidden="true">
                      <path d="M14 24.5a10.5 10.5 0 1 0-6-1.9L4 25l1.2-4.3A10.4 10.4 0 0 0 14 24.5Z" />
                      <path d="M11.6 10.5a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.8 1.4-1.8 2.9m0 3.1v.1" />
                    </svg>
                    <span>Pregnancy FAQ</span>
                  </button>
                </nav>
              </>
            ) : (
              <div className={styles.empty__state}>
                <p>Your profile is not set up yet.</p>
                <button
                  type="button"
                  className={styles.edit__button}
                  onClick={() => setActiveSection("profile")}
                >
                  Create profile
                </button>
              </div>
            )}
          </aside>

          <section
            className={styles.appointmentsPanel}
            aria-label={activeSection === "faq" ? "Pregnancy FAQ" : activeSection === "profile" ? "Edit patient profile" : "My appointments"}
          >
            {activeSection === "profile" ? (
              <PatientEditForm
                initialData={profile}
                pregnancyWeek={Number(pregnancyWeek) || 1}
                onSuccess={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setPregnancyWeek(updatedProfile.pregnancyWeek);
                  setActiveSection("appointments");
                }}
              />
            ) : activeSection === "faq" ? (
              <section className={styles.faqPanel} aria-labelledby="pregnancy-faq-title">
                <p className={styles.eyebrow}>BLOOMCARE GUIDE</p>
                <h2 id="pregnancy-faq-title" className={styles.appointmentsTitle}>Pregnancy FAQ</h2>
                <article className={styles.faqItem}>
                  <h3>When should I contact my care provider?</h3>
                  <p>Contact your healthcare provider if you have questions about symptoms, medicines, or changes in your pregnancy. For urgent concerns, use your local emergency services.</p>
                </article>
                <article className={styles.faqItem}>
                  <h3>How can I prepare for an appointment?</h3>
                  <p>Bring your questions and any information your care team has asked you to track. Your provider can advise what is relevant to your visit.</p>
                </article>
                <article className={styles.faqItem}>
                  <h3>Where can I see my upcoming visits?</h3>
                  <p>Choose “My appointments” in this menu to review upcoming, past, and cancelled visits.</p>
                </article>
              </section>
            ) : (
              <>
                {nextAppointment &&
                  (() => {
                    const date = formatAppointmentDate(
                      nextAppointment.appointmentDateTime,
                    );
                    const providerName =
                      [
                        nextAppointment.providerFirstName,
                        nextAppointment.providerLastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Healthcare provider";
                    return (
                      <article className={styles.nextAppointment}>
                        <div className={styles.nextAppointmentHeading}>
                          <h2>Next appointment</h2>
                          <span
                            className={`${styles.statusBadge} ${statusClassName(nextAppointment.status, styles)}`}
                          >
                            {appointmentStatus(nextAppointment.status)}
                          </span>
                        </div>
                        <div className={styles.nextAppointmentBody}>
                          <div className={styles.nextProvider}>
                            <img
                              src={
                                nextAppointment.providerPhotoUrl ||
                                defaultAvatar
                              }
                              alt=""
                            />
                            <div>
                              <strong>Dr. {providerName}</strong>
                              <span>
                                {nextAppointment.providerSpecialization ||
                                  "Healthcare professional"}
                              </span>
                            </div>
                          </div>
                          <div className={styles.nextDetails}>
                            <strong>{nextAppointment.serviceName}</strong>
                            <span>
                              {date.weekday}, {date.fullDate} · {date.time} (
                              {nextAppointment.durationMinutes} min)
                            </span>
                            <span>
                              {nextAppointment.providerLocation ||
                                "Location to be confirmed"}
                            </span>
                            <span>
                              <b>
                                {nextAppointment.price !== null
                                  ? `${Number(nextAppointment.price)}$`
                                  : ""}
                              </b>{" "}
                              Pay at appointment
                            </span>
                          </div>
                          <div className={styles.nextActions}>
                            <button
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById(
                                    `appointment-${nextAppointment.id}`,
                                  )
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  })
                              }
                            >
                              View details
                            </button>
                            <Link to={`/doctors/${nextAppointment.providerId}`}>
                              View doctor profile
                            </Link>
                            {(nextAppointment.status === "PENDING" ||
                              nextAppointment.status === "CONFIRMED") && (
                              <button
                                type="button"
                                className={styles.nextCancel}
                                onClick={() => {
                                  setCancelError("");
                                  setCancelTarget(nextAppointment);
                                }}
                              >
                                Cancel appointment
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })()}
                <div className={styles.appointmentsHeading}>
                  <div>
                    <p className={styles.eyebrow}>YOUR SCHEDULE</p>
                    <h2
                      id="appointments-title"
                      className={styles.appointmentsTitle}
                    >
                      My appointments
                    </h2>
                  </div>
                  <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={() => void fetchAppointments()}
                    disabled={appointmentsLoading}
                    aria-label="Refresh appointments"
                  >
                    ↻
                  </button>
                </div>

                <div
                  className={styles.appointmentTabs}
                  role="tablist"
                  aria-label="Appointment history"
                >
                  {(["Upcoming", "Past", "Cancelled"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab}
                      className={`${styles.appointmentTab} ${activeTab === tab ? styles.appointmentTabActive : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                      <span>
                        {
                          appointments.filter((appointment) => {
                            if (tab === "Cancelled")
                              return isCancelled(appointment);
                            if (isCancelled(appointment)) return false;
                            const isPast =
                              appointment.status === "COMPLETED" ||
                              parseAppointmentDate(
                                appointment.appointmentDateTime,
                              ) < new Date();
                            return tab === "Past" ? isPast : !isPast;
                          }).length
                        }
                      </span>
                    </button>
                  ))}
                </div>

                {appointmentsLoading ? (
                  <div className={styles.appointmentState} role="status">
                    Loading your appointments…
                  </div>
                ) : appointmentsError ? (
                  <div className={styles.appointmentState} role="alert">
                    <p>{appointmentsError}</p>
                    <button
                      type="button"
                      onClick={() => void fetchAppointments()}
                    >
                      Try again
                    </button>
                  </div>
                ) : visibleAppointments.length === 0 ? (
                  <div className={styles.appointmentEmpty}>
                    <span className={styles.emptyCalendar} aria-hidden="true">
                      ♡
                    </span>
                    <h3>
                      {activeTab === "Upcoming"
                        ? "Your next chapter starts here"
                        : `No ${activeTab.toLowerCase()} appointments`}
                    </h3>
                    <p>
                      {activeTab === "Upcoming"
                        ? "Find the right care and book a time that works for you."
                        : "Appointments in this section will appear here."}
                    </p>
                    {activeTab === "Upcoming" && (
                      <Link to="/search" className={styles.findCareButton}>
                        Find a specialist <span aria-hidden="true">↗</span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className={styles.appointmentList}>
                    <div
                      className={styles.appointmentTableHeader}
                      aria-hidden="true"
                    >
                      <span>DATE &amp; TIME</span>
                      <span>PROVIDER / SERVICE</span>
                      <span>Status</span>
                      <span />
                    </div>
                    {visibleAppointments.map((appointment) => {
                      const date = formatAppointmentDate(
                        appointment.appointmentDateTime,
                      );
                      const providerName =
                        [
                          appointment.providerFirstName,
                          appointment.providerLastName,
                        ]
                          .filter(Boolean)
                          .join(" ") || "Healthcare provider";
                      const canCancel =
                        activeTab === "Upcoming" &&
                        (appointment.status === "PENDING" ||
                          appointment.status === "CONFIRMED" ||
                          appointment.status === null);
                      return (
                        <article
                          className={styles.appointmentCard}
                          id={`appointment-${appointment.id}`}
                          key={appointment.id}
                        >
                          <div
                            className={styles.appointmentDate}
                            aria-label={`${date.weekday}, ${date.fullDate}`}
                          >
                            <span>{date.month}</span>
                            <strong>{date.day}</strong>
                            <small>{date.weekday.slice(0, 3)}</small>
                          </div>
                          <div className={styles.appointmentInfo}>
                            <div className={styles.appointmentCardTop}>
                              <span
                                className={`${styles.statusBadge} ${statusClassName(appointment.status, styles)}`}
                              >
                                {appointmentStatus(appointment.status)}
                              </span>
                              <span className={styles.appointmentTime}>
                                {date.time}
                              </span>
                            </div>
                            <h3>{providerName}</h3>
                            <p className={styles.providerSpecialty}>
                              {appointment.providerSpecialization ||
                                "Healthcare professional"}
                            </p>
                            <div className={styles.appointmentDetails}>
                              <span>
                                <strong>{appointment.serviceName}</strong> ·{" "}
                                {appointment.durationMinutes} min
                              </span>
                              <span>
                                {appointment.providerLocation ||
                                  "Location to be confirmed"}
                              </span>
                              {appointment.price !== null && (
                                <span className={styles.appointmentPrice}>
                                  {Number(appointment.price)}$
                                </span>
                              )}
                            </div>
                            {appointment.message && (
                              <p className={styles.appointmentNote}>
                                {appointment.message}
                              </p>
                            )}
                            {appointment.cancellationReason &&
                              isCancelled(appointment) && (
                                <p className={styles.appointmentNote}>
                                  Cancellation: {appointment.cancellationReason}
                                </p>
                              )}
                          </div>
                          {canCancel && (
                            <button
                              type="button"
                              className={styles.cancelButton}
                              onClick={() => {
                                setCancelError("");
                                setCancelTarget(appointment);
                              }}
                            >
                              Cancel appointment
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {cancelTarget && (
        <div
          className={styles.confirmOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isCancelling)
              setCancelTarget(null);
          }}
        >
          <section
            className={styles.confirmDialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-appointment-title"
            aria-describedby="cancel-appointment-description"
          >
            <button
              type="button"
              className={styles.confirmCloseButton}
              onClick={() => setCancelTarget(null)}
              disabled={isCancelling}
              aria-label="Close cancellation dialog"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <img className={styles.confirmIcon} src={cancelAppointmentIcon} alt="" />
            <h2 id="cancel-appointment-title">Cancel appointment?</h2>
            <p className={styles.confirmDescription} id="cancel-appointment-description">
              Are you sure you want to cancel your appointment with<br />
              <strong>{cancelTarget.providerFirstName || cancelTarget.providerLastName ? "Dr. " : ""}{cancelProviderName} on {cancelAppointmentDate?.month} {cancelAppointmentDate?.day}, {cancelTarget.appointmentDateTime.slice(0, 4)} at {cancelAppointmentDate?.time}?</strong>
            </p>
            <div className={styles.confirmWarning}>
              <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.4 4.8a3 3 0 0 1 5.2 0l10.2 18a3 3 0 0 1-2.6 4.5H5.8a3 3 0 0 1-2.6-4.5l10.2-18Z" /><path d="M16 11v7m0 4v.1" /></svg>
              <p>This action cannot be undone. To choose another time, book a new appointment.</p>
            </div>
            {cancelError && (
              <p className={styles.cancelError} role="alert">
                {cancelError}
              </p>
            )}
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.cancelConfirmButton}
                onClick={() => void handleCancelAppointment()}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling…" : "Cancel appointment"}
              </button>
              <button
                type="button"
                className={styles.keepAppointmentButton}
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
              >
                Keep appointment
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
