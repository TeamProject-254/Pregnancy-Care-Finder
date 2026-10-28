import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  getProviderAvailabilities,
  type ProviderAvailability,
} from "../../api/availabilities";
import {
  getMyMedicalServices,
  type MedicalService,
} from "../../api/medicalServices";
import {
  createMyProviderProfile,
  getMyProviderProfile,
  updateMyProviderProfile,
  type ProviderProfileDto,
  type ProviderProfilePayload,
} from "../../api/providers";
import { useAuth } from "../../context/AuthContext";
import { usePendingAppointments } from "../../hooks/usePendingAppointments";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { ProfessionalProfileTab } from "./components/tabs/ProfessionalProfileTab";
import { AppointmentsTab } from "./components/tabs/AppointmentsTab";
import { AvailabilityTab } from "./components/tabs/AvailabilityTab";
import { ServicesTab } from "./components/tabs/ServicesTab";
import { PROVIDER_LANGUAGES, PROVIDER_SPECIALTIES } from "../../constants/providerOptions";
import {
  validateAddress,
  validatePersonName,
  validatePhone,
  validateYearsOfExperience,
} from "../../utils/validation";
import styles from "./ProviderDashboard.module.scss";

export type DashboardTab = "profile" | "services" | "availability" | "appointments";

const DASHBOARD_TABS: DashboardTab[] = ["profile", "services", "availability", "appointments"];

const isDashboardTab = (value: string | null): value is DashboardTab =>
  DASHBOARD_TABS.some((tab) => tab === value);

export interface ProviderProfile {
  firstName: string; lastName: string; professionalRole: string; yearsOfExperience: string;
  contactPhone: string; address: string; speciality: string; languages: string[];
  description: string; photoUrl: string | null; published: boolean;
}

const emptyProfile: ProviderProfile = {
  firstName: "", lastName: "", professionalRole: "", yearsOfExperience: "",
  contactPhone: "", address: "", speciality: "", languages: [],
  description: "", photoUrl: null, published: false,
};

const textFields = [
  "firstName", "lastName", "professionalRole", "yearsOfExperience",
  "contactPhone", "address", "speciality", "description",
] as const;

const basicFields = [
  "firstName", "lastName", "professionalRole", "yearsOfExperience", "contactPhone", "address",
] as const;

const profileDraftKey = (userId: number) => `provider-profile:${userId}:draft`;
const supportedLanguages = (languages: string[]) =>
  languages.filter((language) => PROVIDER_LANGUAGES.some((supported) => supported === language));

const isSupportedSpeciality = (speciality: string) =>
  PROVIDER_SPECIALTIES.some((supported) => supported === speciality);

const readProfileDraft = (userId: number): Partial<ProviderProfile> | null => {
  try {
    const savedDraft = localStorage.getItem(profileDraftKey(userId));
    return savedDraft ? JSON.parse(savedDraft) as Partial<ProviderProfile> : null;
  } catch {
    removeProfileDraft(userId);
    return null;
  }
};

const removeProfileDraft = (userId: number) => {
  try { localStorage.removeItem(profileDraftKey(userId)); }
  catch { return; }
};

const toProfile = (data: ProviderProfileDto): ProviderProfile => ({
  firstName: data.firstName ?? "",
  lastName: data.lastName ?? "",
  professionalRole: data.professionalRole ?? "",
  yearsOfExperience: data.yearsOfExperience === null || data.yearsOfExperience === undefined
    ? ""
    : String(data.yearsOfExperience),
  contactPhone: data.contactPhone ?? "",
  address: data.address ?? "",
  speciality: data.specialization ?? "",
  languages: supportedLanguages(Array.isArray(data.languages) ? data.languages : []),
  description: data.description ?? "",
  photoUrl: data.photoUrl || null,
  published: Boolean(data.published),
});

const mergeDraft = (saved: ProviderProfile, draft: Partial<ProviderProfile> | null): ProviderProfile => {
  if (!draft) return saved;
  const merged: ProviderProfile = { ...saved };
  textFields.forEach((field) => {
    const draftValue = draft[field];
    if (saved[field].trim() === "" && typeof draftValue === "string") merged[field] = draftValue;
  });
  if (!isSupportedSpeciality(merged.speciality)) merged.speciality = saved.speciality;
  if (saved.languages.length === 0 && Array.isArray(draft.languages)) {
    merged.languages = supportedLanguages(draft.languages);
  }
  if (!saved.photoUrl && typeof draft.photoUrl === "string" && draft.photoUrl) merged.photoUrl = draft.photoUrl;
  return merged;
};

