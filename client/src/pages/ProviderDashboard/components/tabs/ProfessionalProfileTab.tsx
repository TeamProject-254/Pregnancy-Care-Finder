import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ProviderAvailability } from "../../../../api/availabilities";
import { deleteMedicalService, type MedicalService } from "../../../../api/medicalServices";
import doctorDefaultImage from "../../../../assets/img/doctorImage.svg";
import { MultiSelectDropdown } from "../../../../components/MultiSelectDropdown/MultiSelectDropdown";
import { SelectDropdown } from "../../../../components/SelectDropdown/SelectDropdown";
import { DeleteServiceModal } from "../modals/DeleteServiceModal";
import { hideMedicalService } from "../hiddenServices";
import { PROVIDER_LANGUAGES, PROVIDER_SPECIALTIES } from "../../../../constants/providerOptions";
import caution from '../../../../assets/img/warning!-icon.svg';
import camera from '../../../../assets/img/photo.svg';
import clock from '../../../../assets/img/clock-icon.svg';
import calendar from '../../../../assets/img/calendar-icon.svg';
import trash from '../../../../assets/img/trash-icon.svg';
import success from '../../../../assets/img/success-icon.svg';
import successSidebar from '../../../../assets/img/success-sidebar-icon.svg';
import circleBroken from '../../../../assets/circle-broken-icon.svg';
import workIcon from '../../../../assets/img/icon-work-16.svg';
import languagesIcon from '../../../../assets/img/icon-language-gray.svg';
import profileIcon from '../../../../assets/img/profile-icon.svg';
import calendarSmall from '../../../../assets/img/icon-calendar-16.svg';
import timeSmall from '../../../../assets/img/icon-time-16.svg';
import geoSmall from '../../../../assets/img/icon-geo-16.svg';
import chevronDown from '../../../../assets/img/icon-chevron-down.svg';
import arrowRight from '../../../../assets/img/arrow-top.svg';
import type { DashboardTab, ProviderProfile } from "../../ProviderDashboard";
import { WEEK, mainWorkingHours, summarizeAvailability, weeklyHours } from "../availabilitySummary";
import styles from './ProfessionalProfileTab.module.scss';

const CLOUDINARY_CLOUD_NAME = "gjckdqml";
const CLOUDINARY_UPLOAD_PRESET = "BloomCare";

interface Props {
  profile: ProviderProfile; isEditing: boolean; isLoading: boolean; isSaving: boolean;
  loadError: string; onRetryLoad: () => void; showBasicFields: boolean;
  publishIssues: string[]; completionPercentage: number; serverError: string; email: string;
  availabilities: ProviderAvailability[];
  services: MedicalService[];
  serviceStorageKey: string;
  onServicesChange: (services: MedicalService[]) => void;
  onUpdate: <K extends keyof ProviderProfile>(key: K, value: ProviderProfile[K]) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
  onSwitchTab: (tab: DashboardTab) => void;
}

