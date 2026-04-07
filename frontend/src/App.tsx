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

import { BoardHomePage } from "./features/board/pages/BoardHomePage.tsx";
import { BoardDepartmentApplicationsPage } from "./features/board/pages/BoardDepartmentApplicationsPage.tsx";
import { BoardApplicationDetailPage } from "./features/board/pages/BoardApplicationDetailPage.tsx";
import { BoardInterviewsHomePage } from "./features/board/pages/BoardInterviewsHomePage.tsx";

import { ClubAdminHomePage } from "./features/clubAdmin/pages/ClubAdminHomePage.tsx";
import { ClubAdminApplicationDetailPage } from "./features/clubAdmin/pages/ClubAdminApplicationDetailPage.tsx";
import { ClubAdminClubInfoPage } from "./features/clubAdmin/pages/ClubAdminClubInfoPage.tsx";
import { ClubAdminApplicationManagementPage } from "./features/clubAdmin/pages/ClubAdminApplicationManagementPage.tsx";

import { SystemAdminLayout } from "./features/sysAdmin/pages/SystemAdminLayout.tsx";
import { SystemAdminDashboardPage } from "./features/sysAdmin/pages/SystemAdminDashboardPage.tsx";
import { SystemAdminClubsPage } from "./features/sysAdmin/pages/SystemAdminClubsPage.tsx";
import { SystemAdminClubAdminsPage } from "./features/sysAdmin/pages/SystemAdminClubAdminsPage.tsx";
import { SystemAdminCreateClubAdminsPage } from "./features/sysAdmin/pages/SystemAdminCreateClubAdminsPage.tsx";

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
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AccountProfilePage />} />
        <Route path="inbox" element={<AccountInboxPage />} />
        <Route path="applications" element={<AccountApplicationsPage />} />
      </Route>

      <Route path="/clubs/:clubId" element={<ClubDetailsPage />} />
      <Route
        path="/clubs/:clubId/apply"
        element={
          <ProtectedRoute>
            <ApplicationFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <BoardHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/departments/:departmentId/applications"
        element={
          <ProtectedRoute>
            <BoardDepartmentApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/applications/:applicationId"
        element={
          <ProtectedRoute>
            <BoardApplicationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/interviews"
        element={
          <ProtectedRoute>
            <BoardInterviewsHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club-admin"
        element={
          <ProtectedRoute>
            <ClubAdminHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/applications"
        element={
          <ProtectedRoute>
            <BoardDepartmentApplicationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club-admin/applications/:applicationId"
        element={
          <ProtectedRoute>
            <ClubAdminApplicationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/club-info"
        element={
          <ProtectedRoute>
            <ClubAdminClubInfoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-admin/application-management"
        element={
          <ProtectedRoute>
            <ClubAdminApplicationManagementPage />
          </ProtectedRoute>
        }
      />

      {/*
        Keep this only if you still want the page around.
        It is not part of the current club-admin scope you described.
      */}

      <Route
        path="/sys-admin"
        element={
          <ProtectedRoute>
            <SystemAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SystemAdminDashboardPage />} />
        <Route path="clubs" element={<SystemAdminClubsPage />} />
        <Route
          path="create-club-admins"
          element={<SystemAdminCreateClubAdminsPage />}
        />
        <Route path="club-admins" element={<SystemAdminClubAdminsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
