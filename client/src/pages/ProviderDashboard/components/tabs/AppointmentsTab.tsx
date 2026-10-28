import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelProviderAppointment,
  confirmProviderAppointment,
  getProviderAppointments,
  getProviderStats,
  type ProviderStats,
} from "../../../../api/appointments";
import { useAuth } from "../../../../context/AuthContext";
import { notifyProviderAppointmentsChanged } from "../../../../hooks/usePendingAppointments";
import { readStatusOverrides, saveStatusOverride } from "../appointmentStatusStore";
import {
  buildTabs,
  DATE_FILTERS,
  matchesDateFilter,
  requestErrorMessage,
  partitionProviderAppointments,
  type AppointmentItem,
  type AppointmentTab,
  type DateFilter,
} from "../appointmentUtils";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PendingClockIcon,
  TodayIcon,
  FilterIcon,
  SearchIcon,
  TrashIcon,
} from "../AppointmentIcons";
import { AppointmentDetailsModal } from "../modals/AppointmentDetailsModal";
import { ConfirmAppointmentModal } from "../modals/ConfirmAppointmentModal";
import { CancelAppointmentModal } from "../modals/CancelAppointmentModal";
import { SelectDropdown } from "../../../../components/SelectDropdown/SelectDropdown";
import blankProfile from "../../../../assets/img/blank-profile-picture-973460_1280.png";
import calendarSmallIcon from "../../../../assets/img/icon-calendar-16.svg";
import styles from "./AppointmentsTab.module.scss";

export type { AppointmentItem } from "../appointmentUtils";

const TABS: AppointmentTab[] = ["Upcoming", "Past", "Cancelled"];
const PAGE_SIZE = 5;
const ALL_STATUSES = "All statuses";

type ModalState =
  | { type: "details"; appt: AppointmentItem }
  | { type: "confirm"; appt: AppointmentItem }
  | { type: "cancel"; appt: AppointmentItem }
  | null;

const EMPTY_TABS: Record<AppointmentTab, AppointmentItem[]> = { Upcoming: [], Past: [], Cancelled: [] };

const emptyText: Record<AppointmentTab, string> = {
  Upcoming: "You have no upcoming appointments yet.",
  Past: "No past appointments yet.",
  Cancelled: "No cancelled appointments.",
};

const statusClass = (status: AppointmentItem["status"]) => {
  switch (status) {
    case "Pending":
      return styles.statusPending;
    case "Cancelled by patient":
      return styles.statusCancelledPatient;
    case "Cancelled by Doctor":
      return styles.statusCancelledDoctor;
    default:
      return styles.statusPlain;
  }
};

const mobileStatusClass = (status: AppointmentItem["status"]) => {
  if (status === "Pending") return styles.cardStatusPending;
  if (status.startsWith("Cancelled")) return styles.cardStatusCancelled;
  return "";
};

const StatusBadge = ({ status }: { status: AppointmentItem["status"] }) => (
  <span className={`${styles.status} ${statusClass(status)}`}>
    {status === "Pending" && <PendingClockIcon />}
    {(status === "Confirmed" || status === "Completed") && <span aria-hidden="true">✓</span>}
    {status.startsWith("Cancelled") && <span aria-hidden="true">✕</span>}
    {status}
  </span>
);

