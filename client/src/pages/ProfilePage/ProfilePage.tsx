import { useState } from 'react';
import styles from './ProfilePage.module.scss';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>Pregnancy Care Finder</div>
        <nav className={styles.nav}>
          <a href="#search" className={styles.navLink}>Search</a>
          <a href="#cabinet" className={styles.navLinkActive}>Personal cabinet</a>
          <button className={styles.logoutBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Log out</span>
          </button>
        </nav>
      </header>

      <div className={styles.heroSection}>
        <div>
          <h1 className={styles.title}>Welcome back, username</h1>
          <p className={styles.subtitle}>Manage your profile and appointments</p>
        </div>
        <button className={styles.outlineBtnLg}>Find a doctor</button>
      </div>

      <main className={styles.gridContainer}>
        <aside className={styles.profileCard}>
          <div className={styles.avatarPlaceholder} />
          <h2 className={styles.userName}>Username</h2>
          <span className={styles.userRole}>patient account</span>

          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Location</span>
            <span className={styles.infoValue}>Kyiv</span>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Preferred languages</span>
            <span className={styles.infoValue}>Ukrainian, English</span>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Pregnancy week</span>
            <div className={styles.weekBadge}>Week 18</div>
          </div>

          <button className={styles.outlineBtn}>Edit profile</button>
        </aside>

        <section className={styles.contentArea}>
          <div className={styles.card}>
            <h2 className={styles.sectionHeading}>Next appointment</h2>
            <div className={styles.nextApptGrid}>
              <div className={styles.apptDetails}>
                <div className={styles.doctorBlock}>
                  <div className={styles.doctorAvatar} />
                  <div>
                    <h3 className={styles.doctorName}>Doctor name</h3>
                    <p className={styles.doctorSpec}>Cardiologist</p>
                  </div>
                </div>

                <div className={styles.procedureInfo}>
                  <h4>2nd Trimester Anatomy scan</h4>
                  <p>Thursday, Sep 28, 10:00 AM, 45m</p>
                  <p>medclinic, name street</p>
                </div>
              </div>

              <div className={styles.apptActions}>
                <button className={styles.solidBtn}>View details</button>
                <button className={styles.outlineBtn}>Add to calendar</button>
                <button className={styles.outlineBtn}>Cancel appointment</button>
              </div>
            </div>
            <p className={styles.apptNotice}>
              To change the time, cancel this appointment and book a new available slot.
            </p>
          </div>

          <div className={styles.appointmentsSection}>
            <h2 className={styles.sectionHeading}>My appointments</h2>

            <div className={styles.tabButtons}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming(2)
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'past' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past(3)
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
                    <tr>
                      <td>
                        <strong>Oct 14. 2026</strong>
                        <span>14:30</span>
                      </td>
                      <td>
                        <strong>Dr name</strong>
                        <span>Speciality</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span>
                      </td>
                      <td>
                        <button className={styles.tableActionBtn}>Cancel</button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Nov 14. 2026</strong>
                        <span>14:30</span>
                      </td>
                      <td>
                        <strong>Dr name</strong>
                        <span>Speciality</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>Confirmed</span>
                      </td>
                      <td>
                        <button className={styles.tableActionBtn}>Cancel</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button className={styles.outlineBtnFull}>View all appointments</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
            </svg>
          </div>
          <span className={styles.footerLogoText}>Pregnancy Care<br />Finder</span>
        </div>

        <ul className={styles.footerLinks}>
          <li><a href="#search">Search</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>

        <div className={styles.footerLegal}>
          <p>Copyright: © 2026 Pregnancy Care Finder. All rights reserved.</p>
          <a href="#terms">Terms of Service</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};