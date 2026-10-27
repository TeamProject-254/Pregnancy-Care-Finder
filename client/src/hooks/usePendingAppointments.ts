import { useEffect, useState } from "react";
import { getProviderStats } from "../api/appointments";
import { useAuth } from "../context/AuthContext";

export const PROVIDER_APPOINTMENTS_CHANGED = "provider-appointments-changed";
const REFRESH_INTERVAL_MS = 60_000;

export const notifyProviderAppointmentsChanged = () => {
  window.dispatchEvent(new Event(PROVIDER_APPOINTMENTS_CHANGED));
};

export const usePendingAppointments = () => {
  const { user } = useAuth();
  const isProvider = user?.role?.toUpperCase() === "PROVIDER";
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isProvider) return;
    let isCurrent = true;

    const refresh = async () => {
      try {
        const stats = await getProviderStats();
        if (isCurrent) setPendingCount(stats.pendingCount);
      } catch {
        return;
      }
    };

    void refresh();
    const intervalId = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    const handleFocus = () => void refresh();
    window.addEventListener("focus", handleFocus);
    window.addEventListener(PROVIDER_APPOINTMENTS_CHANGED, handleFocus);

    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(PROVIDER_APPOINTMENTS_CHANGED, handleFocus);
    };
  }, [isProvider]);

  return isProvider ? pendingCount : 0;
};
