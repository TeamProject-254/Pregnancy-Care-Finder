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
import profileSidebarIcon from "../../assets/img/profile-sidebar-icon.svg";
import calendarIcon from "../../assets/img/icon-calendar.svg";
import pregnancyFaqIcon from "../../assets/img/pregnancy-faq-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import styles from "./PatientDashboard.module.scss";

export type PatientResponse = PatientProfileDto;

type AppointmentTab = "Upcoming" | "Past" | "Cancelled";

interface FAQSource {
  label: string;
  url: string;
}

interface FAQQuestion {
  question: string;
  answer: string;
  sources?: FAQSource[];
}

interface FAQTopic {
  title: string;
  questions: FAQQuestion[];
}

const FAQ_TOPICS: FAQTopic[] = [
  {
    title: "Pregnancy stages",
    questions: [
      { question: "What changes are common in the first trimester?", answer: "Tiredness, nausea, breast tenderness, mood changes and needing to urinate more often are common. Every pregnancy is different, so discuss symptoms that worry you with a healthcare professional." },
      { question: "What can I expect during the second trimester?", answer: "Some people experience more energy and less nausea. Your abdomen will continue to grow, and you may begin to feel your baby move." },
      { question: "What can I expect during the third trimester?", answer: "You may experience increased tiredness, back discomfort, heartburn, difficulty sleeping and more frequent urination. Prenatal appointments usually become more frequent as your due date approaches." },
      { question: "Is my due date exact?", answer: "A due date is an estimate based on your pregnancy dates and medical assessment. Labour may begin before or after that date." },
      { question: "When might I start feeling my baby move?", answer: "Movements are commonly first noticed between 16 and 24 weeks. If you have not felt movement by 24 weeks, contact your healthcare professional.", sources: [{ label: "NHS: Your baby’s movements", url: "https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/" }] },
      { question: "Should I count my baby’s movements?", answer: "There is no universal number of movements expected each day. Learn your baby’s usual pattern and seek medical advice immediately if movement decreases, stops or changes noticeably.", sources: [{ label: "NHS: Your baby’s movements", url: "https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/" }] },
    ],
  },
  {
    title: "Health and wellbeing",
    questions: [
      { question: "Is exercise safe during pregnancy?", answer: "Regular physical activity is generally safe in a healthy, uncomplicated pregnancy. Discuss your plans with your healthcare professional, especially if you have a medical condition or pregnancy complication." },
      { question: "How much exercise is recommended?", answer: "Guidance commonly recommends at least 150 minutes of moderate aerobic activity each week for healthy pregnancies. Start gradually if you were not active before pregnancy.", sources: [{ label: "ACOG: Exercise During Pregnancy", url: "https://www.acog.org/womens-health/faqs/exercise-during-pregnancy" }] },
      { question: "Which activities should I avoid?", answer: "Avoid activities with a high risk of falling, abdominal injury, overheating or decompression, such as contact sports, horse riding, hot yoga and scuba diving. Ask your healthcare professional about activities appropriate for you." },
      { question: "When should I stop exercising?", answer: "Stop and seek medical advice if you experience vaginal bleeding, dizziness, chest pain, painful contractions, fluid leakage, calf pain or unusual shortness of breath.", sources: [{ label: "ACOG: Exercise During Pregnancy", url: "https://www.acog.org/womens-health/faqs/exercise-during-pregnancy" }] },
      { question: "Is sex safe during pregnancy?", answer: "Sexual activity is generally safe during a healthy pregnancy. If you have complications, bleeding, persistent pain or have been advised to avoid sex, consult your healthcare professional.", sources: [{ label: "ACOG: Sex During Pregnancy", url: "https://www.acog.org/womens-health/experts-and-stories/ask-acog/is-it-safe-to-have-sex-during-pregnancy" }] },
      { question: "Is travelling during pregnancy safe?", answer: "Travel is usually possible during a healthy pregnancy, but risks can change as pregnancy progresses. Discuss longer journeys with your healthcare professional and check the rules of your airline or travel provider.", sources: [{ label: "ACOG: Travel During Pregnancy", url: "https://www.acog.org/womens-health/faqs/travel-during-pregnancy" }] },
      { question: "How can I manage tiredness?", answer: "Rest when possible, maintain a regular sleep routine, eat a balanced diet and stay gently active. Speak with your healthcare professional if tiredness is severe, sudden or accompanied by other symptoms." },
      { question: "What should I do if I feel anxious or overwhelmed?", answer: "Tell your healthcare professional how you are feeling. Anxiety and other mental health conditions can be treated during pregnancy, and asking for help early is encouraged.", sources: [{ label: "ACOG: Anxiety and Pregnancy", url: "https://www.acog.org/womens-health/faqs/anxiety-and-pregnancy" }] },
    ],
  },
  {
    title: "Food, vitamins and medication",
    questions: [
      { question: "Do I need to eat for two?", answer: "Pregnancy does not usually mean doubling the amount of food you eat. Focus on a varied, balanced diet and follow personalised recommendations from your healthcare professional." },
      { question: "Which foods should I avoid during pregnancy?", answer: "Depending on local guidance, you may need to avoid raw or undercooked meat and seafood, unpasteurised products, certain soft cheeses, liver products and fish containing high levels of mercury.", sources: [{ label: "NHS: Foods to Avoid in Pregnancy", url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/" }] },
      { question: "How much caffeine can I have?", answer: "The NHS recommends limiting caffeine to no more than 200 mg per day during pregnancy. Remember that tea, chocolate, cola and energy drinks may also contain caffeine.", sources: [{ label: "NHS: Foods to Avoid in Pregnancy", url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/" }] },
      { question: "Can I drink alcohol during pregnancy?", answer: "The safest approach is to avoid alcohol during pregnancy. If you drank alcohol before knowing you were pregnant and are concerned, speak with your healthcare professional." },
      { question: "Which vitamins are commonly recommended?", answer: "Folic acid and vitamin D are commonly recommended, but the appropriate dose depends on individual and local guidance. Do not take supplements containing vitamin A or retinol unless prescribed.", sources: [{ label: "NHS: Pregnancy Vitamins and Supplements", url: "https://www.nhs.uk/pregnancy/keeping-well/pregnancy-vitamins-and-supplements/" }] },
      { question: "Can I take medication during pregnancy?", answer: "Check with a doctor, midwife or pharmacist before starting, stopping or changing any medicine, including over-the-counter products and herbal remedies. Do not stop prescribed medication without professional advice." },
      { question: "What if I accidentally ate something that should be avoided?", answer: "A small exposure does not necessarily mean that harm has occurred. Contact your healthcare professional if you feel unwell, develop symptoms of food poisoning or remain concerned." },
    ],
  },
  {
    title: "Prenatal care",
    questions: [
      { question: "When should I arrange my first prenatal appointment?", answer: "Contact a qualified healthcare professional or local maternity service as soon as you know you are pregnant. Early care helps establish your medical history and plan appropriate appointments." },
      { question: "How often will I need prenatal appointments?", answer: "The schedule depends on your country, health, pregnancy history and whether complications arise. Your healthcare professional will create an individual care plan." },
      { question: "What happens during prenatal appointments?", answer: "Appointments may include discussions about your physical and emotional health, blood-pressure checks, urine or blood tests, measurements and conversations about screening, fetal movement and preparing for birth.", sources: [{ label: "NHS: Antenatal Care and Appointments", url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-care-and-appointments/" }] },
      { question: "What are ultrasound scans used for?", answer: "Ultrasound scans may help estimate gestational age, check development, identify multiple pregnancies and support screening. The scans offered and their timing depend on local medical guidance.", sources: [{ label: "NHS: Ultrasound Scans", url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/ultrasound-scans/" }] },
      { question: "Are vaccinations safe during pregnancy?", answer: "Some vaccines are specifically recommended during pregnancy, while others should be avoided or delayed. Follow recommendations from your healthcare professional and local health authority.", sources: [{ label: "CDC: Pregnancy and Vaccines", url: "https://www.cdc.gov/vaccine-safety/about/pregnancy.html" }] },
      { question: "When should I seek urgent medical help?", answer: "Seek urgent care for heavy bleeding, severe or persistent abdominal pain, chest pain, sudden breathing difficulty, seizures, loss of consciousness, fluid leakage, or a significant reduction in your baby’s usual movements. Follow the emergency guidance available in your country.", sources: [{ label: "NHS: Pregnancy Symptoms Requiring Help", url: "https://www.nhs.uk/pregnancy/common-symptoms/pregnancy-symptoms-you-need-to-get-help-for/" }] },
    ],
  },
  {
    title: "Using BloomCare",
    questions: [
      { question: "How do I book an appointment?", answer: "Find a healthcare professional, choose a service, select an available date and time, review the details and confirm your booking." },
      { question: "Do I need an account to book an appointment?", answer: "Yes. You can explore healthcare professionals without an account, but you need to log in or create an account to complete a booking." },
      { question: "What does “Pending” mean?", answer: "The appointment request has been sent and is waiting for confirmation from the healthcare professional." },
      { question: "What does “Confirmed” mean?", answer: "The healthcare professional has accepted the appointment, and it is scheduled for the selected date and time." },
      { question: "What do “Completed” and “Cancelled” mean?", answer: "Completed means the appointment has already taken place. Cancelled means the appointment will no longer take place." },
      { question: "Where can I see my appointments?", answer: "Open Personal cabinet and select My appointments. You can switch between Upcoming, Past and Cancelled." },
      { question: "How do I view appointment details?", answer: "Open My appointments and select the relevant appointment or choose View details." },
      { question: "How do I cancel an appointment?", answer: "Open the appointment details, select Cancel appointment, and confirm the cancellation." },
      { question: "Can I change the date or time?", answer: "Rescheduling is currently unavailable. Cancel the existing appointment and create a new booking with another available time." },
      { question: "How do I view the healthcare professional’s profile?", answer: "Select View doctor profile from the appointment details or open the profile from the search results." },
      { question: "How do I pay for an appointment?", answer: "Payment is made directly to the healthcare professional at the appointment. BloomCare does not process online payments." },
      { question: "How do I update my personal information?", answer: "Open Profile in your personal cabinet and select Edit profile." },
      { question: "Is pregnancy-week information required?", answer: "No. Adding your pregnancy week is optional." },
      { question: "Who can see my pregnancy-week information?", answer: "It is processed and shared only after you provide explicit consent. You can update this information and your consent in your profile." },
      { question: "How do I reset my password?", answer: "Select Forgot password? on the login page, enter your email address and follow the reset link sent to you." },
      { question: "Why are no appointment times available?", answer: "The healthcare professional may not have available working hours for the selected date. Choose another date, service or professional." },
      { question: "Does BloomCare verify medical information shown in profiles?", answer: "Professional information is provided by healthcare professionals. Patients should consider their individual needs and ask the professional any necessary questions before receiving care." },
    ],
  },
];

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
    case "CANCELLED_BY_PROVIDER":
      return "Cancelled";
    case "PENDING":
    default:
      return "Pending";
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
    shortDate: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
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
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqItem, setOpenFaqItem] = useState("0-0");
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
                    <img src={profileSidebarIcon} alt="" />
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
                    <img src={calendarIcon} alt="" />
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
                    <img src={pregnancyFaqIcon} alt="" />
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
                <header className={styles.faqHeader}>
                  <h2 id="pregnancy-faq-title">Pregnancy FAQ</h2>
                  <p>Helpful information for every stage of pregnancy.</p>
                </header>

                <div className={styles.faqSearch}>
                  <svg className={styles.faqSearchIcon} viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.2" /><path d="m16.2 16.2 5 5" /></svg>
                  <input
                    id="pregnancy-faq-search"
                    type="text"
                    aria-label="Search pregnancy topics"
                    value={faqSearch}
                    onChange={(event) => setFaqSearch(event.target.value)}
                    placeholder="Search pregnancy topics..."
                    autoComplete="off"
                  />
                  {faqSearch && (
                    <button
                      type="button"
                      className={styles.faqSearchClear}
                      onClick={() => setFaqSearch("")}
                      aria-label="Clear search"
                    >
                      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
                    </button>
                  )}
                </div>

                <div className={styles.faqTopics}>
                  {FAQ_TOPICS.map((topic, topicIndex) => {
                    const query = faqSearch.trim().toLowerCase();
                    const topicMatches = topic.title.toLowerCase().includes(query);
                    const questions = topic.questions
                      .map((item, questionIndex) => ({ item, questionIndex }))
                      .filter(({ item }) =>
                        !query || topicMatches ||
                        item.question.toLowerCase().includes(query) ||
                        item.answer.toLowerCase().includes(query),
                      );

                    if (questions.length === 0) return null;

                    return (
                      <section className={styles.faqTopic} key={topic.title}>
                        <h3>{topic.title}</h3>
                        <div className={styles.faqQuestions}>
                          {questions.map(({ item, questionIndex }) => {
                            const itemKey = `${topicIndex}-${questionIndex}`;
                            const isOpen = openFaqItem === itemKey;
                            const answerId = `faq-answer-${itemKey}`;
                            return (
                              <article className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`} key={itemKey}>
                                <button
                                  type="button"
                                  className={styles.faqQuestion}
                                  aria-expanded={isOpen}
                                  aria-controls={answerId}
                                  onClick={() => setOpenFaqItem((current) => current === itemKey ? "" : itemKey)}
                                >
                                  <span>{item.question}</span>
                                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m3 7 7 7 7-7" /></svg>
                                </button>
                                <div className={styles.faqAnswer} id={answerId} role="region" hidden={!isOpen}>
                                  <p>{item.answer}</p>
                                  {item.sources && item.sources.length > 0 && (
                                    <div className={styles.faqSources}>
                                      {item.sources.map((source) => (
                                        <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                                          {source.label}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                  {faqSearch.trim() && !FAQ_TOPICS.some((topic) =>
                    topic.title.toLowerCase().includes(faqSearch.trim().toLowerCase()) ||
                    topic.questions.some((item) =>
                      item.question.toLowerCase().includes(faqSearch.trim().toLowerCase()) ||
                      item.answer.toLowerCase().includes(faqSearch.trim().toLowerCase()),
                    ),
                  ) && <p className={styles.faqNoResults}>No topics found. Try another search.</p>}
                </div>

                <aside className={styles.faqDisclaimer}>
                  <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" /><path d="M16 14v9m0-15v.1" /></svg>
                  <p>Medical disclaimer: This information is for general guidance only and does not replace advice from a qualified healthcare professional. Recommendations may differ depending on your health, pregnancy and country.</p>
                </aside>
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
                            <strong>{date.shortDate}</strong>
                            <small>{date.time}</small>
                          </div>
                          <div className={styles.appointmentInfo}>
                            <h3>{providerName}</h3>
                            <p className={styles.providerSpecialty}>
                              {appointment.serviceName}
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
                          <span
                            className={`${styles.statusBadge} ${statusClassName(appointment.status, styles)} ${styles.appointmentStatus}`}
                          >
                            {appointmentStatus(appointment.status)}
                          </span>
                          {canCancel && (
                            <button
                              type="button"
                              className={styles.cancelButton}
                              aria-label="Cancel appointment"
                              onClick={() => {
                                setCancelError("");
                                setCancelTarget(appointment);
                              }}
                            >
                              Cancel
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
