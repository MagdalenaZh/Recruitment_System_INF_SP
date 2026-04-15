import { normalizeRole, type UserRole } from "../../../types/account/roles";

export type AppSection =
  | "profile"
  | "applicantTools"
  | "apply"
  | "board"
  | "clubAdmin"
  | "systemAdmin";

export function getNormalizedUserRole(role: string | null | undefined): UserRole {
  if (role === "Admin") return "SystemAdmin";
  return normalizeRole(role);
}

export function canAccessSection(
  role: string | null | undefined,
  section: AppSection,
): boolean {
  const normalizedRole = getNormalizedUserRole(role);

  if (section === "profile") {
    return true;
  }

  if (section === "applicantTools") {
    return normalizedRole === "User" || normalizedRole === "Applicant";
  }

  if (section === "board") {
    return normalizedRole === "BoardMember" || normalizedRole === "ClubAdmin";
  }

  if (section === "clubAdmin") {
    return normalizedRole === "ClubAdmin";
  }

  if (section === "systemAdmin") {
    return normalizedRole === "SystemAdmin";
  }

  return normalizedRole === "User" || normalizedRole === "Applicant";
}

export function getDefaultRouteForRole(role: string | null | undefined): string {
  const normalizedRole = getNormalizedUserRole(role);

  if (normalizedRole === "ClubAdmin") return "/club-admin";
  if (normalizedRole === "BoardMember") return "/board";
  if (normalizedRole === "SystemAdmin") return "/sys-admin";
  return "/account";
}
