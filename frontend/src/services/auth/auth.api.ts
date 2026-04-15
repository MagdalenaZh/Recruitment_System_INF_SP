import type { AuthUser } from "../../features/auth/types/auth";

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
