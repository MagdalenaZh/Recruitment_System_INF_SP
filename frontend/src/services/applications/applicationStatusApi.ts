// API for application status, clubs, and departments.
// Used by both applicant-facing pages and board member hooks.

import { apiGet } from "../api";
import { getStoredUserId } from "../auth/auth.api";
import type { UserApplicationDto, ClubDto, DepartmentDto } from "../../types/account/accountApplications";
import type { LatestApplicationStateResponse } from "./applicationStateTypes";

// Applications submitted by the currently logged-in user.
export async function getApplicationsForCurrentUser(): Promise<UserApplicationDto[]> {
  const userId = getStoredUserId();
  if (!userId) throw new Error("Missing user id.");
  return apiGet(`/api/recruitmentInfo/api/applications-user/${userId}`);
}

// Latest state snapshots for a list of application IDs.
// The backend expects application IDs as a comma-separated header value.
export async function getLatestApplicationStates(
  applicationIds: string[],
): Promise<LatestApplicationStateResponse[]> {
  if (applicationIds.length === 0) return [];
  return apiGet(
    `/api/recruitmentInfo/api/latest-application-states`,
    true,
    { applicationIds: applicationIds.join(",") },
  );
}

// All clubs in the system.
export async function getAllClubs(): Promise<ClubDto[]> {
  return apiGet(`/api/recruitmentInfo/api/clubs`);
}

// Departments belonging to a specific club.
export async function getDepartmentsForClub(clubId: string): Promise<DepartmentDto[]> {
  return apiGet(`/api/recruitmentInfo/api/departments-club/${clubId}`);
}
