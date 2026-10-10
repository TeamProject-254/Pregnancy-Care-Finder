import type { DashboardTab } from "../../ProviderDashboard";
import doctorDefaultImage from "../../../assets/img/doctorImage.svg";
import caution from '../../../assets/img/caution.svg';
import profileImage from '../../../assets/img/profile-sidebar-icon.svg';
import appointments from '../../../assets/img/appointments-icon.svg';
import service from '../../../assets/img/services-icon.svg';
import availability from '../../../assets/img/availability-icon.svg';
import success from '../../../assets/img/success-sidebar-icon.svg';

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
    <aside className="sidebar">
      <div className="sidebar__profile">
        <img src={photoPreview || doctorDefaultImage} alt={displayName} className="sidebar__photo" />
        <h3 className="sidebar__name">{displayName}</h3>
        <p className="sidebar__role">Healthcare professional</p>
        
        <div className={`sidebar__badge ${isPublished ? "sidebar__badge--published" : "sidebar__badge--incomplete"}`}>
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
          <div className="sidebar__progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage >= 75 ? '#10B981' : '#F87171' 
                }}
              ></div>
            </div>
            <span className="progress-text">{completionPercentage}% complete</span>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        <button 
          className={`sidebar__nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span><img src={profileImage} alt="profileImage" /></span> Professional profile
        </button>
        <button 
          className={`sidebar__nav-item ${activeTab === "services" ? "active" : ""}`}
          onClick={() => setActiveTab("services")}
        >
          <span><img src={service} alt="service"></img></span> Services & prices
        </button>
        <button 
          className={`sidebar__nav-item ${activeTab === "availability" ? "active" : ""}`}
          onClick={() => setActiveTab("availability")}
        >
          <span><img src={availability} alt="availability"></img></span> Availability
        </button>
        <button 
          className={`sidebar__nav-item ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          <span><img src={appointments} alt="appointments" /></span> Appointments
        </button>
      </nav>
    </aside>
  );
};