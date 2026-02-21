import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./features/auth/pages/LoginPage.tsx";
import RegisterPage from "./features/auth/pages/RegisterPage.tsx";
import LandingPage from "./features/public/pages/LandingPage/LandingPage.tsx";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.tsx";
import { AccountInboxPage } from "./features/account/pages/AccountInboxPage.tsx";
import { AccountProfilePage } from "./features/account/pages/AccountProfilePage.tsx";
import { AccountLayout } from "./features/account/components/AccountLayout/AccountLayout.tsx";
import { AccountApplicationsPage } from "./features/account/pages/AccountApplicationsPage.tsx";
import ClubDetailsPage from "./features/clubs/pages/ClubDetailsPage.tsx";
import ApplicationFormPage from "./features/applications/pages/ApplicationFormPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/home"
        element={
          //otectedRoute>
          <LandingPage />
          //</ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
