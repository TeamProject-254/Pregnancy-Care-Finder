import "./App.scss";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage/HomePage";
import { DoctorProfilePage } from "./pages/DoctorPage";
import { LoginPage } from "./pages/LoginPage";

export const App = () => (
  <div className="App">
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" index element={<HomePage />} />
        <Route path="/doctors/:id" element={<DoctorProfilePage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </div>
);
