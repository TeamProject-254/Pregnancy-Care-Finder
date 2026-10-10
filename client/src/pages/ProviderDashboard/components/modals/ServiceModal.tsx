import type { ServiceItem } from "../tabs/ServicesTab.tsx";

interface ServiceModalProps {
  service: ServiceItem | null; // Якщо null - це створення, якщо є об'єкт - редагування
  onClose: () => void;
}

export const ServiceModal = ({ service, onClose }: ServiceModalProps) => {
  const isEdit = !!service;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEdit ? "Edit service" : "Add service"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <p className="modal-desc">Add a service patients can book from your public profile</p>

        <form className="modal-form">
          <div className="form-group full-width">
            <label>Service name</label>
            <select defaultValue={service?.name || ""}>
              <option value="" disabled>Select a service</option>
              <option value="Cardiology consultation">Cardiology consultation</option>
              <option value="Gynecologist consultation">Gynecologist consultation</option>
            </select>
            {isEdit && (
              <span className="custom-service-link">Can't find your service? Add a custom service</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <select defaultValue={service?.duration || "45 min"}>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <select defaultValue={service?.price || ""}>
                <option value="" disabled>Write a price</option>
                <option value="30$">30$</option>
                <option value="40$">40$</option>
                <option value="70$">70$</option>
              </select>
            </div>
          </div>

          <div className="toggle-group">
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked={service?.active ?? true} />
              <span className="slider"></span>
            </label>
            <div className="toggle-info">
              <h4>Visible to patients</h4>
              <p>Patients can book this service</p>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-primary full-width">
              {isEdit ? "Save changes" : "Add service"}
            </button>
            <button type="button" className="btn-outline full-width" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};