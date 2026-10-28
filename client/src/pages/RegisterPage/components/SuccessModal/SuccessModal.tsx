import { Link } from "react-router-dom";
import styles from "./SuccessModal.module.scss";
import tickGreenIcon from "../../../../assets/img/icon-tick-green.svg";

interface SuccessModalProps {
  role: "patient" | "healthcare";
  onContinue: () => void;
}

export const SuccessModal = ({ role, onContinue }: SuccessModalProps) => {
  return (
    <div className={styles.modal__overlay}>
      <div className={styles.modal__content}>
        <div className={styles.modal__icon}>
          <img src={tickGreenIcon} width={40} height={40} alt="" aria-hidden="true" />
        </div>

        {role === "healthcare" ? (
          <>
            <h2 className={styles.modal__title}>Professional account created</h2>
            <p className={styles.modal__desc}>
              Complete your professional profile in the dashboard to appear in search results and start receiving appointments.
            </p>
            <div className={styles.modal__actions}>
              <button onClick={onContinue} className={styles.btn__primary}>
                Go to doctor dashboard
              </button>
              <Link to="/" className={styles.btn__secondary}>
                Back to main page
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.modal__title}>Account created</h2>
            <p className={styles.modal__desc}>
              Your patient account is ready.
            </p>
            <div className={styles.modal__actions}>
              <button onClick={onContinue} className={styles.btn__primary}>
                Go to personal cabinet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};