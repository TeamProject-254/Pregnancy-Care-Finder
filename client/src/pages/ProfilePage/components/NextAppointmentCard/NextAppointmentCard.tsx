import styles from './NextAppointmentCard.module.scss';

export const NextAppointmentCard = ({ appointment, onViewDetails, onAddToCalendar, onCancel }) => {
  if (!appointment) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Next appointment</h2>
      <div className={styles.grid}>
        <div className={styles.details}>
          <div className={styles.doctorBlock}>
            <div className={styles.avatarPlaceholder} />
            <div>
              <h3 className={styles.doctorName}>{appointment.doctor.name}</h3>
              <p className={styles.doctorSpec}>{appointment.doctor.speciality}</p>
            </div>
          </div>

          <div className={styles.procedure}>
            <h4>{appointment.procedure}</h4>
            <p>{appointment.date}</p>
            <p>{appointment.location}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.solidBtn} onClick={() => onViewDetails(appointment.id)}>
            View details
          </button>
          <button className={styles.outlineBtn} onClick={() => onAddToCalendar(appointment.id)}>
            Add to calendar
          </button>
          <button className={styles.outlineBtn} onClick={() => onCancel(appointment.id)}>
            Cancel appointment
          </button>
        </div>
      </div>

      <p className={styles.notice}>
        To change the time, cancel this appointment and book a new available slot.
      </p>
    </div>
  );
};