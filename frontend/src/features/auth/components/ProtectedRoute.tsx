import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { AccessDeniedPage } from "./AccessDeniedPage";
import type { AppSection } from "../utils/routeAuthorization";
import { canAccessSection, getDefaultRouteForRole } from "../utils/routeAuthorization";

type Props = {
  children: ReactElement;
  section?: AppSection;
};

export function ProtectedRoute({ children, section }: Props) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (section && !canAccessSection(role, section)) {
    return (
      <AccessDeniedPage
        message="This page is reserved for a different role. The navigation and route guards are now blocking it so people only see the parts of the system meant for their account."
        backTo={getDefaultRouteForRole(role)}
        backLabel="Open my allowed area"
      />
    );
  }

  return children;
}
