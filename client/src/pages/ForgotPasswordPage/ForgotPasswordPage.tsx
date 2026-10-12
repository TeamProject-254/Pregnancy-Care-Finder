import { Header } from "../../components/Header";
import arrowLeftIcon from "../../assets/img/arrow-left.svg";
import styles from "./ForgotPasswordPage.module.scss";
import { Link } from "react-router-dom";
import { TextInput } from "../../components/TextInput";
import { useForm, type SubmitHandler } from "react-hook-form";
import authImage from "../../assets/img/auth-image.svg";
import { Footer } from "../../components/Footer";
import { useState } from "react";
import { CheckEmail } from "./components/CheckEmail";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

interface SpringErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

interface ForgotPasswordFormInputs {
  email: string;
}

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [isCheckModalOpen, setIsCheckModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    setGeneralError(null);

    try {
      setIsLoading(true);
      await forgotPassword(data.email);
      setIsLoading(false);
      setIsCheckModalOpen(true);
      setSubmittedEmail(data.email);
    } catch (error) {
      if (axios.isAxiosError<SpringErrorResponse>(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        if (status === 404) {
          setError("email", {
            type: "server",
            message:
              responseData?.message ||
              "No account found with this email address",
          });
        } else if (status === 400) {
          setError("email", {
            type: "server",
            message: responseData?.message || "Invalid email address",
          });
        } else {
          setGeneralError(
            responseData?.message ||
              "Something went wrong. Please try again later.",
          );
        }
      } else {
        setGeneralError("Unable to connect to the server");
      }
    }
  };

  return (
    <>
      <Header isLinksShown={false} />
      <main className={styles.login__wrapper}>
        <Link to="/" className={styles.bread__crumbs}>
          <img src={arrowLeftIcon} alt="" />
          <span className={styles.bread__crumbs__span}>Back to main page</span>
        </Link>

        <div className={styles.main__content}>
          {isCheckModalOpen ? (
            <CheckEmail email={submittedEmail} />
          ) : (
            <form
              className={styles.login__form}
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className={styles.title__block}>
                <h2 className={styles.form__title}>Forgot password?</h2>
                <h5 className={styles.form__desc}>
                  Enter your email address and we’ll send you a link to reset
                  your password
                </h5>
              </div>

              <div className={styles.inputs__block}>
                <TextInput
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {generalError && (
                <p className={styles.server__error}>{generalError}</p>
              )}

              <div className={styles.login__block}>
                <button
                  className={styles.login__button}
                  type="submit"
                  disabled={isLoading}
                >
                  Send reset link
                </button>
                <div className={styles.create__account__block}>
                  <span>Don’t have an account? </span>
                  <Link className={styles.create__account__link} to="/register">
                    Log in
                  </Link>
                </div>
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
