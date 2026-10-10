import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";

import { api } from "../../../../api/axios";
import { TextInput } from "../../../../components/TextInput/TextInput";
import { Checkbox } from "../../../../components/Checkbox/Checkbox";
import styles from "../../RegisterPage.module.scss";

interface PatientFormInputs {
  firstName: string;
  lastName: string;
  location: string;
  languages: string;
  pregnancyWeek?: number;
  explicitConsent: boolean;
}

interface PatientProfileProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const PatientProfileStep = ({ onBack, onSuccess }: PatientProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      location: "",
      languages: "",
      explicitConsent: false,
    },
  });

  const onSubmit: SubmitHandler<PatientFormInputs> = async (data) => {
    setIsLoading(true);
    setServerError("");
    try {
      await api.post("/patients/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        languages: data.languages ? [data.languages] : [],
        pregnancyWeek: data.pregnancyWeek ? Number(data.pregnancyWeek) : null,
        explicitConsent: data.explicitConsent,
      });
      onSuccess();
    } catch (error) {
      if (isAxiosError(error)) {
        // Витягуємо конкретну помилку валідації з бекенда (наприклад, про 42 тижні)
        const responseData = error.response?.data as Record<string, string> | undefined;
        setServerError(
          responseData?.message || 
          responseData?.pregnancyWeek || 
          "Failed to create profile. Please check your data."
        );
      } else {
        setServerError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.register__form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.step__header}>
        <span className={styles.step__title}>Patient profile</span>
        <span className={styles.step__indicator}><span>2</span> of 2</span>
      </div>

      <div className={styles.title__block}>
        <h2 className={styles.form__title}>Tell us about yourself</h2>
        <h5 className={styles.form__desc}>
          Add a few details to personalize your experience. You can update them later in your personal cabinet.
        </h5>
      </div>

      <div className={styles.inputs__block}>
        <div className={styles.row__inputs}>
          <TextInput
            id="firstName"
            label="First name"
            placeholder="Hanna"
            error={errors.firstName?.message}
            {...register("firstName", { required: "Required" })}
          />
          <TextInput
            id="lastName"
            label="Last name"
            placeholder="Kovalenko"
            error={errors.lastName?.message}
            {...register("lastName", { required: "Required" })}
          />
        </div>
        <TextInput
          id="location"
          label="Location"
          placeholder="Kyiv"
          error={errors.location?.message}
          {...register("location", { required: "Required" })}
        />
        <TextInput
          id="languages"
          label="Preferred languages"
          placeholder="Ukrainian"
          error={errors.languages?.message}
          {...register("languages", { required: "Required" })}
        />
        <TextInput
          id="pregnancyWeek"
          label={
            <span>
              Pregnancy week - <span className={styles.optional__text}>optional</span>
            </span>
          }
          type="number"
          placeholder="Week 3"
          error={errors.pregnancyWeek?.message}
          {...register("pregnancyWeek", {
            max: { value: 42, message: "Pregnancy week cannot exceed 42" },
            min: { value: 1, message: "Pregnancy week must be at least 1" }
          })}
        />

        <div className={styles.checkbox__block}>
          <Checkbox
            id="explicitConsent"
            label="I explicitly consent to the processing of my pregnancy information"
            {...register("explicitConsent", { required: "Consent required" })}
          />
        </div>
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
          <button type="submit" className={styles.submit__button} disabled={isLoading}>
            {isLoading ? "Saving..." : "Create account"}
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