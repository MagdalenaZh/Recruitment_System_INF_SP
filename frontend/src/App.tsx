import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import ClubDetailsPage from "./pages/public/ClubDetailsPage/ClubDetailsPage.tsx";
import LandingPage from "./pages/public/LandingPage/LandingPage.tsx";
import ApplicationFormPage from "./pages/public/ApplicationPage/ApplicationFormPage.tsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute.tsx";
import { AccountApplicationsPage } from "./pages/account/applicant/AccountApplicationsPage.tsx";
import { AccountInboxPage } from "./pages/account/applicant/AccountInboxPage.tsx";
import { AccountProfilePage } from "./pages/account/applicant/AccountProfilePage.tsx";
import { AccountLayout } from "./pages/account/components/AccountLayout.tsx";

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
      {/* Account routes (sidebar persists) */}
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<AccountProfilePage />} />
        <Route path="inbox" element={<AccountInboxPage />} />
        <Route path="applications" element={<AccountApplicationsPage />} />
      </Route>
      <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
      <Route path="/clubs/:clubId/apply" element={<ApplicationFormPage />} />
    </Routes>
  );
}
