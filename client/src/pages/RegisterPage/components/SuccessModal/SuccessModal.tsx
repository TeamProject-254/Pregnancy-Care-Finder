import styles from "./SuccessModal.module.scss";
import successIcon from "../../../../assets/img/success-icon.svg";

interface SuccessModalProps {
  onContinue?: () => void;
}

export const SuccessModal = ({ onContinue }: SuccessModalProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon__wrapper}>
          <img src={successIcon} alt="Success checkmark" />
        </div>
        
        <h2 className={styles.title}>Account created</h2>
        <p className={styles.desc}>
          Your patient account is ready.
        </p>
        
        <div className={styles.actions}>
          <button 
            className={styles.button}
            onClick={onContinue}
          >
            Go to personal cabinet
          </button>
        </div>
      </div>
    </div>
  );
};