import type { AppointmentItem } from "../tabs/AppointmentsTab";
import patientPlaceholder from "../../../../assets/img/doctor-icon.svg"; // Тимчасово юзаємо ту саму фотку

interface Props {
  appt: AppointmentItem;
  onClose: () => void;
}

export const AppointmentDetailsModal = ({ appt, onClose }: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Appointments details</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="patient-profile-snippet">
          <img src={patientPlaceholder} alt={appt.patientName} />
          <div className="snippet-info">
            <h4>{appt.patientName}</h4>
            <p>Patient</p>
            <p className="pregnancy-week">Pregnancy week: <strong>{appt.pregnancyWeek}</strong></p>
          </div>
        </div>

        <ul className="details-list">
          <li><span>Service</span> <strong>{appt.service}</strong></li>
          <li><span>Date and time</span> <strong>Tuesday, {appt.date}, {appt.time}</strong></li>
          <li><span>Duration</span> <strong>{appt.duration}</strong></li>
          <li><span>Location</span> <strong>Medclinic, 34 Shevchenko street, Kyiv</strong></li>
          <li className="price-row"><span>Price</span> <strong className="price-highlight">40$</strong></li>
        </ul>

        <div className="form-group full-width mt-4">
          <label>Message to patient (optional)</label>
          <textarea rows={3}></textarea>
        </div>

        <div className="modal-actions-stack">
          <button className="btn-primary full-width">Confirm appointment</button>
          <button className="btn-outline-danger full-width" onClick={onClose}>Cancel appointment</button>
        </div>
      </div>
    </div>
  );
};