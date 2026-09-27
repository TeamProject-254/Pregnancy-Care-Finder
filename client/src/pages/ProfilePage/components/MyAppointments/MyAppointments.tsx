import React, { useState } from 'react';
import styles from './MyAppointments.module.scss';

export const MyAppointments = ({ appointments = [], onCancel, onViewAll }) => {
  const [tab, setTab] = useState('upcoming');

  const upcomingList = appointments.filter((app) => app.type === 'upcoming');
  const pastList = appointments.filter((app) => app.type === 'past');

  const displayedList = tab === 'upcoming' ? upcomingList : pastList;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My appointments</h2>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === 'upcoming' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming({upcomingList.length})
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'past' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('past')}
        >
          Past({pastList.length})
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>DATE & TIME</th>
                <th>PROVIDER / SERVICE</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.date}</strong>
                    <span>{item.time}</span>
                  </td>
                  <td>
                    <strong>{item.doctorName}</strong>
                    <span>{item.speciality}</span>
                  </td>
                  <td>
                    <span className={styles.statusBadge}>{item.status}</span>
                  </td>
                  <td>
                    {item.type === 'upcoming' && (
                      <button 
                        className={styles.cancelAction}
                        onClick={() => onCancel(item.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className={styles.viewAllBtn} onClick={onViewAll}>
          View all appointments
        </button>
      </div>
    </div>
  );
};