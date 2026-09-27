import styles from './ProfileCard.module.scss';

export const ProfileCard = ({ user, onEdit }) => {
  if (!user) return null;

  return (
    <aside className={styles.card}>
      <div className={styles.avatarPlaceholder} />
      <h2 className={styles.userName}>{user.name}</h2>
      <span className={styles.userRole}>{user.role}</span>

      <div className={styles.infoGroup}>
        <span className={styles.infoLabel}>Location</span>
        <span className={styles.infoValue}>{user.location}</span>
      </div>

      <div className={styles.infoGroup}>
        <span className={styles.infoLabel}>Preferred languages</span>
        <span className={styles.infoValue}>{user.languages.join(', ')}</span>
      </div>

      <div className={styles.infoGroup}>
        <span className={styles.infoLabel}>Pregnancy week</span>
        <div className={styles.weekBadge}>Week {user.pregnancyWeek}</div>
      </div>

      <button className={styles.editBtn} onClick={onEdit}>
        Edit profile
      </button>
    </aside>
  );
};