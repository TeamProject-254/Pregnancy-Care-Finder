import { Link, useNavigate } from "react-router-dom";
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
import { isAxiosError } from "axios";

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
      await login(data.email, data.password, data.rememberMe);
      navigate("/");
    } catch (err) {
      if (isAxiosError(err)) {
        setServerError(
          err.response?.data?.message ||
            "Invalid email or password. Please try again.",
        );
      } else {
        setServerError("Something went wrong. Please try again later.");
      }
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
                placeholder="Enter a password"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
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
              <Link className={styles.forgot__password} to="/">
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
