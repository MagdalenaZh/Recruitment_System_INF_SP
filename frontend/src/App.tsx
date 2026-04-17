import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./features/auth/pages/LoginPage.tsx";
import RegisterPage from "./features/auth/pages/RegisterPage.tsx";
import LandingPage from "./features/public/pages/LandingPage/LandingPage.tsx";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute.tsx";

import { AccountInboxPage } from "./features/account/pages/AccountInboxPage.tsx";
import { AccountProfilePage } from "./features/account/pages/AccountProfilePage.tsx";
import { AccountLayout } from "./features/account/components/AccountLayout/AccountLayout.tsx";
import { AccountApplicationsPage } from "./features/account/pages/AccountApplicationsPage.tsx";
import { AccountInterviewBookingPage } from "./features/account/pages/AccountInterviewBookingPage.tsx";

import ClubDetailsPage from "./features/clubs/pages/ClubDetailsPage.tsx";
import ApplicationFormPage from "./features/applications/pages/ApplicationFormPage.tsx";

import { BoardHomePage } from "./features/board/pages/BoardHomePage.tsx";
import { BoardDepartmentApplicationsPage } from "./features/board/pages/BoardDepartmentApplicationsPage.tsx";
import { BoardApplicationDetailPage } from "./features/board/pages/BoardApplicationDetailPage.tsx";
import { BoardInterviewsHomePage } from "./features/board/pages/BoardInterviewsHomePage.tsx";

import { ClubAdminHomePage } from "./features/clubAdmin/pages/ClubAdminHomePage.tsx";
import { ClubAdminApplicationDetailPage } from "./features/clubAdmin/pages/ClubAdminApplicationDetailPage.tsx";
import { ClubAdminClubInfoPage } from "./features/clubAdmin/pages/ClubAdminClubInfoPage.tsx";
import { ClubAdminApplicationManagementPage } from "./features/clubAdmin/pages/ClubAdminApplicationManagementPage.tsx";
import { ClubAdminInterviewSlotsPage } from "./features/clubAdmin/pages/ClubAdminInterviewSlotsPage.tsx";
import { ClubAdminFinalDecisionsPage } from "./features/clubAdmin/pages/ClubAdminFinalDecisionsPage.tsx";

import { SystemAdminLayout } from "./features/sysAdmin/pages/SystemAdminLayout.tsx";
import { SystemAdminDashboardPage } from "./features/sysAdmin/pages/SystemAdminDashboardPage.tsx";
import { SystemAdminClubsPage } from "./features/sysAdmin/pages/SystemAdminClubsPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/account"
        element={
          <ProtectedRoute section="profile">
            <AccountLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AccountProfilePage />} />
        <Route path="inbox" element={<AccountInboxPage />} />
        <Route
          path="applications"
          element={
            <ProtectedRoute section="applicantTools">
              <AccountApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="interview-booking"
          element={
            <ProtectedRoute section="applicantTools">
              <AccountInterviewBookingPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
      <Route
        path="/clubs/:clubId/apply"
        element={
          <ProtectedRoute section="applicantTools">
            <ApplicationFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/board"
        element={
          <ProtectedRoute section="board">
            <BoardHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/departments/:departmentId/applications"
        element={
          <ProtectedRoute section="board">
            <BoardDepartmentApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/applications/:applicationId"
        element={
          <ProtectedRoute section="board">
            <BoardApplicationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/interviews"
        element={
          <ProtectedRoute section="board">
            <BoardInterviewsHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club-admin"
        element={
          <ProtectedRoute section="clubAdmin">
            <ClubAdminHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/applications"
        element={
          <ProtectedRoute section="clubAdmin">
            <Navigate to="/board" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/applications/:applicationId"
        element={
          <ProtectedRoute section="clubAdmin">
            <ClubAdminApplicationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/club-info"
        element={
          <ProtectedRoute section="clubAdmin">
            <ClubAdminClubInfoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/interview-slots"
        element={
          <ProtectedRoute section="clubAdmin">
            <ClubAdminInterviewSlotsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/final-decisions"
        element={
          <ProtectedRoute section="clubAdmin">
            <ClubAdminFinalDecisionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/application-management"
        element={
          <ProtectedRoute section="clubAdmin">
            <ClubAdminApplicationManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sys-admin"
        element={
          <ProtectedRoute section="systemAdmin">
            <SystemAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SystemAdminDashboardPage />} />
        <Route path="clubs" element={<SystemAdminClubsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
