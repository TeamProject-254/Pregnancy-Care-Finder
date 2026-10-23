import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { isAxiosError } from "axios";
import { api } from "../../../../api/axios";
import cameraIcon from "../../../../assets/img/camera-icon.svg";
import { useAuth } from "../../../../context/AuthContext";
import type { PatientResponse } from "../../PatientDashboard";
import defaultAvatar from "../../../../assets/img/profile-icon.svg";
import { CityAutocomplete } from "../CityAutocomplete/CityAutocomplete";
import styles from "./PatientEditForm.module.scss";

const CLOUDINARY_CLOUD_NAME = "gjckdqml";
const CLOUDINARY_UPLOAD_PRESET = "BloomCare";

const AVAILABLE_LANGUAGES = ["English", "Ukrainian", "Polish"] as const;

interface PatientEditFormProps {
  initialData: PatientResponse | null;
  pregnancyWeek: number;
  onSuccess: (updatedProfile: PatientResponse) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  contactPhone: string;
  location: string;
  languages: string[];
  explicitConsent: boolean;
}

interface PatientUpdateRequestPayload {
  firstName: string;
  lastName: string;
  location: string;
  languages: string[];
  pregnancyWeek: number;
  explicitConsent: boolean;
  photoUrl: string;
}

export const PatientEditForm = ({
  initialData,
  pregnancyWeek,
  onSuccess,
}: PatientEditFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [serverError, setServerError] = useState<string>("");
  const [photoError, setPhotoError] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.photoUrl || null,
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: user?.email || "",
      contactPhone: "",
      location: initialData?.location || "",
      languages: Array.isArray(initialData?.languages)
        ? initialData.languages
        : [],
      explicitConsent: initialData?.explicitConsent ?? false,
    },
  });

  const selectedLanguages = watch("languages") || [];

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError("");

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Please choose an image smaller than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (data.secure_url) {
        setPhotoPreview(data.secure_url);
      } else {
        setPhotoError("Failed to upload image. Please try again.");
      }
    } catch {
      setPhotoError("Error uploading image. Please check your connection.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormValues) => {
    setServerError("");

    const parsedWeek = Number(pregnancyWeek);
    const safePregnancyWeek = isNaN(parsedWeek)
      ? 1
      : Math.min(Math.max(parsedWeek, 1), 42);

    const payload: PatientUpdateRequestPayload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      location: data.location.trim(),
      languages: data.languages || [],
      pregnancyWeek: safePregnancyWeek,
      explicitConsent: data.explicitConsent,
      photoUrl: photoPreview ? photoPreview : "",
    };

    try {
      const response = await api.patch<PatientResponse>(
        "/patients/profile",
        payload,
      );

      onSuccess(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        const errorData = error.response?.data as
          | {
              message?: string;
              error?: string;
              validationErrors?: Record<string, string>;
            }
          | undefined;

        const validationMessage = errorData?.validationErrors
          ? Object.values(errorData.validationErrors).join("; ")
          : "";

        setServerError(
          errorData?.message ||
            validationMessage ||
            errorData?.error ||
            "Failed to save profile changes.",
        );
      } else {
        setServerError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className={styles.form__container}>
      <h3 className={styles.form__title}>Personal profile</h3>
      <div className={styles.photo__section}>
        <div className={styles.photo__preview_wrapper}>
          <img
            src={photoPreview || defaultAvatar}
            alt="Current profile"
            className={styles.photo__preview}
          />

          {photoPreview && (
            <button
              type="button"
              className={styles.photo__remove_btn}
              onClick={handleRemovePhoto}
              disabled={isUploadingPhoto}
              aria-label="Remove photo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="#2B2F32"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div
          className={styles.upload__card}
          style={{
            opacity: isUploadingPhoto ? 0.6 : 1,
            cursor: isUploadingPhoto ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (!isUploadingPhoto) {
              fileInputRef.current?.click();
            }
          }}
        >
          <div className={styles.upload__icon}>
            <img src={cameraIcon} alt="" />
          </div>
          <div className={styles.upload__texts}>
            <span className={styles.upload__title}>
              {isUploadingPhoto ? "Uploading..." : "Change photo"}
            </span>
            <span className={styles.upload__hint}>JPG or PNG, max 5MB</span>
          </div>
        </div>

        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          ref={fileInputRef}
          className={styles.hidden__file_input}
          onChange={handleFileChange}
          disabled={isUploadingPhoto}
        />
      </div>

      {photoError && <div className={styles.photo__error}>{photoError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {serverError && (
          <div className={styles.server__error}>{serverError}</div>
        )}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First name</label>
            <input
              type="text"
              className={`${styles.input} ${
                errors.firstName ? styles.input__error : ""
              }`}
              placeholder="e.g. Hanna"
              {...register("firstName", { required: "First name is required" })}
            />
            {errors.firstName && (
              <span className={styles.error_text}>
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Last name</label>
            <input
              type="text"
              className={`${styles.input} ${
                errors.lastName ? styles.input__error : ""
              }`}
              placeholder="e.g. Kovalenko"
              {...register("lastName", { required: "Last name is required" })}
            />
            {errors.lastName && (
              <span className={styles.error_text}>
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              disabled
              className={`${styles.input} ${styles.input__disabled}`}
              {...register("email")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contact phone</label>
            <input
              type="tel"
              className={styles.input}
              placeholder="+380 00 000 00 00"
              {...register("contactPhone")}
            />
          </div>
        </div>

        <div className={styles.field}>
          <Controller
            name="location"
            control={control}
            rules={{ required: "Location is required" }}
            render={({ field, fieldState }) => (
              <CityAutocomplete
                value={field.value}
                onSelectCity={(city) => field.onChange(city)}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Spoken languages</label>

          <div className={styles.languagesGroup}>
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isChecked = selectedLanguages.includes(lang);

              return (
                <label key={lang} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={lang}
                    className={styles.real__checkbox}
                    {...register("languages")}
                  />
                  <span className={styles.custom__checkbox}>
                    {isChecked && (
                      <svg
                        width="12"
                        height="10"
                        viewBox="0 0 12 10"
                        fill="none"
                        className={styles.checkIcon}
                      >
                        <path
                          d="M1 5L4.5 8.5L11 1.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={styles.checkboxText}>{lang}</span>
                </label>
              );
            })}
          </div>

          {errors.languages && (
            <span className={styles.error_text}>
              {errors.languages.message}
            </span>
          )}
        </div>

        <div className={styles.consent__row}>
          <Controller
            name="explicitConsent"
            control={control}
            rules={{
              required: "You must give consent to process pregnancy data",
            }}
            render={({ field }) => (
              <label className={styles.checkbox__container}>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className={styles.real__checkbox}
                />
                <span className={styles.custom__checkbox}>
                  {field.value && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <div className={styles.consent__texts}>
                  <span className={styles.consent__main}>
                    I explicitly consent to the processing of my pregnancy
                    information
                  </span>
                  <span className={styles.consent__sub}>
                    You can remove your pregnancy at anytime
                  </span>
                </div>
              </label>
            )}
          />
          {errors.explicitConsent && (
            <span className={styles.error_text}>
              {errors.explicitConsent.message}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingPhoto}
            className={styles.btn__submit}
          >
            {isSubmitting ? "Saving..." : "Save and continue"}
          </button>
        </div>
      </form>
    </div>
  );
};
