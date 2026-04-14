import type {
  BookInterviewSlotRequest,
  InterviewSlot,
  UserApplication,
} from "../types/interviewTypes";

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!rawApiUrl) {
  throw new Error("VITE_API_URL is missing from the frontend environment.");
}

const API_URL = rawApiUrl.replace(/\/+$/, "");

function buildHeaders(includeAuth = true): HeadersInit {
  const token = localStorage.getItem("auth_token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      const message =
        data?.message ||
        data?.error ||
        data?.title ||
        JSON.stringify(data);

      throw new Error(message || "Request failed");
    }

    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function getApplicationsForUser(
  userId: string
): Promise<UserApplication[]> {
  const res = await fetch(
    `${API_URL}/api/recruitmentInfo/api/applications-user/${userId}`,
    {
      method: "GET",
      headers: buildHeaders(true),
    }
  );

  return handleResponse<UserApplication[]>(res);
}

export async function getAvailableInterviewSlotsForClub(
  clubId: string
): Promise<InterviewSlot[]> {
  const res = await fetch(
    `${API_URL}/api/recruitmentInfo/api/available-interview-slots/${clubId}`,
    {
      method: "GET",
      headers: buildHeaders(true),
    }
  );

  return handleResponse<InterviewSlot[]>(res);
}

export async function bookInterviewSlot(
  payload: BookInterviewSlotRequest
): Promise<{ message: string }> {
  const res = await fetch(
    `${API_URL}/api/book-interview-slot/${payload.applicationId}`,
    {
      method: "PUT",
      headers: buildHeaders(true),
      body: JSON.stringify(payload.slot),
    }
  );

  return handleResponse<{ message: string }>(res);
}
