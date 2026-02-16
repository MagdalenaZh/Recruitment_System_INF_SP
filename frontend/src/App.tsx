import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import ClubDetailsPage from "./pages/public/ClubDetailsPage/ClubDetailsPage.tsx";
import LandingPage from "./pages/public/LandingPage/LandingPage.tsx";
import { Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
      <Route
        path="/clubs/:clubId/apply"
        element={<div>Application form (later)</div>}
      />
    </Routes>
  );
}
