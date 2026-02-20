import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import ClubDetailsPage from "./pages/public/ClubDetailsPage/ClubDetailsPage.tsx";
import LandingPage from "./pages/public/LandingPage/LandingPage.tsx";
import ApplicationFormPage from "./pages/public/ApplicationPage/ApplicationFormPage.tsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
      <Route path="/clubs/:clubId/apply" element={<ApplicationFormPage />} />
    </Routes>
  );
}
