import { useRef, useState, type FormEvent } from "react";
import doctorDefaultImage from "../../../../assets/img/doctorImage.svg";
import { MultiSelectDropdown } from "../../../../components/MultiSelectDropdown/MultiSelectDropdown";
import { PROVIDER_LANGUAGES, PROVIDER_SPECIALTIES } from "../../../../constants/providerOptions";
import caution from '../../../../assets/img/warning!-icon.svg';
import camera from '../../../../assets/img/photo.svg';
import clock from '../../../../assets/img/clock-icon.svg';
import trash from '../../../../assets/img/trash-icon.svg';
import success from '../../../../assets/img/success-icon.svg';
import styles from './ProfessionalProfileTab.module.scss';

interface ProviderProfile {
  firstName: string; lastName: string; professionalRole: string; yearsOfExperience: string;
  contactPhone: string; address: string; speciality: string; languages: string[];
  description: string; photoUrl: string | null; published: boolean;
}

interface Props {
  profile: ProviderProfile; isEditing: boolean; isLoading: boolean; isSaving: boolean;
  canPublish: boolean; serverError: string; email: string;
  onUpdate: <K extends keyof ProviderProfile>(key: K, value: ProviderProfile[K]) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
  onSwitchTab: (tab: "profile" | "services" | "availability" | "appointments") => void;
}

interface ServiceItem { id: number; name: string; duration: string; price: string; }
interface TimeInterval { id: number; start: string; end: string; }