export const AppointmentsTab = () => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [tabs, setTabs] = useState(EMPTY_TABS);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");

  const [activeTab, setActiveTab] = useState<AppointmentTab>("Upcoming");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All dates");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      try {
        const [appointments, statsResult] = await Promise.all([
          getProviderAppointments(),
          getProviderStats().catch(() => null),
        ]);
        if (!isCurrent) return;
        const overrides = readStatusOverrides(userId);
        const { upcoming, past, cancelled } = partitionProviderAppointments(appointments, overrides);
        setTabs(buildTabs(upcoming, past, cancelled, overrides));
        setStats(statsResult);
        setLoadError("");
      } catch (error) {
        if (!isCurrent) return;
        setLoadError(requestErrorMessage(error, "Unable to load appointments. Please check your connection."));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isCurrent = false;
    };
  }, [reloadToken, userId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const reload = () => setReloadToken((token) => token + 1);

  const retry = () => {
    setIsLoading(true);
    reload();
  };

  const statusOptions = useMemo(
    () => [ALL_STATUSES, ...Array.from(new Set(tabs[activeTab].map((item) => item.status)))],
    [tabs, activeTab],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tabs[activeTab].filter((item) => {
      if (query && !`${item.patientName} ${item.service}`.toLowerCase().includes(query)) return false;
      if (statusFilter !== ALL_STATUSES && item.status !== statusFilter) return false;
      return matchesDateFilter(item.start, dateFilter);
    });
  }, [tabs, activeTab, search, statusFilter, dateFilter]);

  const visible = filtered.slice(0, visibleCount);

  const changeTab = (tab: AppointmentTab) => {
    setActiveTab(tab);
    setStatusFilter(ALL_STATUSES);
    setVisibleCount(PAGE_SIZE);
  };
  const changeSearch = (value: string) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };
  const changeDate = (value: DateFilter) => {
    setDateFilter(value);
    setVisibleCount(PAGE_SIZE);
  };
  const changeStatus = (value: string) => {
    setStatusFilter(value);
    setVisibleCount(PAGE_SIZE);
  };

  const closeModal = useCallback(() => setModal(null), []);

  const handleConfirm = async (appt: AppointmentItem, message?: string) => {
    await confirmProviderAppointment(appt.id, message);
    saveStatusOverride(userId, appt.id, "CONFIRMED");
    notifyProviderAppointmentsChanged();
    setModal(null);
    setNotice(`Appointment with ${appt.patientName} confirmed.`);
    reload();
  };

  const handleCancel = async (appt: AppointmentItem, reason: string, message: string) => {
    await cancelProviderAppointment(appt.id, reason, message);
    saveStatusOverride(userId, appt.id, "CANCELLED_BY_PROVIDER");
    notifyProviderAppointmentsChanged();
    setModal(null);
    setNotice(`Appointment with ${appt.patientName} cancelled.`);
    reload();
  };

  const isActionable = (item: AppointmentItem) =>
    activeTab === "Upcoming" && (item.statusCode === "PENDING" || item.statusCode === "CONFIRMED");

  const statCards = [
    { key: "pending", label: "Pending", value: stats?.pendingCount, icon: <ClockIcon size={30} />, cls: styles.statPending },
    { key: "confirmed", label: "Confirmed", value: stats?.confirmedCount, icon: <CheckCircleIcon size={30} />, cls: styles.statConfirmed },
    { key: "today", label: "Today", value: stats?.todayCount, icon: <TodayIcon size={30} />, cls: styles.statToday },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Appointments</h2>
      <p className={styles.subtitle}>Review and manage patient appointment requests.</p>

      {notice && (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      )}

      <div className={styles.stats}>
        {statCards.map((card) => (
          <div key={card.key} className={`${styles.statCard} ${card.cls}`}>
            <span className={styles.statIcon}>{card.icon}</span>
            <div>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value ?? "–"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => changeTab(tab)}
          >
            {tab} ({tabs[tab].length})
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <label className={`${styles.control} ${styles.controlSearch}`}>
          <SearchIcon size={22} />
          <input
            type="text"
            placeholder="Search by patient or service"
            value={search}
            onChange={(event) => changeSearch(event.target.value)}
          />
        </label>
        <label className={styles.control}>
          <CalendarIcon size={22} />
          <SelectDropdown
            variant="bare"
            ariaLabel="Filter by date"
            options={DATE_FILTERS}
            value={dateFilter}
            onChange={(value) => changeDate(value as DateFilter)}
          />
        </label>
        <label className={styles.control}>
          <FilterIcon size={22} />
          <SelectDropdown
            variant="bare"
            ariaLabel="Filter by status"
            options={statusOptions}
            value={statusFilter}
            onChange={changeStatus}
          />
        </label>
      </div>

      {isLoading ? (
        <p className={styles.state}>Loading appointments...</p>
      ) : loadError ? (
        <div className={`${styles.state} ${styles.stateError}`}>
          <p>{loadError}</p>
          <button type="button" className={styles.btnOutline} onClick={retry}>
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className={styles.state}>
          {tabs[activeTab].length === 0 ? emptyText[activeTab] : "No appointments match your filters."}
        </p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date &amp; time</th>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((appt) => (
                  <tr key={appt.id}>
                    <td data-label="Date & time">
                      <strong className={styles.cellMain}>{appt.date}</strong>
                      <span className={styles.cellSub}>{appt.time}</span>
                    </td>
                    <td data-label="Patient">
                      <strong className={styles.cellName}>{appt.patientName}</strong>
                      <span className={styles.cellSubDark}>{appt.pregnancyWeek}</span>
                    </td>
                    <td data-label="Service">
                      <span className={styles.service}>
                        {appt.service}, {appt.duration}
                      </span>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td data-label="Actions">
                      <div className={styles.actions}>
                        <div className={styles.actionButtons}>
                          {activeTab === "Upcoming" && appt.statusCode === "PENDING" && (
                            <button type="button" className={styles.btnPrimarySmall} onClick={() => setModal({ type: "confirm", appt })}>
                              Confirm
                            </button>
                          )}
                          <button type="button" className={styles.btnOutlineSmall} onClick={() => setModal({ type: "details", appt })}>
                            View details
                          </button>
                        </div>
                        {isActionable(appt) && (
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setModal({ type: "cancel", appt })}
                            aria-label={`Cancel appointment with ${appt.patientName}`}
                          >
                            <TrashIcon size={22} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileList}>
            {visible.map((appt) => (
              <article className={styles.card} key={appt.id}>
                <div className={styles.cardTop}>
                  <span className={styles.cardDate}>
                    <img src={calendarSmallIcon} alt="" />
                    {appt.date} · {appt.time}
                  </span>
                  <span className={`${styles.cardStatus} ${mobileStatusClass(appt.status)}`}>
                    {appt.status.startsWith("Cancelled") ? "Cancelled" : appt.status}
                  </span>
                </div>
                <div className={styles.cardPatient}>
                  <img src={appt.patientPhotoUrl || blankProfile} alt="" />
                  <div>
                    <strong>{appt.patientName}</strong>
                    <span>{appt.service}, {appt.duration}</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {activeTab === "Upcoming" && appt.statusCode === "PENDING" && (
                    <button type="button" className={styles.cardPrimary} onClick={() => setModal({ type: "confirm", appt })}>
                      Confirm
                    </button>
                  )}
                  <button type="button" className={styles.cardOutline} onClick={() => setModal({ type: "details", appt })}>
                    View details
                  </button>
                  {activeTab === "Upcoming" && appt.statusCode === "CONFIRMED" && (
                    <button type="button" className={styles.cardOutline} onClick={() => setModal({ type: "cancel", appt })}>
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className={styles.footer}>
            <span className={styles.showing}>
              Showing <b>{visible.length}</b> of <b>{filtered.length}</b> appointments
            </span>
            {visible.length < filtered.length && (
              <button type="button" className={styles.btnLoadMore} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Load more appointments
              </button>
            )}
          </div>
        </>
      )}

      {modal?.type === "details" && (
        <AppointmentDetailsModal
          appt={modal.appt}
          onClose={closeModal}
          onConfirm={handleConfirm}
          onCancel={(appt) => setModal({ type: "cancel", appt })}
        />
      )}
      {modal?.type === "confirm" && (
        <ConfirmAppointmentModal appt={modal.appt} onClose={closeModal} onConfirm={() => handleConfirm(modal.appt)} />
      )}
      {modal?.type === "cancel" && (
        <CancelAppointmentModal
          appt={modal.appt}
          onClose={closeModal}
          onSubmit={(reason, message) => handleCancel(modal.appt, reason, message)}
        />
      )}
    </div>
  );
};
