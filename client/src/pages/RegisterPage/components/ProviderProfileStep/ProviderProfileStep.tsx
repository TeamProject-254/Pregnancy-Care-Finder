import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { isAxiosError } from "axios";
import { Link } from "react-router-dom";

import { api } from "../../../../api/axios";
import { TextInput } from "../../../../components/TextInput/TextInput";
import { Checkbox } from "../../../../components/Checkbox/Checkbox";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormInputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      professionalRole: "",
      yearsOfExperience: 0,
      contactPhone: "",
      address: "",
      accurateInfoConsent: false,
    },
  });

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
      onSuccess();
    } catch (error) {
      if (isAxiosError(error)) {
        const responseData = error.response?.data as Record<string, string> | undefined;
        setServerError(
          responseData?.message || 
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
    <form className={styles.register__form} onSubmit={handleSubmit(onSubmit)}>
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
            error={errors.firstName?.message}
            {...register("firstName", { required: "Required" })}
          />
          <TextInput
            id="lastName"
            label="Last name"
            placeholder="Last name"
            error={errors.lastName?.message}
            {...register("lastName", { required: "Required" })}
          />
        </div>
        <TextInput
          id="professionalRole"
          label="Select professional role"
          placeholder="Doctor"
          error={errors.professionalRole?.message}
          {...register("professionalRole", { required: "Required" })}
        />
        <div className={styles.row__inputs}>
          <TextInput
            id="yearsOfExperience"
            label="Years of experience"
            type="number"
            placeholder="How many years?"
            error={errors.yearsOfExperience?.message}
            {...register("yearsOfExperience", { required: "Required", min: 0 })}
          />
          <TextInput
            id="contactPhone"
            label="Contact phone"
            placeholder="+380 00 000 00 00"
            error={errors.contactPhone?.message}
            {...register("contactPhone", { required: "Required" })}
          />
        </div>
        <TextInput
          id="address"
          label="Consultation city/address"
          placeholder="Enter city and consultation address"
          error={errors.address?.message}
          {...register("address", { required: "Required" })}
        />

        <div className={styles.checkbox__block}>
          <Checkbox
            id="accurateInfoConsent"
            label="I confirm that the information is accurate"
            {...register("accurateInfoConsent", { required: "Consent required" })}
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