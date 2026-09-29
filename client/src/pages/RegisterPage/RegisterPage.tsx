import { Link } from "react-router-dom";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import arrowLeftIcon from "../../assets/img/arrow-left.svg";
import authImage from "../../assets/img/auth-image.svg";
import patientIcon from "../../assets/img/pregnant-woman.svg"; 
import doctorIcon from "../../assets/img/doctor-icon-dark.svg"; 
import styles from "./RegisterPage.module.scss";
import { TextInput } from "../../components/TextInput/TextInput";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { EyeIcon } from "../../components/icons/EyeIcon";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useState } from "react";

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
  
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
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

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    console.log(data);
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
                Join Pregnancy Care Finder to find trusted care and manage your appointments.
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
                      className={`${styles.role__card} ${field.value === 'patient' ? styles.active : ''}`}
                      onClick={() => field.onChange('patient')}
                    >
                      <img src={patientIcon} alt="Patient" />
                      <div className={styles.role__info}>
                        <span className={styles.role__title}>Patient</span>
                        <span className={styles.role__desc}>Find care and book appointments</span>
                      </div>
                      <div className={styles.radio__circle}>
                        {field.value === 'patient' && <div className={styles.radio__inner} />}
                      </div>
                    </div>
                    
                    <div 
                      className={`${styles.role__card} ${field.value === 'healthcare' ? styles.active : ''}`}
                      onClick={() => field.onChange('healthcare')}
                    >
                      <img src={doctorIcon} alt="Healthcare professional" />
                      <div className={styles.role__info}>
                        <span className={styles.role__title}>Healthcare professional</span>
                        <span className={styles.role__desc}>Create your professional profile</span>
                      </div>
                      <div className={styles.radio__circle}>
                        {field.value === 'healthcare' && <div className={styles.radio__inner} />}
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
                  {...register("firstName", { required: "First name is required" })}
                />
                <TextInput
                  id="lastName"
                  label="Last name"
                  placeholder="Last name"
                  error={errors.lastName?.message}
                  {...register("lastName", { required: "Last name is required" })}
                />
              </div>

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
                placeholder="Create a secure password"
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
                    className={styles.eye__btn}
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
                  <span>I agree to the <Link to="/privacy" className={styles.policy__link}>Privacy policy.</Link></span>
                }
                {...register("agreePolicy", {
                  required: "You must agree to the privacy policy",
                })}
              />
              {errors.agreePolicy && (
                <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  {errors.agreePolicy.message}
                </span>
              )}
            </div>

            <div className={styles.action__block}>
              <button className={styles.submit__button}>Create account</button>
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
            <h3 className={styles.img__title}>Care you can trust, from the very beginning.</h3>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};