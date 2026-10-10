import { useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";

import { api } from "../../../../api/axios";
import { Checkbox } from "../../../../components/Checkbox/Checkbox";
import { TextInput } from "../../../../components/TextInput/TextInput";
import { useAuth } from "../../../../context/AuthContext";
import { PROVIDER_SPECIALTIES } from "../../../../constants/providerOptions";
import styles from "../../RegisterPage.module.scss";

interface ProviderFormInputs {
  firstName: string;
  lastName: string;
  professionalRole: string;
  yearsOfExperience: number;
  contactPhone: string;
  address: string;
  accurateInfoConsent: boolean;
}

interface ProviderProfileProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ProviderProfileStep = ({ onBack, onSuccess }: ProviderProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProviderFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      professionalRole: "",
      yearsOfExperience: undefined,
      contactPhone: "",
      address: "",
      accurateInfoConsent: false,
    },
  });
  const consentAccepted = useWatch({ control, name: "accurateInfoConsent" });

  const onSubmit: SubmitHandler<ProviderFormInputs> = async (data) => {
    setIsLoading(true);
    setServerError("");
    try {
      await api.post("/providers/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        professionalRole: data.professionalRole,
        yearsOfExperience: Number(data.yearsOfExperience),
        contactPhone: data.contactPhone,
        address: data.address,
        accurateInfoConsent: data.accurateInfoConsent,
      });
      if (user?.userId) {
        const profileDraft = {
          firstName: data.firstName,
          lastName: data.lastName,
          professionalRole: data.professionalRole,
          yearsOfExperience: String(data.yearsOfExperience),
          contactPhone: data.contactPhone,
          address: data.address,
          speciality: data.professionalRole,
          languages: [],
          description: "",
          photoUrl: null,
          published: false,
        };
        try {
          localStorage.setItem(`provider-profile:${user.userId}:draft`, JSON.stringify(profileDraft));
        } catch (storageError) {
          console.error("Could not save the registration details as a profile draft.", storageError);
        }
      }
      onSuccess();
    } catch (error) {
      if (isAxiosError(error)) {
        const responseData = error.response?.data as Record<string, string> | undefined;
        const validationErrors = responseData?.validationErrors as Record<string, string> | undefined;
        setServerError(
          responseData?.message ||
          responseData?.error ||
          (validationErrors ? Object.values(validationErrors).join(" ") : "") ||
          "Failed to create profile. Please check your details."
        );
      } else {
        setServerError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={`${styles.register__form} ${styles.provider__register__form}`} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.step__header}>
        <span className={styles.step__title}>Professional profile</span>
        <span className={styles.step__indicator}><span>2</span> of 2</span>
      </div>

      <div className={styles.title__block}>
        <h2 className={styles.form__title}>Tell us about your practice</h2>
        <h5 className={styles.form__desc}>
          Add a few details to personalize your experience. You can update them later in your personal cabinet.
        </h5>
      </div>

      <div className={styles.inputs__block}>
        <div className={styles.row__inputs}>
          <TextInput
            id="firstName"
            label="First name"
            placeholder="First name"
            compact
            error={errors.firstName?.message}
            {...register("firstName", { required: "Required" })}
          />
          <TextInput
            id="lastName"
            label="Last name"
            placeholder="Last name"
            compact
            error={errors.lastName?.message}
            {...register("lastName", { required: "Required" })}
          />
        </div>
        <div className={styles.provider__field}>
          <label htmlFor="professionalRole">Speciality</label>
          <select
            id="professionalRole"
            className={styles.provider__select}
            aria-invalid={Boolean(errors.professionalRole)}
            {...register("professionalRole", { required: "Required" })}
          >
            <option value="">Select speciality</option>
            {PROVIDER_SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          {errors.professionalRole?.message && (
            <span className={styles.provider__error}>{errors.professionalRole.message}</span>
          )}
        </div>
        <div className={styles.row__inputs}>
          <TextInput
            id="yearsOfExperience"
            label="Years of experience"
            type="number"
            placeholder="How many years of experience?"
            compact
            error={errors.yearsOfExperience?.message}
            {...register("yearsOfExperience", {
              required: "Required",
              min: { value: 0, message: "Cannot be negative" },
              valueAsNumber: true,
            })}
          />
          <TextInput
            id="contactPhone"
            label="Contact phone"
            type="tel"
            placeholder="+380 00 000 00 00"
            compact
            error={errors.contactPhone?.message}
            {...register("contactPhone", { required: "Required" })}
          />
        </div>
        <TextInput
          id="address"
          label="Consultation city/address"
          placeholder="Enter city and consultation address"
          compact
          error={errors.address?.message}
          {...register("address", { required: "Required" })}
        />
      </div>

      <div className={styles.provider__consent}>
        <Checkbox
          id="accurateInfoConsent"
          compact
          label="I confirm that the information is accurate"
          {...register("accurateInfoConsent", { required: "Consent required" })}
        />
        {errors.accurateInfoConsent?.message && (
          <span className={styles.provider__error}>{errors.accurateInfoConsent.message}</span>
        )}
      </div>

      {serverError && <p className={styles.server__error}>{serverError}</p>}

      <div className={styles.action__block}>
        <div className={styles.button__group}>
          <button
            type="button"
            onClick={onBack}
            className={`${styles.submit__button} ${styles["submit__button--outline"]}`}
          >
            Back
          </button>
          <button type="submit" className={styles.submit__button} disabled={isLoading || !consentAccepted}>
            {isLoading ? "Saving..." : "Register"}
          </button>
        </div>
        <div className={styles.login__redirect}>
          <span>Already have an account? </span>
          <Link className={styles.login__link} to="/login">Log In</Link>
        </div>
      </div>
    </form>
  );
};