const toPayload = (profile: ProviderProfile): ProviderProfilePayload => ({
  firstName: profile.firstName.trim(),
  lastName: profile.lastName.trim(),
  professionalRole: profile.professionalRole.trim(),
  yearsOfExperience: Number(profile.yearsOfExperience),
  contactPhone: profile.contactPhone.trim(),
  address: profile.address.trim(),
  specialization: profile.speciality,
  description: profile.description.trim(),
  languages: profile.languages,
  photoUrl: profile.photoUrl ?? "",
});

const profileErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "Your session has expired. Please sign in again.";
    }
    const responseData = error.response?.data as {
      message?: string; error?: string; validationErrors?: Record<string, string>;
    } | undefined;
    const validationMessage = responseData?.validationErrors ? Object.values(responseData.validationErrors).join(" ") : "";
    return validationMessage || responseData?.message || responseData?.error || "Unable to connect to the server.";
  }
  return "An unexpected error occurred.";
};

const profileIssues = (profile: ProviderProfile): string[] => [
  validatePersonName("first name")(profile.firstName),
  validatePersonName("last name")(profile.lastName),
  profile.professionalRole.trim() ? true : "Enter your professional role, for example Doctor or Midwife.",
  validateYearsOfExperience(profile.yearsOfExperience),
  validatePhone(profile.contactPhone),
  validateAddress(profile.address),
  isSupportedSpeciality(profile.speciality) ? true : "Choose your speciality from the list.",
  profile.languages.length > 0 ? true : "Select at least one language you speak.",
  profile.description.trim() ? true : "Add a professional description so patients know about your experience.",
].filter((issue): issue is string => issue !== true);

