import "./App.scss";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage/HomePage";
//import { DoctorProfilePage } from "./pages/DoctorPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
//import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotFound } from "./pages/NotFoundPage/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/profile" replace /> : <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route element={<MainLayout />}>
      <Route index element={<HomePage />} />
      {/* <Route path="/doctors/:id" element={<DoctorProfilePage />} /> */}
      <Route path="/search" element={<SearchPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<NotFound />} />
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
