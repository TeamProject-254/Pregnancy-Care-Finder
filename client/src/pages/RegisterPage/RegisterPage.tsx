import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { AccountStep } from "./components/AccountStep";
import { PatientProfileStep } from "./components/PatientProfileStep";
import { ProviderProfileStep } from "./components/ProviderProfileStep";
import { SuccessModal } from "./components/SuccessModal/SuccessModal";
import { useAuth } from "../../context/AuthContext";

import arrowLeftIcon from "../../assets/img/arrow-left.svg";
import authImage from "../../assets/img/auth-image.svg";
import styles from "./RegisterPage.module.scss";

export type Role = "patient" | "healthcare";

export const RegisterPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("patient");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { completeRegistration } = useAuth();
  const navigate = useNavigate();

  const handleAccountCreated = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleProfileCreated = () => {
    setShowSuccessModal(true);
  };

  return (
    <>
      <Header isLinksShown={false} />
      <main className={styles.register__wrapper}>
        <Link to="/" className={styles.bread__crumbs}>
          <img src={arrowLeftIcon} alt="Back" />
          <span className={styles.bread__crumbs__span}>Back to main page</span>
        </Link>

        <div className={styles.main__content}>
          <div className={styles.form__container}>
            {step === 1 && (
              <AccountStep onNext={handleAccountCreated} />
            )}
            
            {step === 2 && role === "patient" && (
              <PatientProfileStep onBack={() => setStep(1)} onSuccess={handleProfileCreated} />
            )}

            {step === 2 && role === "healthcare" && (
              <ProviderProfileStep onBack={() => setStep(1)} onSuccess={handleProfileCreated} />
            )}
          </div>

          <div className={styles.content__img}>
            <img src={authImage} alt="Care you can trust" />
            <h3 className={styles.img__title}>
              Care you can trust, from the very beginning.
            </h3>
          </div>
        </div>
      </main>
      <Footer />

      {showSuccessModal && (
        <SuccessModal
          role={role}
          onContinue={() => {
            completeRegistration();
            navigate("/profile", { replace: true });
          }}
        />
      )}
    </>
  );
};