import type { UserApplicationResponse, LatestApplicationStateResponse, ClubResponse, DepartmentResponse } from "../../types/account/applicationStatus";
import { getAuthToken, getStoredUserId } from "../auth/auth.api";


const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed.");
  }

  return response.json() as Promise<T>;
}

export async function getApplicationsForCurrentUser(): Promise<UserApplicationResponse[]> {
  const userId = getStoredUserId();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  return request<UserApplicationResponse[]>(
    `/api/recruitmentInfo/api/applications-user/${userId}`,
  );
}

export async function getLatestApplicationStates(
  applicationIds: string[],
): Promise<LatestApplicationStateResponse[]> {
  if (applicationIds.length === 0) return [];

  return request<LatestApplicationStateResponse[]>(
    `/api/recruitmentInfo/api/latest-application-states`,
    {
      method: "POST",
      body: JSON.stringify(applicationIds),
    },
  );
}

export async function getAllClubs(): Promise<ClubResponse[]> {
  return request<ClubResponse[]>(`/api/recruitmentInfo/api/clubs`);
}

export async function getDepartmentsForClub(
  clubId: string,
): Promise<DepartmentResponse[]> {
  return request<DepartmentResponse[]>(
    `/api/recruitmentInfo/api/departments-club/${clubId}`,
  );
}