import { useState } from "react";
import trashIcon from "../../../../assets/img/trash-icon.svg";

export const AvailabilityTab = () => {
  const [schedule, setSchedule] = useState([
    { day: "Monday", active: true, intervals: [{ start: "09:00", end: "17:00" }] },
    { day: "Tuesday", active: true, intervals: [{ start: "09:00", end: "17:00" }] }
  ]);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const addInterval = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].intervals.push({ start: "12:00", end: "13:00" });
    setSchedule(newSchedule);
  };

  const removeInterval = (dayIndex: number, intervalIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].intervals.splice(intervalIndex, 1);
    setSchedule(newSchedule);
  };

  return (
    <div className="tab__container">
      <h2>Availability</h2>
      <p className="tab__subtitle">Set your regular working hours</p>

      {schedule.map((dayItem, dIndex) => (
        <div key={dayItem.day} className="schedule-row">
          <div className="schedule-day">
            <span className="day-name">{dayItem.day}</span>
            <label className="toggle-switch">
              <input type="checkbox" checked={dayItem.active} onChange={() => toggleDay(dIndex)} />
              <span className="slider"></span>
            </label>
          </div>
          
          <div className="schedule-intervals">
            {dayItem.active ? (
              dayItem.intervals.map((interval, iIndex) => (
                <div key={iIndex} className="interval-group">
                  <input type="time" defaultValue={interval.start} /> to <input type="time" defaultValue={interval.end} />
                  <button type="button" className="icon-btn" onClick={() => removeInterval(dIndex, iIndex)}>
                    <img src={trashIcon} alt="Delete" className="icon-img" />
                  </button>
                </div>
              ))
            ) : (
              <span style={{ color: "#9CA3AF" }}>Unavailable</span>
            )}
            {dayItem.active && <button type="button" className="add-interval" onClick={() => addInterval(dIndex)}>+ Add interval</button>}
          </div>
        </div>
      ))}
    </div>
  );
};