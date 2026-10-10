import type { DashboardTab } from "../../ProviderDashboard";
import doctorDefaultImage from "../../../assets/img/doctorImage.svg";
import caution from '../../../assets/img/caution.svg';
import profileImage from '../../../assets/img/profile-sidebar-icon.svg';
import appointments from '../../../assets/img/appointments-icon.svg';
import service from '../../../assets/img/services-icon.svg';
import availability from '../../../assets/img/availability-icon.svg';
import success from '../../../assets/img/success-sidebar-icon.svg';

import styles from './DashboardSidebar.module.scss';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isPublished: boolean;
  photoPreview: string | null;
  completionPercentage: number;
  firstName: string;
  lastName: string;
}

export const DashboardSidebar = ({ 
  activeTab, 
  setActiveTab, 
  isPublished, 
  photoPreview, 
  completionPercentage,
  firstName,
  lastName,
}: SidebarProps) => {
  const displayName = firstName && lastName ? `Dr. ${firstName} ${lastName}` : "Healthcare professional";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <img src={photoPreview || doctorDefaultImage} alt={displayName} className={styles.photo} />
        <h3 className={styles.name}>{displayName}</h3>
        <p className={styles.role}>Healthcare professional</p>
        
        <div className={`${styles.badge} ${isPublished ? styles.badgePublished : styles.badgeIncomplete}`}>
          {isPublished ? (
            <>
              <img src={success} alt="success icon" /> Profile published
            </>
          ) : (
            <>
              <img src={caution} alt="caution icon" /> Profile incomplete
            </>
          )}
        </div>

        {!isPublished && (
          <div className={styles.progress}>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBarFill} 
                style={{ 
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage >= 75 ? '#10B981' : '#F87171' 
                }}
              ></div>
            </div>
            <span className={styles.progressText}>{completionPercentage}% complete</span>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        <button 
          className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span><img src={profileImage} alt="profile" /></span> Professional profile
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === "services" ? styles.active : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <span><img src={service} alt="services" /></span> Services & prices
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === "availability" ? styles.active : ""}`}
          onClick={() => setActiveTab("availability")}
        >
          <span><img src={availability} alt="availability" /></span> Availability
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === "appointments" ? styles.active : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          <span><img src={appointments} alt="appointments" /></span> Appointments
        </button>
      </nav>
    </aside>
  );
};