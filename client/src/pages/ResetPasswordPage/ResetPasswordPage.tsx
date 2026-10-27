import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import axios from "axios";
import { TextInput } from "../../components/TextInput";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import arrowLeftIcon from "../../assets/img/arrow-left.svg";
import authImage from "../../assets/img/auth-image.svg";
import { EyeIcon } from "../../components/icons/EyeIcon";
import styles from "./ResetPasswordPage.module.scss";
import { useAuth } from "../../context/AuthContext";
import { PasswordUpdated } from "./components";
import { newPasswordValidators } from "../../utils/validation";

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

interface SpringErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const { resetPassword } = useAuth();
  const token = searchParams.get("token");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInputs>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (!token) {
    return (
      <>
        <Header isLinksShown={false} />
        <main className={styles.reset__wrapper}>
          <div className={styles.error__card}>
            <h2>Invalid Reset Link</h2>
            <p>The password reset token is missing or malformed.</p>
            <Link to="/forgot-password" className={styles.action__link}>
              Request a new reset link
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    setGeneralError(null);

    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error) {
      if (axios.isAxiosError<SpringErrorResponse>(error)) {
        const responseData = error.response?.data;
        setGeneralError(
          responseData?.message ||
            "Invalid or expired token. Please request a new one.",
        );
      } else {
        setGeneralError("Unable to connect to the server");
      }
    }
  };

  return (
    <>
      <Header isLinksShown={false} />
      <main className={styles.reset__wrapper}>
        <Link to="/login" className={styles.bread__crumbs}>
          <img src={arrowLeftIcon} alt="" />
          <span className={styles.bread__crumbs__span}>Back to login</span>
        </Link>

        <div className={styles.main__content}>
          {isSuccess ? (
            <PasswordUpdated />
          ) : (
            <form
              className={styles.reset__form}
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className={styles.title__block}>
                <h2 className={styles.form__title}>Set New Password</h2>
                <h5 className={styles.form__desc}>
                  Must be at least 8 characters with letters, numbers, and
                  symbols
                </h5>
              </div>

              {generalError && (
                <div className={styles.server__error}>{generalError}</div>
              )}

              <div className={styles.inputs__block}>
                <TextInput
                  id="password"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  error={errors.password?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <EyeIcon />
                    </button>
                  }
                  {...register("password", { validate: newPasswordValidators })}
                />

                <TextInput
                  id="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  error={errors.confirmPassword?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <EyeIcon />
                    </button>
                  }
                  {...register("confirmPassword", {
                    required: "Repeat your new password.",
                    validate: (value) =>
                      value === watch("password") || "Passwords don't match. Type the same password again.",
                  })}
                />
              </div>

              <div className={styles.reset__block}>
                <button
                  className={styles.reset__button}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <div className={styles.content__img}>
            <img src={authImage} alt="" />
            <h3 className={styles.img__title}>Your care, all in one place.</h3>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
