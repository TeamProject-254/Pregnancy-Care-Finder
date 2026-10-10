import { useState } from "react";
import editIcon from "../../../../assets/img/edit-icon.svg";
import trashIcon from "../../../../assets/img/trash-icon.svg";

export interface ServiceItem {
  id: number;
  name: string;
  duration: string;
  price: string;
  active: boolean;
}

export const ServicesTab = () => {
  const [services, setServices] = useState([
    { id: 1, name: "Gynecologist consultation", duration: "45 min", price: "40$", active: true },
    { id: 2, name: "Maternal cardiac assessment", duration: "60 min", price: "70$", active: true }
  ]);

  const addService = () => {
    setServices([...services, { id: Date.now(), name: "New Service", duration: "30 min", price: "0$", active: false }]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  return (
    <div className="tab__container">
      <h2>Services & prices</h2>
      <p className="tab__subtitle">Manage the services patients can book.</p>
      <div className="alert alert--info">ℹ Your services and prices will be visible on your public profile.</div>

      <table className="services-table">
        <thead>
          <tr><th>Service</th><th>Duration</th><th>Price</th><th>Status</th><th>Action's</th></tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id}>
              <td><strong>{s.name}</strong></td>
              <td>{s.duration}</td>
              <td>{s.price}</td>
              <td><span className={`status-badge ${s.active ? 'status--active' : 'status--hidden'}`}>{s.active ? "Active" : "Hidden"}</span></td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="icon-btn"><img src={editIcon} alt="Edit" className="icon-img" /></button>
                <button type="button" className="icon-btn" onClick={() => removeService(s.id)}><img src={trashIcon} alt="Delete" className="icon-img" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button type="button" className="btn-outline" onClick={addService}>Add another service</button>
        <button type="button" className="btn-primary">Save changes</button>
      </div>
    </div>
  );
};