import type {
  UserApplicationDto,
  ClubDto,
  DepartmentDto,
} from "../../types/account/accountApplications";
import type { LatestApplicationStateResponse } from "./applicationStateTypes";
import { getAuthToken, getStoredUserId } from "../auth/auth.api";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

function buildHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(additionalHeaders ?? {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(options?.headers),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getApplicationsForCurrentUser(): Promise<UserApplicationDto[]> {
  const userId = getStoredUserId();

  if (!userId) {
    throw new Error("Missing user id.");
  }

  return request<UserApplicationDto[]>(
    `/api/recruitmentInfo/api/applications-user/${userId}`,
  );
}

export async function getLatestApplicationStates(
  applicationIds: string[],
): Promise<LatestApplicationStateResponse[]> {
  if (applicationIds.length === 0) {
    return [];
  }

  return request<LatestApplicationStateResponse[]>(
    `/api/recruitmentInfo/api/latest-application-states`,
    {
      method: "GET",
      headers: {
        applicationIds: applicationIds.join(","),
      },
    },
  );
}

export async function getAllClubs(): Promise<ClubDto[]> {
  return request<ClubDto[]>(`/api/recruitmentInfo/api/clubs`);
}

export async function getDepartmentsForClub(
  clubId: string,
): Promise<DepartmentDto[]> {
  return request<DepartmentDto[]>(
    `/api/recruitmentInfo/api/departments-club/${clubId}`,
  );
}
