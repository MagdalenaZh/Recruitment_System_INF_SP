import type { AuthUser } from "../../features/auth/types/auth";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUserId(): string | null {
  return getStoredUser()?.userId ?? null;
}

export type CurrentUserResponse = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const stored = getStoredUser();
  if (stored) {
    return {
      email: stored.email,
      firstName: stored.firstName,
      lastName: stored.lastName,
      role: stored.role,
    };
  }

  // Fallback: hit the API if storage is empty for some reason
  const token = getAuthToken();
  if (!token) throw new Error("Missing authentication token.");

  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to load current user.");
  }

  return response.json() as Promise<CurrentUserResponse>;
}
