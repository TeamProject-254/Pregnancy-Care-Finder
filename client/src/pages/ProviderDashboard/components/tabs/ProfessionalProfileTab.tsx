import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ProviderAvailability } from "../../../../api/availabilities";
import type { MedicalService } from "../../../../api/medicalServices";
import doctorDefaultImage from "../../../../assets/img/doctorImage.svg";
import { MultiSelectDropdown } from "../../../../components/MultiSelectDropdown/MultiSelectDropdown";
import { PROVIDER_LANGUAGES, PROVIDER_SPECIALTIES } from "../../../../constants/providerOptions";
import caution from '../../../../assets/img/warning!-icon.svg';
import camera from '../../../../assets/img/photo.svg';
import clock from '../../../../assets/img/clock-icon.svg';
import success from '../../../../assets/img/success-icon.svg';
import successSidebar from '../../../../assets/img/success-sidebar-icon.svg';
import circleBroken from '../../../../assets/circle-broken-icon.svg';
import styles from './ProfessionalProfileTab.module.scss';

const CLOUDINARY_CLOUD_NAME = "gjckdqml";
const CLOUDINARY_UPLOAD_PRESET = "BloomCare";

interface ProviderProfile {
  firstName: string; lastName: string; professionalRole: string; yearsOfExperience: string;
  contactPhone: string; address: string; speciality: string; languages: string[];
  description: string; photoUrl: string | null; published: boolean;
}

interface Props {
  profile: ProviderProfile; isEditing: boolean; isLoading: boolean; isSaving: boolean;
  canPublish: boolean; completionPercentage: number; serverError: string; email: string;
  availabilities: ProviderAvailability[];
  services: MedicalService[];
  onUpdate: <K extends keyof ProviderProfile>(key: K, value: ProviderProfile[K]) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
  onSwitchTab: (tab: "profile" | "services" | "availability" | "appointments") => void;
}

export const ProfessionalProfileTab = ({
  profile, isEditing, isLoading, isSaving, canPublish, completionPercentage, serverError, email, availabilities,
  services, onUpdate, onSave, onEdit, onSwitchTab
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [languagesError, setLanguagesError] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches,
  );
  const [basicDetailsOpen, setBasicDetailsOpen] = useState(false);
  const [servicesDetailsOpen, setServicesDetailsOpen] = useState(false);
  const [availabilityDetailsOpen, setAvailabilityDetailsOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const availableSlots = availabilities
    .filter((slot) => slot.status === "FREE")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const formatAvailabilityDate = (date: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T00:00:00`));

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
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      window.alert("Please choose an image smaller than 5 MB.");
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
      
      if (data.secure_url) {
        onUpdate("photoUrl", data.secure_url);
      } else {
        window.alert("Failed to upload image.");
      }
    } catch {
      window.alert("Error uploading image. Please check your connection.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = () => {
    onUpdate("photoUrl", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) return <div className={styles.tabContainer}>Loading...</div>;

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
                <span className={styles.summaryChevron} aria-hidden="true">›</span>
              </summary>
            )}
            <div className={styles.basicFields}>
          {profile.published && (
            <>
              <div className="form-row">
                <div className="form-group"><label>First name</label><input required className={styles.mainInput} value={profile.firstName} onChange={(e) => onUpdate("firstName", e.target.value)} /></div>
                <div className="form-group"><label>Last name</label><input required className={styles.mainInput} value={profile.lastName} onChange={(e) => onUpdate("lastName", e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Professional role</label><input required className={styles.mainInput} value={profile.professionalRole || "Doctor"} onChange={(e) => onUpdate("professionalRole", e.target.value)} /></div>
                <div className="form-group"><label>Years of experience</label><input required className={styles.mainInput} type="number" min="0" value={profile.yearsOfExperience} onChange={(e) => onUpdate("yearsOfExperience", e.target.value)} /></div>
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
              <select required className={styles.mainSelect} value={profile.speciality} onChange={(e) => onUpdate("speciality", e.target.value)}>
                <option value="">Select speciality</option>
                {PROVIDER_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
                <span className={styles.summaryChevron} aria-hidden="true">›</span>
              </summary>
            )}
            <div className={styles.mobileSectionContent}>
            <div className={styles.headerFlex} style={{ marginBottom: '0' }}>
              <h3 className={styles.sectionTitle}>Services and prices</h3>
              <button type="button" onClick={() => onSwitchTab("services")} className={styles.actionBtnOutline}>
                Manage services
              </button>
            </div>
            <p className={styles.sectionSubtitle}>
              These saved services and prices are visible to patients on your profile.
            </p>

            {services.length ? services.map((service) => (
              <div key={service.id} className={styles.serviceRow}>
                <span className={`${styles.mainSelect} ${styles.selectLarge}`}>{service.name}</span>
                <span className={`${styles.mainSelect} ${styles.selectSmall}`}>{service.durationMinutes} min</span>
                <span className={`${styles.mainSelect} ${styles.selectSmall}`}>{Number(service.price)}$</span>
              </div>
            )) : <p className={styles.sectionSubtitle}>No services added yet.</p>}
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
                  src={availableSlots.length > 0 ? successSidebar : circleBroken}
                  alt=""
                  aria-hidden="true"
                />
                <span className={styles.summaryText}>
                  <strong>Availability</strong>
                  <small>Set your working hours</small>
                </span>
                <span className={styles.summaryChevron} aria-hidden="true">›</span>
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
              Add specific dates and time windows for patients to book.
            </p>

            <div className={styles.availabilityDisplay}>
              <img src={clock} alt="clock" />
              <span>
                {availableSlots.length > 0
                  ? `${availableSlots.length} available slot${availableSlots.length === 1 ? "" : "s"} saved`
                  : "No availability slots added yet."}
              </span>
            </div>
            </div>
          </details>

          {!canPublish && <p className="field-error" style={{ textAlign: 'right' }}>Complete all required profile fields to enable publishing.</p>}
          
          <div className={styles.formFooter}>
            <button type="submit" className="btn-primary" disabled={!canPublish || isUploadingPhoto || isSaving}>
              {isSaving ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.tabContainerTransparent}>
      <div className={styles.mobileProfileSummary}>
        <img src={profile.photoUrl || doctorDefaultImage} alt="" />
        <strong>Dr. {profile.firstName} {profile.lastName}</strong>
        <span>{profile.speciality}</span>
        <small><img src={success} alt="" /> Profile published</small>
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
            <div className={styles.readOnlyValueBox}>{profile.professionalRole || "Doctor"}</div>
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
          <img src={clock} alt="clock" />
          {availableSlots.length > 0 ? (
            <span>
              {availableSlots.slice(0, 3).map((slot) =>
                `${formatAvailabilityDate(slot.date)} ${slot.startTime.slice(0, 5)}–${slot.endTime.slice(0, 5)}`
              ).join(" · ")}
              {availableSlots.length > 3 ? ` · +${availableSlots.length - 3} more` : ""}
            </span>
          ) : (
            <span>Not set</span>
          )}
        </div>
      </section>
    </div>
  );
};