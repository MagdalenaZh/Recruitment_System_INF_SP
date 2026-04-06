import type {
  UserApplicationDto,
  ClubDto,
  DepartmentDto,
} from "../../types/account/accountApplications";
import { getAuthToken, getStoredUserId } from "../auth/auth.api";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

async function apiFetch<T>(url: string): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed.");
  }

  return response.json() as Promise<T>;
}

export async function getApplicationsForCurrentUser(): Promise<UserApplicationDto[]> {
  const userId = getStoredUserId();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  return apiFetch<UserApplicationDto[]>(
    `/api/recruitmentInfo/api/applications-user/${userId}`,
  );
}

export async function getAllClubs(): Promise<ClubDto[]> {
  return apiFetch<ClubDto[]>(`/api/recruitmentInfo/api/clubs`);
}

export async function getDepartmentsForClub(
  clubId: string,
): Promise<DepartmentDto[]> {
  return apiFetch<DepartmentDto[]>(
    `/api/recruitmentInfo/api/departments-club/${clubId}`,
  );
}