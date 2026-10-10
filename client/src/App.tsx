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

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, registrationPendingConfirmation, user } = useAuth();
  const location = useLocation();
  const showingRegistrationConfirmation =
    location.pathname === "/register" && registrationPendingConfirmation;

  if (isAuthenticated && !showingRegistrationConfirmation) {
    const isProvider = user?.role?.toUpperCase() === "PROVIDER";
    return <Navigate to={isProvider ? "/provider-dashboard" : "/patient-dashboard"} replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
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