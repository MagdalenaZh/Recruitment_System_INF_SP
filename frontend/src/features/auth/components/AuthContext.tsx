import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_USER_UPDATED_EVENT,
  getStoredUser,
  setStoredUser,
} from "../../../services/auth/auth.api";
import { getCurrentUser } from "../../../services/account/accountApi";
import type { AuthUser, LoginResponse } from "../types/auth";
import { getNormalizedUserRole } from "../utils/routeAuthorization";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "auth_token";

function normalizeAuthUser(user: AuthUser | null): AuthUser | null {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredUser();
  });

  useEffect(() => {
    function syncStoredAuthUser() {
      setUser(getStoredUser());
    }

    window.addEventListener("storage", syncStoredAuthUser);
    window.addEventListener(AUTH_USER_UPDATED_EVENT, syncStoredAuthUser);

    return () => {
      window.removeEventListener("storage", syncStoredAuthUser);
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, syncStoredAuthUser);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return;

        const normalizedUser = normalizeAuthUser({
          userId: currentUser.userId,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role,
          departmentId: currentUser.departmentId ?? null,
          clubId: currentUser.clubId ?? null,
          adminClubId: currentUser.adminClubId ?? null,
        });

        setStoredUser(normalizedUser);
        setUser(normalizedUser);
      })
      .catch(() => {
        // Keep the existing session state if the refresh fails.
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo<AuthState>(() => {
    return {
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: !!token,
      login: (data) => {
        const normalizedUser = normalizeAuthUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        setStoredUser(normalizedUser);
        setToken(data.token);
        setUser(normalizedUser);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        setStoredUser(null);
        setToken(null);
        setUser(null);
      },
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