export const ProfessionalProfileTab = ({
  profile, isEditing, isLoading, isSaving, loadError, onRetryLoad, showBasicFields, publishIssues, completionPercentage,
  serverError, email, availabilities, services, serviceStorageKey, onServicesChange, onUpdate, onSave, onEdit, onSwitchTab
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [languagesError, setLanguagesError] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches,
  );
  const [basicDetailsOpen, setBasicDetailsOpen] = useState(false);
  const [servicesDetailsOpen, setServicesDetailsOpen] = useState(false);
  const [availabilityDetailsOpen, setAvailabilityDetailsOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MedicalService | null>(null);
  const [openServiceId, setOpenServiceId] = useState<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const canPublish = publishIssues.length === 0;
  const availabilitySummary = summarizeAvailability(availabilities);
  const activeWeekdays = weeklyHours(availabilities);
  const workingHours = mainWorkingHours(availabilities);

  const removeService = async (service: MedicalService) => {
    await deleteMedicalService(service.id);
    onServicesChange(services.filter((item) => item.id !== service.id));
    setServiceToDelete(null);
  };

  const hideService = async (service: MedicalService) => {
    await hideMedicalService(serviceStorageKey, service);
    onServicesChange(services.filter((item) => item.id !== service.id));
    setServiceToDelete(null);
  };

  const deleteServiceModal = serviceToDelete && (
    <DeleteServiceModal
      serviceName={serviceToDelete.name}
      onClose={() => setServiceToDelete(null)}
      onDelete={() => removeService(serviceToDelete)}
      onHide={() => hideService(serviceToDelete)}
    />
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (profile.languages.length === 0) {
      event.preventDefault();
      setLanguagesError("Select at least one language.");
      return;
    }
    setLanguagesError("");
    onSave(event);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      event.target.value = "";
      setPhotoError("Please choose a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setPhotoError("Please choose an image smaller than 5 MB.");
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.secure_url) {
        onUpdate("photoUrl", data.secure_url);
      } else {
        setPhotoError("Failed to upload image.");
      }
    } catch {
      setPhotoError("Error uploading image. Please check your connection.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = () => {
    onUpdate("photoUrl", null);
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) return <div className={styles.tabContainer}>Loading...</div>;

  if (loadError) {
    return (
      <div className={styles.tabContainer}>
        <div className="alert alert--warning">{loadError}</div>
        <button type="button" className={styles.actionBtnOutline} onClick={onRetryLoad}>Try again</button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={styles.tabContainer}>
        <h2 className={styles.mainTitle}>{profile.published ? "Edit professional profile" : "Complete your professional profile"}</h2>
        <p className={styles.tabSubtitle}>Add the information patients need before your profile appears in search</p>

        {!profile.published && (
          <div className={styles.warningAlert}>
            <img src={caution} alt="caution" />
            <div>
              <div className={styles.warningTitle}>
                Your profile is not visible in search yet.
              </div>
              <div className={styles.warningSubtitle}>
                Complete your profile to appear in search results and start receiving appointment requests
              </div>
            </div>
          </div>
        )}

        {!profile.published && (
          <div className={styles.mobileCompletion}>
            <div className={styles.mobileProgressTrack}>
              <span style={{ width: `${completionPercentage}%` }} />
            </div>
            <span>{completionPercentage}% complete</span>
          </div>
        )}

        {serverError && <div className="alert alert--warning">{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <details
            className={styles.basicDetails}
            open={profile.published || !isMobile || basicDetailsOpen}
          >
            {profile.published ? (
              <summary className={styles.hiddenSummary} aria-hidden="true" />
            ) : (
              <summary
                className={styles.incompleteSummary}
                onClick={(event) => {
                  event.preventDefault();
                  setBasicDetailsOpen((isOpen) => !isOpen);
                }}
              >
                <img
                  className={styles.summaryStatus}
                  src={canPublish ? successSidebar : circleBroken}
                  alt=""
                  aria-hidden="true"
                />
                <span className={styles.summaryText}>
                  <strong>Basic information</strong>
                  <small>Profile details and professional background</small>
                </span>
                <img className={styles.summaryChevron} src={arrowRight} alt="" aria-hidden="true" />
              </summary>
            )}
            <div className={styles.basicFields}>
          {showBasicFields && (
            <>
              <div className="form-row">
                <div className="form-group"><label>First name</label><input required className={styles.mainInput} value={profile.firstName} onChange={(e) => onUpdate("firstName", e.target.value)} /></div>
                <div className="form-group"><label>Last name</label><input required className={styles.mainInput} value={profile.lastName} onChange={(e) => onUpdate("lastName", e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Professional role</label><input required className={styles.mainInput} placeholder="Doctor" value={profile.professionalRole} onChange={(e) => onUpdate("professionalRole", e.target.value)} /></div>
                <div className="form-group"><label>Years of experience</label><input required className={styles.mainInput} type="number" min="0" step="1" value={profile.yearsOfExperience} onChange={(e) => onUpdate("yearsOfExperience", e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Contact phone</label><input required className={styles.mainInput} type="tel" value={profile.contactPhone} onChange={(e) => onUpdate("contactPhone", e.target.value)} /></div>
                <div className="form-group"><label>Consultation city/address</label><input required className={styles.mainInput} value={profile.address} onChange={(e) => onUpdate("address", e.target.value)} /></div>
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Speciality</label>
              <SelectDropdown
                id="provider-speciality"
                ariaLabel="Speciality"
                options={PROVIDER_SPECIALTIES}
                value={profile.speciality}
                placeholder="Select speciality"
                onChange={(value) => onUpdate("speciality", value)}
              />
            </div>
            <div className="form-group">
              <label>Languages spoken</label>
              <MultiSelectDropdown id="provider-languages" label="Languages spoken" options={PROVIDER_LANGUAGES} value={profile.languages} placeholder="Select languages" onChange={(l) => { onUpdate("languages", l); if (l.length > 0) setLanguagesError(""); }} />
              {languagesError && <span className="field-error">{languagesError}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Professional description</label>
            <textarea required className={styles.mainTextarea} rows={5} value={profile.description} onChange={(e) => onUpdate("description", e.target.value)} placeholder="I am a cardiologist with 12 years of experience..." />
          </div>

          <div className={styles.photoSection}>
            {profile.photoUrl ? (
              <div className={styles.photoPreview}>
                <img src={profile.photoUrl} alt="Provider" className={styles.mainImage} />
                <button type="button" onClick={removePhoto} className={styles.removeBtn} disabled={isUploadingPhoto}>✕</button>
              </div>
            ) : (
              <div className={styles.photoPreview}>
                <img src={doctorDefaultImage} alt="Provider" className={styles.placeholderImage} />
              </div>
            )}
            
            <div onClick={() => !isUploadingPhoto && fileInputRef.current?.click()} className={styles.photoUpload} style={{ opacity: isUploadingPhoto ? 0.6 : 1, cursor: isUploadingPhoto ? 'not-allowed' : 'pointer' }}>
              <div className={styles.uploadTitle}>
                <img src={camera} alt="camera" />
                <span>{isUploadingPhoto ? "Uploading..." : "Change photo"}</span>
              </div>
              <span className={styles.uploadSubtitle}>JPG or PNG, max 5MB</span>
              {photoError && <span className="field-error">{photoError}</span>}
            </div>
            <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} disabled={isUploadingPhoto} />
          </div>
            </div>
          </details>

          <hr className={styles.divider} />

          <details
            className={`${styles.sectionContainer} ${styles.mobileSection}`}
            open={profile.published || !isMobile || servicesDetailsOpen}
          >
            {profile.published ? (
              <summary className={styles.hiddenSummary} aria-hidden="true" />
            ) : (
              <summary
                className={styles.incompleteSummary}
                onClick={(event) => {
                  event.preventDefault();
                  setServicesDetailsOpen((isOpen) => !isOpen);
                }}
              >
                <img
                  className={styles.summaryStatus}
                  src={services.length > 0 ? successSidebar : circleBroken}
                  alt=""
                  aria-hidden="true"
                />
                <span className={styles.summaryText}>
                  <strong>Services and prices</strong>
                  <small>Add at least one service</small>
                </span>
                <img className={styles.summaryChevron} src={arrowRight} alt="" aria-hidden="true" />
              </summary>
            )}
            <div className={styles.mobileSectionContent}>
            <h3 className={styles.sectionTitle}>Services and prices</h3>
            <p className={styles.sectionSubtitle}>
              Add the services you offer and set your prices. These will be visible to patients on your profile.
            </p>

            {services.length ? services.map((service) => (
              <div key={service.id} className={styles.serviceRow}>
                <span className={`${styles.mainSelect} ${styles.selectLarge}`}>{service.name}</span>
                <span className={`${styles.mainSelect} ${styles.selectSmall}`}>{service.durationMinutes} min</span>
                <span className={`${styles.mainSelect} ${styles.selectSmall}`}>{Number(service.price)}$</span>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setServiceToDelete(service)}
                  aria-label={`Remove ${service.name}`}
                >
                  <img src={trash} alt="" />
                </button>
              </div>
            )) : <p className={styles.sectionSubtitle}>No services added yet.</p>}
            <button type="button" onClick={() => onSwitchTab("services")} className={`${styles.actionBtnOutline} ${styles.addServicesBtn}`}>
              Add services
            </button>
            </div>
          </details>

          <details
            className={`${styles.sectionContainer} ${styles.mobileSection}`}
            open={profile.published || !isMobile || availabilityDetailsOpen}
          >
            {profile.published ? (
              <summary className={styles.hiddenSummary} aria-hidden="true" />
            ) : (
              <summary
                className={styles.incompleteSummary}
                onClick={(event) => {
                  event.preventDefault();
                  setAvailabilityDetailsOpen((isOpen) => !isOpen);
                }}
              >
                <img
                  className={styles.summaryStatus}
                  src={availabilitySummary.length > 0 ? successSidebar : circleBroken}
                  alt=""
                  aria-hidden="true"
                />
                <span className={styles.summaryText}>
                  <strong>Availability</strong>
                  <small>Set your working hours</small>
                </span>
                <img className={styles.summaryChevron} src={arrowRight} alt="" aria-hidden="true" />
              </summary>
            )}
            <div className={styles.mobileSectionContent}>
            <div className={styles.headerFlex}>
              <h3 className={styles.sectionTitle}>Availability</h3>
              <button type="button" onClick={() => onSwitchTab("availability")} className={styles.actionBtnOutline}>
                Manage availability
              </button>
            </div>
            <p className={styles.sectionSubtitle}>
              Set the days and times when patients can book appointment
            </p>

            <div className={styles.daysContainer}>
              {WEEK.map((day) => (
                <button
                  key={day.weekday}
                  type="button"
                  className={`${styles.dayBtn} ${activeWeekdays.has(day.weekday) ? styles.active : ""}`}
                  onClick={() => onSwitchTab("availability")}
                >
                  {day.short}
                </button>
              ))}
            </div>

            <div className={styles.intervalRow}>
              <span className={styles.workingHoursLabel}>
                <img src={clock} alt="" /> Working hours
              </span>
              <div className={styles.timeInputs}>
                <input type="time" readOnly className={styles.timeInput} value={workingHours?.start ?? ""} aria-label="Working hours start" />
                <span>to</span>
                <input type="time" readOnly className={styles.timeInput} value={workingHours?.end ?? ""} aria-label="Working hours end" />
              </div>
            </div>

            <div className={styles.intervalFooter}>
              <button type="button" onClick={() => onSwitchTab("availability")} className={styles.actionBtnOutline}>
                Add time interval
              </button>
            </div>
            </div>
          </details>

          {publishIssues.length > 0 && (
            <div className={styles.publishIssues} role="status">
              <strong>Before publishing, fix the following:</strong>
              <ul>
                {publishIssues.map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </div>
          )}
          
          <div className={styles.formFooter}>
            <button type="submit" className="btn-primary" disabled={!canPublish || isUploadingPhoto || isSaving}>
              {isSaving ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </form>
        {deleteServiceModal}
      </div>
    );
  }

  return (
    <div className={styles.tabContainerTransparent}>
      <div className={styles.mobileView}>
        <div className={styles.mobileDoctor}>
          <img className={styles.mobilePhoto} src={profile.photoUrl || doctorDefaultImage} alt="" />
          <div className={styles.mobileName}>
            <strong>Dr. {profile.firstName} {profile.lastName}</strong>
            <span>Healthcare professional</span>
          </div>
          <span className={styles.mobileStatus}>
            <img src={successSidebar} alt="" /> Profile published
          </span>
        </div>

        <section className={styles.mobileBlock}>
          <div className={styles.mobileBlockHead}>
            <h3>Professional profile</h3>
            <button type="button" onClick={onEdit}>Edit</button>
          </div>
          <ul className={styles.mobileRows}>
            <li>
              <span><img src={workIcon} alt="" />Specialty</span>
              <span>{profile.speciality}</span>
            </li>
            <li>
              <span><img src={languagesIcon} alt="" />Languages</span>
              <span>{profile.languages.join(", ")}</span>
            </li>
            <li>
              <span><img src={profileIcon} alt="" />Professional role</span>
              <span>{profile.professionalRole}</span>
            </li>
            <li>
              <span><img src={calendarSmall} alt="" />Years of experience</span>
              <span>{profile.yearsOfExperience} years</span>
            </li>
            <li>
              <span><img src={timeSmall} alt="" />Contact phone</span>
              <span>{profile.contactPhone}</span>
            </li>
            <li className={styles.mobileRowStack}>
              <span><img src={geoSmall} alt="" />Consultation location</span>
              <span>{profile.address}</span>
            </li>
          </ul>
        </section>

        <section className={styles.mobileBlock}>
          <h3>About</h3>
          <p className={styles.mobileAbout}>{profile.description}</p>
        </section>

        <section className={styles.mobileBlock}>
          <div className={styles.mobileBlockHead}>
            <h3>Services and prices</h3>
            <button type="button" onClick={() => onSwitchTab("services")}>Manage</button>
          </div>
          <div className={styles.mobileServices}>
            <div className={styles.mobileServicesHead}>
              <span>Service</span>
              <span>Actions</span>
            </div>
            {services.length === 0 && <p className={styles.mobileEmpty}>No services added yet.</p>}
            {services.map((service) => (
              <div key={service.id} className={styles.mobileServiceItem}>
                <div className={styles.mobileServiceRow}>
                  <span className={styles.mobileServiceName}>
                    <span>{service.name}</span>
                    <img src={chevronDown} alt="" />
                  </span>
                  <button
                    type="button"
                    className={styles.mobileServiceDetails}
                    aria-expanded={openServiceId === service.id}
                    onClick={() => setOpenServiceId((current) => current === service.id ? null : service.id)}
                  >
                    <span>Details</span>
                    <img src={chevronDown} alt="" />
                  </button>
                </div>
                {openServiceId === service.id && (
                  <p className={styles.mobileServiceMeta}>{service.durationMinutes} min · {Number(service.price)}$</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.mobileBlock}>
          <div className={styles.mobileBlockHead}>
            <h3>Availability</h3>
            <button type="button" onClick={() => onSwitchTab("availability")}>Manage</button>
          </div>
          <div className={styles.mobileAvailability}>
            <img src={calendar} alt="" />
            <span>
              {availabilitySummary.length > 0
                ? availabilitySummary.map((line) => <span key={line}>{line}</span>)
                : "Not set"}
            </span>
          </div>
        </section>
      </div>
      <div className={styles.headerFlex}>
        <h2 className={styles.mainTitle}>Professional profile</h2>
        <button className={styles.actionBtnOutline} onClick={onEdit}>Edit profile</button>
      </div>
      
      <div className={styles.successAlert}>
        <img src={success} alt="success" className={styles.successImg} />
        Your profile is published and visible in search results.
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>First name</label>
          <input readOnly className={styles.mainInput} value={profile.firstName} placeholder="first name" />
        </div>
        <div className="form-group">
          <label>Last name</label>
          <input readOnly className={styles.mainInput} value={profile.lastName} placeholder="Last name" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Email address</label>
          <input readOnly className={styles.mainInput} value={email} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label>Contact phone</label>
          <input readOnly className={styles.mainInput} value={profile.contactPhone} placeholder="+380 00 000 00 00" />
        </div>
      </div>
      <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="form-group">
          <label>Consultation city/address</label>
          <input readOnly className={styles.mainInput} value={profile.address} placeholder="Enter city and consultation address" />
        </div>
      </div>
      
      <section className={`${styles.readOnlySection} ${styles.aboutSection}`}>
        <h3 className={styles.sectionTitle}>About</h3>
        <p>{profile.description}</p>
      </section>
      
      <section className={`${styles.readOnlySection} ${styles.professionalSection}`}>
        <h3 className={styles.sectionTitle}>Professional information</h3>
        <div className={styles.readOnlyGrid}>
          <div className={styles.readOnlyRow}>
            <strong>Languages</strong>
            <div className={styles.tagsWrapper}>
              <div className={styles.tagsContainer}>
                {profile.languages.map(lang => <span key={lang} className={styles.tag}>{lang}</span>)}
              </div>
              <button className={styles.actionBtnOutline} onClick={onEdit}>Edit</button>
            </div>
          </div>
          <div className={styles.readOnlyRow}>
            <strong>Specialty</strong>
            <div className={styles.readOnlyValueBox}>{profile.speciality}</div>
          </div>
          <div className={styles.readOnlyRow}>
            <strong>Professional role</strong>
            <div className={styles.readOnlyValueBox}>{profile.professionalRole}</div>
          </div>
          <div className={styles.readOnlyRow}>
            <strong>Years of experience</strong>
            <div className={styles.readOnlyValueBox}>{profile.yearsOfExperience} years</div>
          </div>
          <div className={styles.readOnlyRow}>
            <strong>Contact phone</strong>
            <div className={styles.readOnlyValueBox}>{profile.contactPhone}</div>
          </div>
          <div className={styles.readOnlyRow}>
            <strong>Consultation location</strong>
            <div className={styles.readOnlyValueBox}>{profile.address}</div>
          </div>
        </div>
      </section>
      
      <section className={styles.readOnlySection}>
        <div className={styles.headerFlex}>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Services and prices</h3>
          <button className={styles.actionBtnOutline} onClick={() => onSwitchTab("services")}>Manage services</button>
        </div>
        <div className={styles.servicesTable}>
          <div className={styles.servicesHeader}>
            <span className={styles.selectLarge}>Service</span>
            <span className={styles.selectSmall}>Duration</span>
            <span className={styles.selectSmall}>Price</span>
          </div>
          <div className={styles.servicesBody}>
            {services.length === 0 && <p className={styles.sectionSubtitle}>No services added yet.</p>}
            {services.map((service) => (
              <div key={service.id} className={styles.serviceDisplayRow}>
                <div className={`${styles.serviceSelectBox} ${styles.selectLarge}`}>{service.name}</div>
                <div className={`${styles.serviceSelectBox} ${styles.selectSmall}`}>{service.durationMinutes} min</div>
                <div className={`${styles.serviceSelectBox} ${styles.selectSmall}`}>{Number(service.price)}$</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.readOnlySection}>
        <div className={styles.headerFlex}>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Availability</h3>
          <button className={styles.actionBtnOutline} onClick={() => onSwitchTab("availability")}>Manage Time</button>
        </div>
        <div className={styles.availabilityDisplay}>
          <img src={calendar} alt="" />
          {availabilitySummary.length > 0 ? (
            <span className={styles.availabilityLines}>
              {availabilitySummary.map((line) => <span key={line}>{line}</span>)}
            </span>
          ) : (
            <span>Not set</span>
          )}
        </div>
      </section>
    </div>
  );
};