const hasBasicInformation = (profile: ProviderProfile | null) =>
  profile !== null && basicFields.every((field) => profile[field].trim() !== "");

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const pendingCount = usePendingAppointments();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: DashboardTab = isDashboardTab(requestedTab) ? requestedTab : "profile";
  const setActiveTab = (tab: DashboardTab) => setSearchParams({ tab });
  const [profile, setProfile] = useState<ProviderProfile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<ProviderProfile | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(() => Boolean(user?.userId));
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [profileLoadError, setProfileLoadError] = useState("");
  const [profileReloadToken, setProfileReloadToken] = useState(0);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [availabilities, setAvailabilities] = useState<ProviderAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityReloadToken, setAvailabilityReloadToken] = useState(0);
  const [canManageAvailability, setCanManageAvailability] = useState(false);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [servicesReloadToken, setServicesReloadToken] = useState(0);

  useEffect(() => {
    if (!user?.userId) return;
    let isCurrent = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setProfileLoadError("");
      try {
        const data = await getMyProviderProfile();
        if (!isCurrent) return;
        const saved = toProfile(data);
        setSavedProfile(saved);
        setProfile(saved.published ? saved : mergeDraft(saved, readProfileDraft(user.userId)));
        setIsEditing(!saved.published);
        setProfileLoaded(true);
      } catch (error) {
        if (!isCurrent) return;
        if (isAxiosError(error) && error.response?.status === 404) {
          const draft = readProfileDraft(user.userId);
          setSavedProfile(null);
          setProfile({
            ...emptyProfile, ...draft,
            speciality: draft?.speciality && isSupportedSpeciality(draft.speciality) ? draft.speciality : "",
            languages: supportedLanguages(draft?.languages || []),
            published: false,
          });
          setIsEditing(true);
          setProfileLoaded(true);
        } else {
          setProfileLoadError(profileErrorMessage(error));
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadProfile();
    return () => { isCurrent = false; };
  }, [user?.userId, profileReloadToken]);

  useEffect(() => {
    if (!user?.userId) return;
    let isCurrent = true;

    const loadAvailabilities = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      try {
        const result = await getProviderAvailabilities();
        if (isCurrent) {
          setAvailabilities(result.availabilities);
          setCanManageAvailability(result.canManage);
        }
      } catch (error) {
        if (isCurrent) {
          setAvailabilityError(profileErrorMessage(error));
        }
      } finally {
        if (isCurrent) setAvailabilityLoading(false);
      }
    };

    void loadAvailabilities();
    return () => { isCurrent = false; };
  }, [user?.userId, availabilityReloadToken]);

  useEffect(() => {
    if (!user?.userId) return;
    let isCurrent = true;

    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError("");
      try {
        const result = await getMyMedicalServices();
        if (isCurrent) setServices(result);
      } catch (error) {
        if (isCurrent) setServicesError(profileErrorMessage(error));
      } finally {
        if (isCurrent) setServicesLoading(false);
      }
    };

    void loadServices();
    return () => { isCurrent = false; };
  }, [user?.userId, servicesReloadToken]);

  useEffect(() => {
    if (!profileLoaded || !user?.userId || savedProfile?.published) return;
    try { localStorage.setItem(profileDraftKey(user.userId), JSON.stringify(profile)); }
    catch { return; }
  }, [profile, profileLoaded, savedProfile?.published, user?.userId]);

  const completionPercentage = useMemo(() => {
    return 25 + (profile.languages.length > 0 ? 25 : 0) + (profile.description.trim() !== "" ? 25 : 0) + (profile.photoUrl ? 25 : 0);
  }, [profile]);

  const updateProfile = <K extends keyof ProviderProfile>(key: K, value: ProviderProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (profileIssues(profile).length > 0) return;
    setIsSaving(true);
    setServerError("");

    try {
      const payload = toPayload(profile);

      if (!savedProfile) {
        try {
          await createMyProviderProfile(payload);
        } catch (createError) {
          if (!isAxiosError(createError) || createError.response?.status !== 409) throw createError;
        }
      }

      const data = await updateMyProviderProfile({ ...payload, published: true });
      const saved = toProfile(data);
      setSavedProfile(saved);
      setProfile(saved);
      setIsEditing(false);
      if (user?.userId) removeProfileDraft(user.userId);
    } catch (error) {
      setServerError(profileErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const displayProfile = savedProfile ?? profile;
  const isPublished = Boolean(savedProfile?.published);

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfessionalProfileTab
            profile={profile} isEditing={isEditing} isLoading={isLoading} isSaving={isSaving}
            loadError={profileLoadError}
            onRetryLoad={() => setProfileReloadToken((token) => token + 1)}
            showBasicFields={profile.published || !hasBasicInformation(savedProfile)}
            publishIssues={profileIssues(profile)}
            completionPercentage={completionPercentage}
            serverError={serverError} email={user?.email || ""}
            availabilities={availabilities}
            services={services}
            serviceStorageKey={String(user?.userId ?? "provider")}
            onServicesChange={setServices}
            onUpdate={updateProfile} onSave={handleSave} onEdit={() => setIsEditing(true)}
            onSwitchTab={setActiveTab}
          />
        );
      case "services":
        return (
          <ServicesTab
            services={services}
            isLoading={servicesLoading}
            loadError={servicesError}
            storageKey={String(user?.userId ?? "provider")}
            onServicesChange={setServices}
            onRetry={() => setServicesReloadToken((token) => token + 1)}
          />
        );
      case "availability":
        return (
          <AvailabilityTab
            key={availabilityLoading ? "loading" : "ready"}
            availabilities={availabilities}
            isLoading={availabilityLoading}
            loadError={availabilityError}
            canManage={canManageAvailability}
            scheduleStorageKey={String(user?.userId ?? "provider")}
            onAvailabilityChange={setAvailabilities}
            onRetry={() => setAvailabilityReloadToken((token) => token + 1)}
          />
        );
      case "appointments": return <AppointmentsTab />;
      default: return null;
    }
  };

  return (
    <main className={styles.dashboard__wrapper}>
      <div className="dashboard__header">
        <h1>Welcome back, {displayProfile.firstName || "Provider"}!</h1>
        <p>Manage your profile and appointments</p>
      </div>

      <div className="dashboard__content">
        <DashboardSidebar
          activeTab={activeTab} setActiveTab={setActiveTab} isPublished={isPublished}
          photoPreview={profile.photoUrl} completionPercentage={completionPercentage}
          firstName={displayProfile.firstName} lastName={displayProfile.lastName}
          pendingCount={pendingCount}
        />
        <div className={`dashboard__main-panel ${!(isEditing && activeTab === 'profile') ? 'dashboard__main-panel--transparent' : ''}`}>
          {renderTabContent()}
        </div>
      </div>
    </main>
  );
};
