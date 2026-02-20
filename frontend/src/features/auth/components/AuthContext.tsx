import React, { createContext, useContext, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token"),
  );
  const [role, setRole] = useState<string | null>(() =>
    localStorage.getItem("auth_role"),
  );

  const value = useMemo<AuthState>(() => {
    return {
      token,
      role,
      isAuthenticated: !!token,
      login: (t, r) => {
        localStorage.setItem("auth_token", t);
        localStorage.setItem("auth_role", r);
        setToken(t);
        setRole(r);
      },
      logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
        setToken(null);
        setRole(null);
      },
    };
  }, [token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
