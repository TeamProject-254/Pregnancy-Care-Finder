import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { ProfessionalProfileTab } from "./components/tabs/ProfessionalProfileTab";
import { PROVIDER_LANGUAGES } from "../../constants/providerOptions";
import styles from "./ProviderDashboard.module.scss";

export type DashboardTab = "profile" | "services" | "availability" | "appointments";

interface ProviderProfile {
  firstName: string; lastName: string; professionalRole: string; yearsOfExperience: string;
  contactPhone: string; address: string; speciality: string; languages: string[];
  description: string; photoUrl: string | null; published: boolean;
}

const emptyProfile: ProviderProfile = {
  firstName: "", lastName: "", professionalRole: "", yearsOfExperience: "",
  contactPhone: "", address: "", speciality: "", languages: [],
  description: "", photoUrl: null, published: false,
};

const profileDraftKey = (userId: number) => `provider-profile:${userId}:draft`;
const supportedLanguages = (languages: string[]) =>
  languages.filter((language) => PROVIDER_LANGUAGES.some((supported) => supported === language));

const readProfileDraft = (userId: number): Partial<ProviderProfile> | null => {
  const savedDraft = localStorage.getItem(profileDraftKey(userId));
  if (!savedDraft) return null;
  try { return JSON.parse(savedDraft) as Partial<ProviderProfile>; }
  catch { localStorage.removeItem(profileDraftKey(userId)); return null; }
};

const profileErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as {
      message?: string; error?: string; validationErrors?: Record<string, string>;
    } | undefined;
    const validationMessage = responseData?.validationErrors ? Object.values(responseData.validationErrors).join(" ") : "";
    return responseData?.message || responseData?.error || validationMessage || "Unable to connect to the server.";
  }
  return "An unexpected error occurred.";
}

const canPublishProfile = (profile: ProviderProfile) =>
  profile.firstName.trim() !== "" && profile.lastName.trim() !== "" &&
  profile.professionalRole.trim() !== "" && profile.yearsOfExperience.trim() !== "" &&
  profile.contactPhone.trim() !== "" && profile.address.trim() !== "" &&
  profile.speciality.trim() !== "" && profile.description.trim() !== "" &&
  profile.languages.length > 0;

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("profile");
  const [profile, setProfile] = useState<ProviderProfile>(emptyProfile);
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(() => Boolean(user?.userId));
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasServerProfile, setHasServerProfile] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    let isCurrent = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/providers/profile");
        const data = response.data;
        if (!isCurrent) return;

        setHasServerProfile(true);
        const draft = readProfileDraft(user.userId);
        const serverLanguages = Array.isArray(data.languages) ? supportedLanguages(data.languages) : [];

        setProfile({
          ...emptyProfile, ...draft,
          firstName: data.firstName || draft?.firstName || "",
          lastName: data.lastName || draft?.lastName || "",
          professionalRole: data.professionalRole || draft?.professionalRole || "",
          yearsOfExperience: data.yearsOfExperience?.toString() || draft?.yearsOfExperience || "",
          contactPhone: data.contactPhone || draft?.contactPhone || "",
          address: data.address || draft?.address || "",
          speciality: data.specialization || draft?.speciality || "",
          languages: serverLanguages.length > 0 ? serverLanguages : supportedLanguages(draft?.languages || []),
          description: data.description || draft?.description || "",
          photoUrl: data.photoUrl || draft?.photoUrl || null,
          published: data.firstName && data.description ? true : draft?.published || false,
        });

        setIsEditing(!(data.firstName && data.description));
        setProfileLoaded(true);
      } catch {
        if (!isCurrent) return;
        setHasServerProfile(false);
        const draft = readProfileDraft(user.userId);
        if (draft) {
          setProfile({
            ...emptyProfile, ...draft,
            languages: supportedLanguages(draft.languages || []),
          });
        }
        setProfileLoaded(true);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadProfile();
    return () => { isCurrent = false; };
  }, [user?.userId]);

  useEffect(() => {
    if (!profileLoaded || !user?.userId) return;
    try { localStorage.setItem(profileDraftKey(user.userId), JSON.stringify(profile)); }
    catch { /* empty */ }
  }, [profile, profileLoaded, user?.userId]);

  const completionPercentage = useMemo(() => {
    return 25 + (profile.languages.length > 0 ? 25 : 0) + (profile.description.trim() !== "" ? 25 : 0) + (profile.photoUrl ? 25 : 0);
  }, [profile]);

  const updateProfile = <K extends keyof ProviderProfile>(key: K, value: ProviderProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setServerError("");

    try {
      let isProfileCreated = hasServerProfile;

      if (!isProfileCreated) {
        try {
          await api.post("/providers/profile", {
            firstName: profile.firstName,
            lastName: profile.lastName,
            professionalRole: profile.professionalRole,
            yearsOfExperience: Number(profile.yearsOfExperience),
            contactPhone: profile.contactPhone,
            address: profile.address,
            accurateInfoConsent: true
          });
          isProfileCreated = true;
          setHasServerProfile(true);
        } catch (postError) {
          if (isAxiosError(postError)) {
            const errMsg = String(postError.response?.data?.error || postError.response?.data?.message || "");
            if (errMsg.includes("already exists") || postError.response?.status === 409 || postError.response?.status === 400) {
              isProfileCreated = true;
              setHasServerProfile(true);
            } else throw postError;
          } else throw postError;
        }
      }

      await api.patch("/providers/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        professionalRole: profile.professionalRole,
        yearsOfExperience: Number(profile.yearsOfExperience),
        contactPhone: profile.contactPhone,
        address: profile.address,
        specialization: profile.speciality,
        description: profile.description,
        languages: profile.languages,
        photoUrl: profile.photoUrl,
      });

      setProfile({ ...profile, published: true });
      setIsEditing(false);
    } catch (error) {
      setServerError(profileErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfessionalProfileTab
            profile={profile} isEditing={isEditing} isLoading={isLoading} isSaving={isSaving}
            canPublish={completionPercentage >= 75 && canPublishProfile(profile)}
            serverError={serverError} email={user?.email || ""}
            onUpdate={updateProfile} onSave={handleSave} onEdit={() => setIsEditing(true)}
            onSwitchTab={setActiveTab}
          />
        );
      case "services": return <div>Services Tab Content</div>;
      case "availability": return <div>Availability Tab Content</div>;
      case "appointments": return <div>Appointments Tab Content</div>;
      default: return null;
    }
  };

  return (
    <main className={styles.dashboard__wrapper}>
      <div className="dashboard__header">
        <h1>Welcome back, {profile.firstName || "Provider"}</h1>
        <p>Manage your profile and appointments</p>
      </div>

      <div className="dashboard__content">
        <DashboardSidebar
          activeTab={activeTab} setActiveTab={setActiveTab} isPublished={profile.published}
          photoPreview={profile.photoUrl} completionPercentage={completionPercentage}
          firstName={profile.firstName} lastName={profile.lastName}
        />
        <div className={`dashboard__main-panel ${!isEditing && activeTab === 'profile' ? 'dashboard__main-panel--transparent' : ''}`}>
          {renderTabContent()}
        </div>
      </div>
    </main>
  );
};