
import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint =
          user?.role === "PATIENT"
            ? "/patients/profile"
            : "/providers/profile";

        const response = await api.get(endpoint);
        setProfile(response.data);
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>My Profile</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <pre>{JSON.stringify(profile, null, 2)}</pre>

      <button type="button" onClick={logout}>
        Log out
      </button>
    </main>
  );
};