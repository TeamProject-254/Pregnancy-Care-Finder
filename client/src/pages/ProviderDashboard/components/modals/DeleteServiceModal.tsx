interface DeleteServiceModalProps {
  serviceName: string;
  onClose: () => void;
}

export const DeleteServiceModal = ({ serviceName, onClose }: DeleteServiceModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content--small">
        <button className="close-btn modal-close-top" onClick={onClose}>✕</button>
        
        <div className="modal-icon-center">
          <div className="circle-check">✓</div>
        </div>

        <h3 className="modal-title-center">Delete service?</h3>
        
        <p className="modal-text-center">
          Patients will no longer be able to book <strong>{serviceName}</strong>. 
          Existing appointments will not be affected.
        </p>

        <div className="alert alert--warning alert--centered">
          ℹ If you only want to stop new bookings, you can hide the service instead.
        </div>

        <div className="modal-actions-stack">
          <button className="btn-danger full-width">Delete service</button>
          <button className="btn-outline full-width">Hide service</button>
          <button className="btn-ghost-danger full-width" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};