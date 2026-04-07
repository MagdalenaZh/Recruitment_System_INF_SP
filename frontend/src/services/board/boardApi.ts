import type { BoardVote } from "../../features/board/types/boardTypes";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

const RECRUITMENT_INFO_BASE = `${API_BASE}/api/recruitmentInfo/api`;

function buildHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    console.error("[boardApi] request failed:", text);
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(padded);

    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function resolveCurrentBoardClubId(): string | null {
  const clubId = localStorage.getItem("clubId");

  if (clubId) {
    console.log(
      '[boardApi] resolved clubId from localStorage key "clubId":',
      clubId,
    );
    return clubId;
  }

  console.warn("[boardApi] no clubId found in localStorage");
  return null;
}

export function resolveCurrentUserId(): string | null {
  const directUserId = localStorage.getItem("userId");
  if (directUserId) {
    console.log('[boardApi] resolved userId from localStorage key "userId":', directUserId);
    return directUserId;
  }

  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.warn("[boardApi] no auth_token found while resolving userId");
    return null;
  }

  const payload = decodeJwtPayload(token);
  const userId =
    typeof payload?.sub === "string"
      ? payload.sub
      : typeof payload?.nameid === "string"
        ? payload.nameid
        : typeof payload?.userId === "string"
          ? payload.userId
          : null;

  if (userId) {
    console.log("[boardApi] resolved userId from auth token:", userId);
    return userId;
  }

  console.warn("[boardApi] could not resolve userId from auth token");
  return null;
}

export function getApplicationUpdatesUrl(): string {
  return `${API_BASE}/AplicationUpdates`;
}

export type RecruitmentDepartmentDto = {
  clubId: string;
  departmentId: string;
  departmentName: string;
  description: string;
  numberOfOpenPositions: number;
};

export type RecruitmentApplicationDto = {
  applicationId: string;
  applicationStatus: number;
  departmentId: string;
  questionnaire: Record<string, string>;
  userId: string;
};

export const boardApi = {
  async getDepartmentsByClub(
    clubId: string,
  ): Promise<RecruitmentDepartmentDto[]> {
    const url = `${RECRUITMENT_INFO_BASE}/departments-club/${clubId}`;
    console.log("[boardApi] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
    });

    return handleResponse<RecruitmentDepartmentDto[]>(response);
  },

  async getApplicationsByClub(
    clubId: string,
  ): Promise<RecruitmentApplicationDto[]> {
    const url = `${RECRUITMENT_INFO_BASE}/applications-club/${clubId}`;
    console.log("[boardApi] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
    });

    return handleResponse<RecruitmentApplicationDto[]>(response);
  },

  async getApplicationsByDepartment(
    departmentId: string,
  ): Promise<RecruitmentApplicationDto[]> {
    const url = `${RECRUITMENT_INFO_BASE}/applications-department/${departmentId}`;
    console.log("[boardApi] GET", url);

    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
    });

    return handleResponse<RecruitmentApplicationDto[]>(response);
  },

  async approveApplication(applicationId: string): Promise<unknown> {
    const url = `${API_BASE}/api/approve-application/${applicationId}`;
    console.log("[boardApi] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
    });

    return handleResponse<unknown>(response);
  },

  async disapproveApplication(applicationId: string): Promise<unknown> {
    const url = `${API_BASE}/api/disapprove-application/${applicationId}`;
    console.log("[boardApi] POST", url);

    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
    });

    return handleResponse<unknown>(response);
  },

  async voteOnApplication(
    applicationId: string,
    decision: BoardVote,
  ): Promise<unknown> {
    console.log("[boardApi] voteOnApplication", { applicationId, decision });

    if (decision === "Approve") {
      return this.approveApplication(applicationId);
    }

    return this.disapproveApplication(applicationId);
  },
};