import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./features/auth/pages/LoginPage.tsx";
import RegisterPage from "./features/auth/pages/RegisterPage.tsx";
import LandingPage from "./features/public/pages/LandingPage/LandingPage.tsx";
//import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.tsx";

import { AccountInboxPage } from "./features/account/pages/AccountInboxPage.tsx";
import { AccountProfilePage } from "./features/account/pages/AccountProfilePage.tsx";
import { AccountLayout } from "./features/account/components/AccountLayout/AccountLayout.tsx";
import { AccountApplicationsPage } from "./features/account/pages/AccountApplicationsPage.tsx";

import ClubDetailsPage from "./features/clubs/pages/ClubDetailsPage.tsx";
import ApplicationFormPage from "./features/applications/pages/ApplicationFormPage.tsx";

// BOARD PAGES (new)
import { BoardHomePage } from "./features/board/pages/BoardHomePage.tsx";
import { BoardDepartmentApplicationsPage } from "./features/board/pages/BoardDepartmentApplicationsPage.tsx";
import { BoardApplicationDetailPage } from "./features/board/pages/BoardApplicationDetailPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/home"
        element={
          // Wrap later if you want home to be protected:
          // <ProtectedRoute>
          <LandingPage />
          // </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/account"
        element={
          // <ProtectedRoute>
          <AccountLayout />
          // </ProtectedRoute>
        }
      >
        <Route index element={<AccountProfilePage />} />
        <Route path="inbox" element={<AccountInboxPage />} />
        <Route path="applications" element={<AccountApplicationsPage />} />
      </Route>

      <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
      <Route path="/clubs/:clubId/apply" element={<ApplicationFormPage />} />

      {/* BOARD ROUTES (new) */}
      <Route
        path="/board"
        element={
          // <ProtectedRoute>
          <BoardHomePage />
          // </ProtectedRoute>
        }
      />
      <Route
        path="/board/departments/:departmentId/applications"
        element={
          // <ProtectedRoute>
          <BoardDepartmentApplicationsPage />
          // </ProtectedRoute>
        }
      />
      <Route
        path="/board/applications/:applicationId"
        element={
          // <ProtectedRoute>
          <BoardApplicationDetailPage />
          // </ProtectedRoute>
        }
      />
    </Routes>
  );
}
