import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./CheckEmail.module.scss";
import { useAuth } from "../../../../context/AuthContext";

interface Props {
  email: string;
}

export const CheckEmail: React.FC<Props> = ({ email }) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { forgotPassword } = useAuth();

  const handleResendEmail = async () => {
    if (isPending) return;

    try {
      setIsPending(true);
      setResendStatus(null);
      await forgotPassword(email);
      setResendStatus({
        type: "success",
        message: "A new reset link has been sent to your email.",
      });
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to resend email. Please try again.";

      setResendStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Check your email</h2>

      <p className={styles.description}>
        If an account exists for <span className={styles.email}>{email}</span>,
        we’ve sent a link to reset your password.
      </p>

      <p className={styles.note}>The link will expire in 30 minutes.</p>

      {resendStatus && (
        <div
          className={
            resendStatus.type === "success"
              ? styles.successMessage
              : styles.errorMessage
          }
        >
          {resendStatus.message}
        </div>
      )}

      <button
        type="button"
        className={styles.resendButton}
        onClick={handleResendEmail}
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Resend email"}
      </button>

      <div className={styles.switchEmailBlock}>
        <span className={styles.mutedText}>Entered the wrong email?</span>

        <Link to="/forgot-password" className={styles.link}>
          Use a different email
        </Link>
      </div>

      <div className={styles.backToLogin}>
        <span>Back to </span>
        <Link to="/login" className={styles.link}>
          Log in
        </Link>
      </div>
    </div>
  );
};
