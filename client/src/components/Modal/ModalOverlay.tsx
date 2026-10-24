import { useEffect, type ReactNode } from "react";
import styles from "./Modal.module.scss";

interface ModalOverlayProps {
  onClose: () => void;
  labelledBy: string;
  centered?: boolean;
  className?: string;
  children: ReactNode;
}

export const ModalOverlay = ({ onClose, labelledBy, centered = false, className, children }: ModalOverlayProps) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${centered ? styles.modalCentered : ""} ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  );
};
