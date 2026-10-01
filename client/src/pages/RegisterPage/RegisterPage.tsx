import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";

import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { TextInput } from "../../components/TextInput/TextInput";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { EyeIcon } from "../../components/icons/EyeIcon";
import { useAuth } from "../../context/AuthContext";

import arrowLeftIcon from "../../assets/img/arrow-left.svg";
import authImage from "../../assets/img/auth-image.svg";
import patientIcon from "../../assets/img/pregnant-woman.svg";
import doctorIcon from "../../assets/img/doctor-icon-dark.svg";

import styles from "./RegisterPage.module.scss";

interface RegisterFormInputs {
  role: "patient" | "healthcare";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreePolicy: boolean;
}

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm<RegisterFormInputs>({
    mode: "onChange",
    defaultValues: {
      role: "patient",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreePolicy: false,
    },
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setServerError("");
    setIsLoading(true);

    try {
      const role = data.role === "patient" ? "PATIENT" : "PROVIDER";
      await registerUser(data.email, data.password, role);
      navigate("/profile", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | Record<string, string>
          | undefined;

        if (responseData?.email) {
          setServerError(responseData.email);
        } else if (responseData?.password) {
          setServerError(responseData.password);
        } else if (responseData?.role) {
          setServerError(responseData.role);
        } else if (responseData?.error) {
          setServerError(responseData.error);
        } else if (error.response?.status === 409) {
          setServerError("This email is already registered.");
        } else if (error.response?.status === 400) {
          setServerError("Invalid registration data. Please check your details.");
        } else if (!error.response) {
          setServerError("Cannot connect to server. Please try again.");
        } else {
          setServerError("Registration failed. Please try again.");
        }
      } else {
        setServerError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header isLinksShown={false} />

      <main className={styles.register__wrapper}>
        <Link to="/" className={styles.bread__crumbs}>
          <img src={arrowLeftIcon} alt="" />
          <span className={styles.bread__crumbs__span}>Back to main page</span>
        </Link>

        <div className={styles.main__content}>
          <form
            className={styles.register__form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={styles.title__block}>
              <h2 className={styles.form__title}>Create your account</h2>
              <h5 className={styles.form__desc}>
                Join Pregnancy Care Finder to find trusted care and manage your
                appointments.
              </h5>
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
                      className={`${styles.role__card} ${
                        field.value === "patient" ? styles.active : ""
                      }`}
                      onClick={() => field.onChange("patient")}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          field.onChange("patient");
                        }
                      }}
                    >
                      <img src={patientIcon} alt="Patient" />

                      <div className={styles.role__info}>
                        <span className={styles.role__title}>Patient</span>
                        <span className={styles.role__desc}>
                          Find care and book appointments
                        </span>
                      </div>

                      <div className={styles.radio__circle}>
                        {field.value === "patient" && (
                          <div className={styles.radio__inner} />
                        )}
                      </div>
                    </div>

                    <div
                      role="radio"
                      aria-checked={field.value === "healthcare"}
                      tabIndex={0}
                      className={`${styles.role__card} ${
                        field.value === "healthcare" ? styles.active : ""
                      }`}
                      onClick={() => field.onChange("healthcare")}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          field.onChange("healthcare");
                        }
                      }}
                    >
                      <img src={doctorIcon} alt="Healthcare professional" />

                      <div className={styles.role__info}>
                        <span className={styles.role__title}>
                          Healthcare professional
                        </span>
                        <span className={styles.role__desc}>
                          Create your professional profile
                        </span>
                      </div>

                      <div className={styles.radio__circle}>
                        {field.value === "healthcare" && (
                          <div className={styles.radio__inner} />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            <div className={styles.inputs__block}>
              <div className={styles.row__inputs}>
                <TextInput
                  id="firstName"
                  label="First name"
                  placeholder="First name"
                  error={errors.firstName?.message}
                  isValid={dirtyFields.firstName}
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />

                <TextInput
                  id="lastName"
                  label="Last name"
                  placeholder="Last name"
                  error={errors.lastName?.message}
                  isValid={dirtyFields.lastName}
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
              </div>

              <TextInput
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                isValid={dirtyFields.email}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />

              <TextInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                error={errors.password?.message}
                isValid={dirtyFields.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/,
                    message:
                      "Password must contain uppercase, lowercase, number and special character",
                  },
                })}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={styles.eye__btn}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <EyeIcon />
                  </button>
                }
              />

              <TextInput
                id="confirmPassword"
                label="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Type your password again"
                error={errors.confirmPassword?.message}
                isValid={dirtyFields.confirmPassword}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                })}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className={styles.eye__btn}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <EyeIcon />
                  </button>
                }
              />
            </div>

            <div className={styles.checkbox__block}>
              <Checkbox
                id="agreePolicy"
                label={
                  <span>
                    I agree to the{" "}
                    <Link to="/privacy" className={styles.policy__link}>
                      Privacy policy.
                    </Link>
                  </span>
                }
                {...register("agreePolicy", {
                  required: "You must agree to the privacy policy",
                })}
              />

              {errors.agreePolicy && (
                <span className={styles.checkbox__error}>
                  {errors.agreePolicy.message}
                </span>
              )}
            </div>

            {serverError && (
              <p className={styles.server__error} role="alert">
                {serverError}
              </p>
            )}

            <div className={styles.action__block}>
              <button
                type="submit"
                className={styles.submit__button}
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>

              <div className={styles.login__redirect}>
                <span>Already have an account? </span>
                <Link className={styles.login__link} to="/login">
                  Sign In
                </Link>
              </div>
            </div>
          </form>

          <div className={styles.content__img}>
            <img src={authImage} alt="" />
            <h3 className={styles.img__title}>
              Care you can trust, from the very beginning.
            </h3>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};