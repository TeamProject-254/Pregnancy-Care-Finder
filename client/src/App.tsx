import "./App.scss";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage/HomePage";
import { ProviderDashboard } from "./pages/ProviderDashboard";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotFound } from "./pages/NotFoundPage/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage/ResetPasswordPage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { DoctorPage } from "./pages/DoctorPage";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const ProviderRoute = () => {
  const { user } = useAuth();
  return user?.role?.toUpperCase() === "PROVIDER"
    ? <Outlet />
    : <Navigate to="/patient-dashboard" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, registrationPendingConfirmation, user } = useAuth();
  const location = useLocation();
  const showingRegistrationConfirmation =
    location.pathname === "/register" && registrationPendingConfirmation;

  if (isAuthenticated && !showingRegistrationConfirmation) {
    const isProvider = user?.role?.toUpperCase() === "PROVIDER";
    return (
      <Navigate
        to={isProvider ? "/provider-dashboard" : "/patient-dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>

    <Route element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/doctors/:id" element={<DoctorPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<ProviderRoute />}>
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export const App = () => (
  <AuthProvider>
    <div className="App">
      <AppRoutes />
    </div>
  </AuthProvider>
);
