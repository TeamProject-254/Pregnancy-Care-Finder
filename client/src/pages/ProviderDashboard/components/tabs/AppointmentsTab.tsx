import { useState } from "react";
import { AppointmentDetailsModal } from "../modals/AppointmentDetailsModal.tsx";
import { ConfirmAppointmentModal } from "../modals/ConfirmAppointmentModal.tsx";
import { CancelAppointmentModal } from "../modals/CancelAppointmentModal.tsx";

type SubTab = "Upcoming" | "Past" | "Cancelled";

export interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  patientName: string;
  pregnancyWeek: string;
  service: string;
  duration: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled by patient" | "Cancelled by Doctor";
}

export const AppointmentsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("Upcoming");
  
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [modalType, setModalType] = useState<"details" | "confirm" | "cancel" | null>(null);

  const appointments: AppointmentItem[] = [
    { id: "1", date: "Oct 14, 2026", time: "09:00", patientName: "Hanna Kovalenko", pregnancyWeek: "Week 18", service: "Cardiology consultation", duration: "45 min", status: "Pending" },
    { id: "2", date: "Sep 14, 2026", time: "09:00", patientName: "Maria Bondar", pregnancyWeek: "Week not shared", service: "Follow-up consultation", duration: "60 min", status: "Confirmed" },
  ];

  const openModal = (type: "details" | "confirm" | "cancel", appt: AppointmentItem) => {
    setSelectedAppointment(appt);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setModalType(null);
  };

  return (
    <div className="tab__container">
      <h2>Appointments</h2>
      <p className="tab__subtitle">Review and manage patient appointment requests.</p>

      <div className="stats-grid">
        <div className="stat-card stat-card--pending">
          <span className="stat-icon">🕒</span>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value">2</span>
          </div>
        </div>
        <div className="stat-card stat-card--confirmed">
          <span className="stat-icon">✓</span>
          <div className="stat-info">
            <span className="stat-label">Confirmed</span>
            <span className="stat-value">5</span>
          </div>
        </div>
        <div className="stat-card stat-card--today">
          <span className="stat-icon">📅</span>
          <div className="stat-info">
            <span className="stat-label">Today</span>
            <span className="stat-value">3</span>
          </div>
        </div>
      </div>

      <div className="subtabs">
        <button className={`subtab ${activeSubTab === "Upcoming" ? "active" : ""}`} onClick={() => setActiveSubTab("Upcoming")}>Upcoming (7)</button>
        <button className={`subtab ${activeSubTab === "Past" ? "active" : ""}`} onClick={() => setActiveSubTab("Past")}>Past (12)</button>
        <button className={`subtab ${activeSubTab === "Cancelled" ? "active" : ""}`} onClick={() => setActiveSubTab("Cancelled")}>Cancelled (12)</button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <input type="text" placeholder="Search by patient or service" />
        </div>
        <select><option>All dates</option></select>
        <select><option>All statuses</option></select>
      </div>

      <div className="table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Date & time</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Status</th>
              <th>Action's</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>
                  <div className="date-cell">
                    <strong>{appt.date}</strong>
                    <span>{appt.time}</span>
                  </div>
                </td>
                <td>
                  <div className="patient-cell">
                    <strong>{appt.patientName}</strong>
                    <span>{appt.pregnancyWeek}</span>
                  </div>
                </td>
                <td>
                  <div className="service-cell">
                    <strong>{appt.service}</strong>
                    <span>{appt.duration}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status--${appt.status.split(' ')[0].toLowerCase()}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="actions-cell">
                  {appt.status === "Pending" ? (
                    <div className="action-buttons-col">
                      <button className="btn-primary-small" onClick={() => openModal("confirm", appt)}>Confirm</button>
                      <button className="btn-outline-small" onClick={() => openModal("details", appt)}>View details</button>
                    </div>
                  ) : (
                    <div className="action-buttons-row">
                      <button className="btn-outline-small" onClick={() => openModal("details", appt)}>View details</button>
                    </div>
                  )}
                  {appt.status !== "Completed" && !appt.status.includes("Cancelled") && (
                     <button className="icon-btn delete-btn" onClick={() => openModal("cancel", appt)}>🗑️</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="table-footer-center">
          <span className="showing-text">Showing 3 of 6 appointments</span>
          <button className="btn-outline">Load more appointments</button>
        </div>
      </div>

      {modalType === "details" && selectedAppointment && <AppointmentDetailsModal appt={selectedAppointment} onClose={closeModal} />}
      {modalType === "confirm" && selectedAppointment && <ConfirmAppointmentModal appt={selectedAppointment} onClose={closeModal} />}
      {modalType === "cancel" && selectedAppointment && <CancelAppointmentModal onClose={closeModal} />}
    </div>
  );
};