export const ProfessionalProfileTab = ({
  profile, isEditing, isLoading, isSaving, canPublish, serverError, email, onUpdate, onSave, onEdit, onSwitchTab
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [languagesError, setLanguagesError] = useState("");

  const [services, setServices] = useState<ServiceItem[]>([
    { id: 1, name: "Pregnancy consultation", duration: "45 min", price: "40$" },
    { id: 2, name: "2nd Trimester Anatomy Scan", duration: "45 min", price: "40$" }
  ]);

  const addService = () => setServices([...services, { id: Date.now(), name: "New Consultation", duration: "30 min", price: "20$" }]);
  const removeService = (id: number) => setServices(services.filter(s => s.id !== id));

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [activeDays, setActiveDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [intervals, setIntervals] = useState<TimeInterval[]>([{ id: 1, start: "09:00", end: "17:00" }]);

  const toggleDay = (day: string) => {
    setActiveDays(activeDays.includes(day) ? activeDays.filter(d => d !== day) : [...activeDays, day]);
  };
  const addInterval = () => setIntervals([...intervals, { id: Date.now(), start: "10:00", end: "18:00" }]);
  const removeInterval = (id: number) => setIntervals(intervals.filter(i => i.id !== id));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (profile.languages.length === 0) {
      event.preventDefault();
      setLanguagesError("Select at least one language.");
      return;
    }
    setLanguagesError("");
    onSave(event);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      window.alert("Please choose an image smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onUpdate("photoUrl", reader.result);
    };
    reader.readAsDataURL(file);
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

        {serverError && <div className="alert alert--warning">{serverError}</div>}

        <form onSubmit={handleSubmit}>
          {profile.published && (
            <>
              <div className="form-row">
                <div className="form-group"><label>First name</label><input required className={styles.mainInput} value={profile.firstName} onChange={(e) => onUpdate("firstName", e.target.value)} /></div>
                <div className="form-group"><label>Last name</label><input required className={styles.mainInput} value={profile.lastName} onChange={(e) => onUpdate("lastName", e.target.value)} /></div>
              </div>
              <div className="form-row">
                {/* ТУТ ДОДАНО ДОКТОР ЗА ЗАМОВЧУВАННЯМ */}
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
              {/* Цей селект має стрілочку через клас styles.mainSelect */}
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
                <button type="button" onClick={removePhoto} className={styles.removeBtn}>✕</button>
              </div>
            ) : (
              <div className={styles.photoPreview}>
                <img src={doctorDefaultImage} alt="Provider" className={styles.placeholderImage} />
              </div>
            )}
            
            <div onClick={() => fileInputRef.current?.click()} className={styles.photoUpload}>
              <div className={styles.uploadTitle}>
                <img src={camera} alt="camera" />
                <span>Change photo</span>
              </div>
              <span className={styles.uploadSubtitle}>JPG or PNG, max 5MB</span>
            </div>
            <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
          </div>

          <hr className={styles.divider} />

          <div className={styles.sectionContainer}>
            <div className={styles.headerFlex} style={{ marginBottom: '0' }}>
              <h3 className={styles.sectionTitle}>Services and prices</h3>
            </div>
            <p className={styles.sectionSubtitle}>
              Add the services you offer and set your prices. These will be visible to patients on your profile.
            </p>

            {services.map((service) => (
              <div key={service.id} className={styles.serviceRow}>
                <select className={`${styles.mainSelect} ${styles.selectLarge}`} defaultValue={service.name}>
                  <option>{service.name}</option>
                  <option>General checkup</option>
                  <option>Follow-up</option>
                </select>
                <select className={`${styles.mainSelect} ${styles.selectSmall}`} defaultValue={service.duration}>
                  <option>{service.duration}</option>
                  <option>30 min</option>
                  <option>60 min</option>
                </select>
                <select className={`${styles.mainSelect} ${styles.selectSmall}`} defaultValue={service.price}>
                  <option>{service.price}</option>
                  <option>50$</option>
                  <option>80$</option>
                </select>
                <button type="button" onClick={() => removeService(service.id)} className={styles.iconBtn}>
                  <img src={trash} alt="trash" />
                </button>
              </div>
            ))}

            <button type="button" onClick={addService} className={styles.actionBtn}>
              Add services
            </button>
          </div>

          <div className={styles.sectionContainer}>
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
              {allDays.map((day) => (
                <button key={day} type="button" onClick={() => toggleDay(day)} className={`${styles.dayBtn} ${activeDays.includes(day) ? styles.active : ''}`}>
                  {day}
                </button>
              ))}
            </div>

            {intervals.map((interval) => (
              <div key={interval.id} className={styles.intervalRow}>
                <div className={styles.workingHoursLabel}>
                  <img src={clock} alt="clock" />
                  Working hours
                </div>
                <div className={styles.timeInputs}>
                  <input type="time" defaultValue={interval.start} className={styles.timeInput} />
                  <span>to</span>
                  <input type="time" defaultValue={interval.end} className={styles.timeInput} />
                </div>
                {intervals.length > 1 && (
                  <button type="button" onClick={() => removeInterval(interval.id)} className={styles.iconBtn} style={{ marginLeft: '0.5rem' }}>
                    <img src={trash} alt="trash" />
                  </button>
                )}
              </div>
            ))}

            <div className={styles.intervalFooter}>
              <button type="button" onClick={addInterval} className={styles.actionBtn}>
                Add time interval
              </button>
            </div>
          </div>

          {!canPublish && <p className="field-error" style={{ textAlign: 'right' }}>Complete all required profile fields to enable publishing.</p>}
          
          <div className={styles.formFooter}>
            <button type="submit" className="btn-primary" disabled={!canPublish}>
              {isSaving ? "Saving..." : "Save and continue"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.tabContainerTransparent}>
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
      
      <section className={styles.readOnlySection}>
        <h3 className={styles.sectionTitle}>About</h3>
        <p>{profile.description}</p>
      </section>
      
      <section className={styles.readOnlySection}>
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
                <div className={`${styles.serviceSelectBox} ${styles.selectSmall}`}>{service.duration}</div>
                <div className={`${styles.serviceSelectBox} ${styles.selectSmall}`}>{service.price}</div>
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
          {activeDays.length > 0 ? (
            <span>
              {activeDays[0]} - {activeDays[activeDays.length - 1]}, {intervals.length > 0 ? `${intervals[0].start} - ${intervals[0].end}` : 'Time not set'}
            </span>
          ) : (
            <span>Not set</span>
          )}
        </div>
      </section>
    </div>
  );
};