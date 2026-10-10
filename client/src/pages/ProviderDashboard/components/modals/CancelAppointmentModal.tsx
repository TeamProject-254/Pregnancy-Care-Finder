interface Props {
  onClose: () => void;
}

export const CancelAppointmentModal = ({ onClose }: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content--small">
        <button className="close-btn modal-close-top" onClick={onClose}>✕</button>
        
        <div className="modal-icon-center">
          <div className="circle-cross">✕</div>
        </div>

        <h3 className="modal-title-center">Cancel appointment?</h3>
        <p className="modal-text-center">The time will become available for booking again.</p>

        <form className="modal-form">
          <div className="form-group full-width">
            <label>Cancellation reason</label>
            <select defaultValue="Doctor unavailable">
              <option value="Doctor unavailable">Doctor unavailable</option>
              <option value="Rescheduling needed">Rescheduling needed</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Message to patient (optional)</label>
            <textarea rows={3}></textarea>
          </div>

          <div className="alert alert--info alert--centered">
            ℹ The patient will be notified.
          </div>

          <div className="modal-actions-stack">
            <button type="button" className="btn-primary full-width">Cancel appointment</button>
            <button type="button" className="btn-outline-danger full-width" onClick={onClose}>Keep appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
};