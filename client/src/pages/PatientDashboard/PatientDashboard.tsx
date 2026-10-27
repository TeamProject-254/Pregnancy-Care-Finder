import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../../api/axios";
import { PatientEditForm } from "./components/PatientEditForm";
import defaultAvatar from "../../assets/img/profile-icon.svg";
import locationIcon from "../../assets/img/location-icon.svg";
import languagesIcon from "../../assets/img/languages-icon.svg";
import styles from "./PatientDashboard.module.scss";

export interface PatientResponse {
  id: number;
  firstName: string;
  lastName: string;
  location: string;
  languages: string[];
  pregnancyWeek: number;
  explicitConsent: boolean;
  photoUrl?: string | null;
}

export const PatientDashboard = () => {
  const [profile, setProfile] = useState<PatientResponse | null>(null);
  const [pregnancyWeek, setPregnancyWeek] = useState<number | string>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await api.get<PatientResponse>("/patients/profile");
      setProfile(response.data);
      setPregnancyWeek(response.data.pregnancyWeek || 1);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          // Профіль дійсно ще не створений на бекенді
          setProfile(null);
        } else if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          // 401/403 підхопить інтерцептор в api/axios і зробить редірект
          return;
        } else {
          setErrorMessage(
            "Failed to load profile details. Server might be waking up.",
          );
        }
      } else {
        setErrorMessage("An unexpected error occurred while loading profile.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setPregnancyWeek("");
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      setPregnancyWeek(num);
    }
  };

  const displayName = profile?.firstName || "there";

  return (
    <div className={styles.main__content}>
      <main className={styles.content__wrapper}>
        <div className={styles.title__block}>
          <h2 className={styles.title}>Welcome back, {displayName}!</h2>
          <h5 className={styles.title__desc}>
            Manage your profile and appointments
          </h5>
        </div>

        {errorMessage && (
          <div className={styles.error__banner}>
            <span>{errorMessage}</span>
            <button
              type="button"
              className={styles.retry__button}
              onClick={() => void fetchProfile()}
            >
              Retry
            </button>
          </div>
        )}

        <div className={styles.dashboard__body}>
          <aside className={styles.profile__card}>
            {isLoading ? (
              <div className={styles.loading__state}>Loading profile...</div>
            ) : errorMessage ? (
              <div className={styles.empty__state}>
                <p>Could not load profile data.</p>
                <button
                  type="button"
                  className={styles.edit__button}
                  onClick={() => void fetchProfile()}
                >
                  Try again
                </button>
              </div>
            ) : profile ? (
              <>
                <div className={styles.avatar__wrapper}>
                  <img
                    src={profile.photoUrl || defaultAvatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className={styles.avatar}
                  />
                </div>

                <div className={styles.user__info}>
                  <h3 className={styles.user__name}>
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <span className={styles.user__role}>Patient account</span>
                </div>

                <div className={styles.meta__list}>
                  <div className={styles.meta__item}>
                    <img
                      src={locationIcon}
                      alt=""
                      className={styles.meta__icon}
                    />
                    <div className={styles.meta__texts}>
                      <span className={styles.meta__label}>Location</span>
                      <span className={styles.meta__value}>
                        {profile.location}
                      </span>
                    </div>
                  </div>

                  <div className={styles.meta__item}>
                    <img
                      src={languagesIcon}
                      alt=""
                      className={styles.meta__icon}
                    />
                    <div className={styles.meta__texts}>
                      <span className={styles.meta__label}>
                        Preferred languages
                      </span>
                      <span className={styles.meta__value}>
                        {profile.languages?.length > 0
                          ? profile.languages.join(", ")
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.pregnancy__block}>
                  <span className={styles.pregnancy__label}>
                    Pregnancy week
                  </span>

                  <div className={styles.pregnancy__control_wrapper}>
                    <div className={styles.pregnancy__badge}>
                      Week {pregnancyWeek || profile.pregnancyWeek || "—"}
                    </div>

                    {isEditing && (
                      <input
                        type="number"
                        min={1}
                        max={42}
                        className={styles.pregnancy__input}
                        value={pregnancyWeek}
                        onChange={handleWeekChange}
                        placeholder="Week"
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.edit__button}
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {!isEditing ? "Edit profile" : "Close editing without saving"}
                </button>
              </>
            ) : (
              <div className={styles.empty__state}>
                <p>Profile is not set up yet.</p>
                <button
                  type="button"
                  className={styles.edit__button}
                  onClick={() => setIsEditing(true)}
                >
                  Create profile
                </button>
              </div>
            )}
          </aside>

          <section className={styles.appointments__placeholder}>
            {isEditing && (
              <PatientEditForm
                initialData={profile}
                pregnancyWeek={Number(pregnancyWeek) || 1}
                onSuccess={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setPregnancyWeek(updatedProfile.pregnancyWeek);
                  setIsEditing(false);
                }}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
