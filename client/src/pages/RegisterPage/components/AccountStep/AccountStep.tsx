import { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";

import { useAuth } from "../../../../context/AuthContext";
import { TextInput } from "../../../../components/TextInput/TextInput";
import { Checkbox } from "../../../../components/Checkbox/Checkbox";
import { EyeIcon } from "../../../../components/icons/EyeIcon";
import type { Role } from "../../RegisterPage";

import patientIcon from "../../../../assets/img/pregnant-woman.svg";
import doctorIcon from "../../../../assets/img/doctor-icon-pink.svg";
import styles from "../../RegisterPage.module.scss";

interface AccountFormInputs {
  role: Role;
  email: string;
  password: string;
  confirmPassword: string;
  agreePolicy: boolean;
}

interface AccountStepProps {
  onNext: (role: Role) => void;
}

export const AccountStep = ({ onNext }: AccountStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm<AccountFormInputs>({
    defaultValues: {
      role: "patient",
      email: "",
      password: "",
      confirmPassword: "",
      agreePolicy: false,
    },
  });

  const onSubmit: SubmitHandler<AccountFormInputs> = async (data) => {
    setServerError("");
    setIsLoading(true);
    try {
      const roleEnum = data.role === "patient" ? "PATIENT" : "PROVIDER";

      await registerUser(
        data.email,
        data.password,
        data.confirmPassword,
        roleEnum,
        data.agreePolicy
      );

      onNext(data.role);
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(error.response?.data?.message || "Registration failed. Try again.");
      } else {
        setServerError("Failed to create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.register__form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.step__header}>
        <span className={styles.step__title}>Account details</span>
        <span className={styles.step__indicator}><span>1</span> of 2</span>
      </div>

      <div className={styles.title__block}>
        <h2 className={styles.form__title}>Create your account</h2>
        <h5 className={styles.form__desc}>Join BloomCare to find trusted care and manage your appointments.</h5>
      </div>

      <div className={styles.role__section}>
        <label className={styles.role__label}>Choose role:</label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div className={styles.role__cards}>
              <div
                role="radio"
                aria-checked={field.value === "patient"}
                tabIndex={0}
                className={`${styles.role__card} ${field.value === "patient" ? styles.active : ""}`}
                onClick={() => field.onChange("patient")}
              >
                <img src={patientIcon} alt="Patient" />
                <div className={styles.role__info}>
                  <span className={styles.role__title}>Patient</span>
                  <span className={styles.role__desc}>Find care and book appointments</span>
                </div>
                <div className={styles.radio__circle}>
                  {field.value === "patient" && <div className={styles.radio__inner} />}
                </div>
              </div>

              <div
                role="radio"
                aria-checked={field.value === "healthcare"}
                tabIndex={0}
                className={`${styles.role__card} ${field.value === "healthcare" ? styles.active : ""}`}
                onClick={() => field.onChange("healthcare")}
              >
                <img src={doctorIcon} alt="Healthcare professional" />
                <div className={styles.role__info}>
                  <span className={styles.role__title}>Healthcare professional</span>
                  <span className={styles.role__desc}>Create your professional profile</span>
                </div>
                <div className={styles.radio__circle}>
                  {field.value === "healthcare" && <div className={styles.radio__inner} />}
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <div className={styles.inputs__block}>
        <TextInput
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          isValid={dirtyFields.email}
          error={errors.email?.message}
          {...register("email", { required: "Email required" })}
        />
        <TextInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a secure password"
          isValid={dirtyFields.password}
          error={errors.password?.message}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.eye__btn}>
              <EyeIcon />
            </button>
          }
          {...register("password", { required: "Password required" })}
        />
        <TextInput
          id="confirmPassword"
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Type your password again"
          isValid={dirtyFields.confirmPassword}
          error={errors.confirmPassword?.message}
          rightElement={
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.eye__btn}>
              <EyeIcon />
            </button>
          }
          {...register("confirmPassword", {
            required: "Confirm password",
            validate: (val) => val === getValues("password") || "Passwords don't match",
          })}
        />
      </div>

      <div className={styles.checkbox__block}>
        <Checkbox
          id="agreePolicy"
          label={
            <span>
              I agree to the <a
                href="/terms-of-service.txt"
                download="BloomCare-Terms-of-Service.txt"
                className={styles.policy__link}
              >
                Terms of Service
              </a> and{" "}
              <a
                href="/privacy-policy.txt"
                download="BloomCare-Privacy-Policy.txt"
                className={styles.policy__link}
              >
                Privacy Policy
              </a>
            </span>
          }
          {...register("agreePolicy", { required: "Required" })}
        />
      </div>

      {serverError && <p className={styles.server__error}>{serverError}</p>}

      <div className={styles.action__block}>
        <button type="submit" className={styles.submit__button} disabled={isLoading}>
          {isLoading ? "Processing..." : "Continue"}
        </button>
        <div className={styles.login__redirect}>
          <span>Already have an account? </span>
          <Link className={styles.login__link} to="/login">Log In</Link>
        </div>
      </div>
    </form>
  );
};