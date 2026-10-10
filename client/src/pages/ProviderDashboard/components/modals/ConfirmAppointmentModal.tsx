import type { AppointmentItem } from "../tabs/AppointmentsTab";

interface Props {
  appt: AppointmentItem;
  onClose: () => void;
}

export const ConfirmAppointmentModal = ({ appt, onClose }: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content--small">
        <button className="close-btn modal-close-top" onClick={onClose}>✕</button>
        
        <div className="modal-icon-center">
          <div className="circle-check">✓</div>
        </div>

        <h3 className="modal-title-center">Confirm appointment?</h3>
        
        <p className="modal-text-center">
          Confirm the appointment with <strong>{appt.patientName}</strong><br/>
          on {appt.date} at {appt.time}
        </p>

        <div className="alert alert--info alert--centered">
          ℹ The patient will see the updated status in her personal cabinet
        </div>

        <div className="modal-actions-stack">
          <button className="btn-primary full-width">Confirm appointment</button>
          <button className="btn-outline-danger full-width" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};