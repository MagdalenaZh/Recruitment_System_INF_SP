import type { AuthUser } from "../../features/auth/types/auth";
import { getNormalizedUserRole } from "../../features/auth/utils/routeAuthorization";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
export const AUTH_USER_UPDATED_EVENT = "auth-user-updated";

function normalizeStoredUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;

  const effectiveRole =
    user.adminClubId && user.role !== "SystemAdmin" && user.role !== "Admin"
      ? "ClubAdmin"
      : getNormalizedUserRole(user.role);

  return {
    ...user,
    role: effectiveRole,
  };
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return normalizeStoredUser(JSON.parse(raw) as AuthUser);
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

export function setStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
    return;
  }

  const normalizedUser = normalizeStoredUser(user);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
}

export function mergeStoredUser(
  nextUser: Partial<AuthUser> & Pick<AuthUser, "userId">,
): AuthUser | null {
  const currentUser = getStoredUser();
  if (!currentUser || currentUser.userId !== nextUser.userId) {
    return currentUser;
  }

  const mergedUser = normalizeStoredUser({
    ...currentUser,
    ...nextUser,
  });

  setStoredUser(mergedUser);
  return mergedUser;
}
