// API for application status, clubs, and departments.
// Used by both applicant-facing pages and board member hooks.

import { apiGet, apiPost } from "../api";
import { getStoredUserId } from "../auth/auth.api";
import type { UserApplicationDto, ClubDto, DepartmentDto } from "../../types/account/accountApplications";
import { parseLatestApplicationStates, type LatestApplicationStateResponse } from "./applicationStateTypes";

const SNAPSHOT_CACHE_STORAGE_KEY_PREFIX = "applicationUpdates:latestSnapshots";

// Applications submitted by the currently logged-in user.
export async function getApplicationsForCurrentUser(): Promise<UserApplicationDto[]> {
  const userId = getStoredUserId();
  if (!userId) throw new Error("Missing user id.");
  return apiGet(`/api/recruitmentInfo/api/applications-user/${userId}`);
}

// Latest state snapshots for a list of application IDs.
export async function getLatestApplicationStates(
  applicationIds: string[],
): Promise<LatestApplicationStateResponse[]> {
  if (applicationIds.length === 0) return [];

  try {
    const response = await apiPost(
      `/api/recruitmentInfo/api/latest-application-states`,
      applicationIds,
    );
    const parsed = parseLatestApplicationStates(response);

    if (parsed.length > 0) {
      cacheLatestStates(parsed);
      return parsed;
    }
  } catch {
    // Fall through to cache fallback below.
  }

  return getCachedLatestStates(applicationIds);
}

export function primeLatestApplicationStates(
  states: LatestApplicationStateResponse[],
): void {
  cacheLatestStates(states);
}

// All clubs in the system.
export async function getAllClubs(): Promise<ClubDto[]> {
  return apiGet(`/api/recruitmentInfo/api/clubs`);
}

// Departments belonging to a specific club.
export async function getDepartmentsForClub(clubId: string): Promise<DepartmentDto[]> {
  return apiGet(`/api/recruitmentInfo/api/departments-club/${clubId}`);
}

function cacheLatestStates(states: LatestApplicationStateResponse[]): void {
  if (states.length === 0) return;

  try {
    const cacheKey = getSnapshotCacheStorageKey();
    const current = readSnapshotCache();
    for (const state of states) {
      current[state.applicationId] = state;
    }
    window.localStorage.setItem(cacheKey, JSON.stringify(current));
  } catch {
    // Ignore cache write errors.
  }
}

function getCachedLatestStates(applicationIds: string[]): LatestApplicationStateResponse[] {
  const cache = readSnapshotCache();
  return applicationIds
    .map((applicationId) => cache[applicationId])
    .filter((value): value is LatestApplicationStateResponse => value !== undefined);
}

function readSnapshotCache(): Record<string, LatestApplicationStateResponse> {
  try {
    const raw = window.localStorage.getItem(getSnapshotCacheStorageKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, LatestApplicationStateResponse>;
  } catch {
    return {};
  }
}

function getSnapshotCacheStorageKey(): string {
  const userId = getStoredUserId() ?? "anonymous";
  return `${SNAPSHOT_CACHE_STORAGE_KEY_PREFIX}:${userId}`;
}
