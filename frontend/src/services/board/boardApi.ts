import { apiGet, API_URL } from "../api";
import { getStoredUser } from "../auth/auth.api";
import type { UserApplicationDto } from "../../types/account/accountApplications";
import type { UserInfoDto, BookedInterviewSlotDto } from "../../types/board/boardApiTypes";
import type { BoardVote } from "../../features/board/types/boardTypes";

function parseJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function resolveCurrentBoardClubId(): string | null {
  const token = localStorage.getItem("auth_token");
  const payload = parseJwtPayload(token);

  if (payload && typeof payload.adminClubId === "string" && payload.adminClubId.length > 0) {
    return payload.adminClubId;
  }

  if (payload && typeof payload.clubId === "string" && payload.clubId.length > 0) {
    return payload.clubId;
  }

  const stored = getStoredUser();
  return stored?.adminClubId ?? stored?.clubId ?? null;
}

export function resolveCurrentUserId(): string | null {
  const userId = getStoredUser()?.userId;
  if (userId) return userId;

  const token = localStorage.getItem("auth_token");
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  return (
    (typeof payload.sub === "string" ? payload.sub : null) ??
    (typeof payload.nameid === "string" ? payload.nameid : null)
  );
}

export function resolveCurrentBoardDepartmentId(): string | null {
  return getStoredUser()?.departmentId ?? null;
}

async function postNoBody(path: string): Promise<void> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
}

export const boardApi = {
  getApplicationsByClub(clubId: string): Promise<UserApplicationDto[]> {
    return apiGet(`/api/recruitmentInfo/api/applications-club/${clubId}`);
  },

  getApplicationsByDepartment(departmentId: string): Promise<UserApplicationDto[]> {
    return apiGet(`/api/recruitmentInfo/api/applications-department/${departmentId}`);
  },

  getUserInformation(userId: string): Promise<UserInfoDto> {
    return apiGet(`/api/recruitmentInfo/api/user-information/${userId}`);
  },

  getBookedInterviewSlots(clubId: string): Promise<BookedInterviewSlotDto[]> {
    return apiGet(`/api/recruitmentInfo/api/booked-interview-slots/${clubId}`);
  },

  approveApplication(applicationId: string): Promise<void> {
    return postNoBody(`/api/approve-application/${applicationId}`);
  },

  disapproveApplication(applicationId: string): Promise<void> {
    return postNoBody(`/api/disapprove-application/${applicationId}`);
  },

  afterInterviewApproveApplication(applicationId: string): Promise<void> {
    return postNoBody(`/api/after-interview-approve-application/${applicationId}`);
  },

  afterInterviewDisapproveApplication(applicationId: string): Promise<void> {
    return postNoBody(`/api/after-interview-disapprove-application/${applicationId}`);
  },

  voteOnApplication(applicationId: string, decision: BoardVote): Promise<void> {
    return decision === "Approve"
      ? this.approveApplication(applicationId)
      : this.disapproveApplication(applicationId);
  },
};
