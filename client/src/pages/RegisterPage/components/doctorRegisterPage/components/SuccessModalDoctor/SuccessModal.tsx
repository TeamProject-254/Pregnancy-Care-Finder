import styles from "./SuccessModal.module.scss";
import successIcon from "../../../../assets/img/success-icon.svg";

interface SuccessModalProps {
  onContinue?: () => void;
  onBack?: () => void;
}

export const SuccessModal = ({ onContinue, onBack }: SuccessModalProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon__wrapper}>
          <img src={successIcon} alt="Success checkmark" />
        </div>
        
        <h2 className={styles.title}>Professional account created</h2>
        <p className={styles.desc}>
          Your account has been successfully created.<br/>
          Complete your professional profile to start receiving appointments.
        </p>
        
        <div className={styles.actions}>
          <button 
            className={styles.button}
            onClick={onContinue}
          >
            Go to doctor dashboard
          </button>

          <button 
            className={styles.button__back}
            onClick={onBack}
          >
            Back to main page
          </button>
        </div>
      </div>
    </div>
  );
};