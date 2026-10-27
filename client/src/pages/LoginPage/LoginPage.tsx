import { Link, useLocation, useNavigate } from "react-router-dom";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import arrowLeftIcon from "../../assets/img/arrow-left.svg";
import styles from "./LoginPage.module.scss";
import { TextInput } from "../../components/TextInput/TextInput";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import authImage from "../../assets/img/auth-image.svg";
import { EyeIcon } from "../../components/icons/EyeIcon";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage, validateEmail } from "../../utils/validation";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      await login(data.email.trim(), data.password, data.rememberMe);
      navigate(redirectTo ?? "/", { replace: Boolean(redirectTo) });
    } catch (err) {
      setServerError(
        apiErrorMessage(err, "Something went wrong. Please try again later.", {
          400: "Check your email address and password and try again.",
          401: "Incorrect email or password. Check them and try again.",
          403: "Incorrect email or password. Check them and try again.",
          404: "No account found with this email address.",
        }),
      );
    } finally {
      setIsLoading(false);
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
          <form
            className={styles.login__form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={styles.title__block}>
              <h2 className={styles.form__title}>Welcome back</h2>
              <h5 className={styles.form__desc}>
                Log in to manage your appointments and account.
              </h5>
            </div>

            <div className={styles.inputs__block}>
              <TextInput
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email", { validate: validateEmail })}
              />

              <TextInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a password"
                error={errors.password?.message}
                {...register("password", { required: "Enter your password." })}
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
              />
            </div>
            <p className={styles.server__error} role="alert">
              {serverError}
            </p>

            <div className={styles.checkbox__block}>
              <Checkbox
                id="rememberMe"
                label="Remember me"
                {...register("rememberMe")}
              />
              <Link className={styles.forgot__password} to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className={styles.login__block}>
              <button
                className={styles.login__button}
                type="submit"
                disabled={
                  isLoading || Boolean(errors.email) || Boolean(errors.password)
                }
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
              <div className={styles.create__account__block}>
                <span>Don’t have an account? </span>
                <Link className={styles.create__account__link} to="/register">
                  Create account
                </Link>
              </div>
            </div>
          </form>
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
