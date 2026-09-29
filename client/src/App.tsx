import "./App.scss";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage/HomePage";
import { DoctorProfilePage } from "./pages/DoctorPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export const App = () => (
  <div className="App">
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" index element={<HomePage />} />
        <Route path="/doctors/:id" element={<DoctorProfilePage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  </div>
);
