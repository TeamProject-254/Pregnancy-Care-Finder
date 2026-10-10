import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../api/axios";

export type UserRole = "PATIENT" | "PROVIDER";

interface User {
  userId: number;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  registrationPendingConfirmation: boolean;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    role: UserRole,
    termsAccepted: boolean,
  ) => Promise<void>;
  completeRegistration: () => void;
  login: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [registrationPendingConfirmation, setRegistrationPendingConfirmation] = useState(false);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    const response = await api.post("/auth/login", {
      email,
      password,
      rememberMe,
    });

    const data = response.data;

    const loggedUser: User = {
      userId: data.userId,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(loggedUser));

    setUser(loggedUser);
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    role: UserRole,
    termsAccepted: boolean
  ) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      confirmPassword,
      role,
      termsAccepted,
    });

    const data = response.data;

    const loggedUser: User = {
      userId: data.userId,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(loggedUser));

    setUser(loggedUser);
    setRegistrationPendingConfirmation(true);
  };

  const completeRegistration = () => {
    setRegistrationPendingConfirmation(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("dash_isPublished");
    localStorage.removeItem("dash_isEditing");
    localStorage.removeItem("dash_speciality");
    localStorage.removeItem("dash_languages");
    localStorage.removeItem("dash_description");
    localStorage.removeItem("dash_photo");
    if (user?.userId) {
      localStorage.removeItem(`provider-profile:${user.userId}:draft`);
    }

    setUser(null);
    setRegistrationPendingConfirmation(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        registrationPendingConfirmation,
        register,
        completeRegistration,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};