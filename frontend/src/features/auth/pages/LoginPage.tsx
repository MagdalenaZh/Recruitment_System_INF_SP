import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../components/AuthContext";

import type { LoginRequest, LoginResponse } from "../types/auth";

import { apiPost } from "../../../services/api";
import { usePageTitle } from "../../clubs/hooks/usePageTitle";

function isBoardMemberRole(role: string | null | undefined) {
  return role === "BoardMember";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  usePageTitle("Login - AUBG Recruitment System");

  useEffect(() => {
    if (!isAuthenticated) return;

    if (isBoardMemberRole(user?.role)) {
      nav("/board", { replace: true });
      return;
    }

    nav("/home", { replace: true });
  }, [isAuthenticated, user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: LoginRequest = { email, password };

      const res = await apiPost<LoginRequest, LoginResponse>(
        "/api/auth/login",
        payload,
        false,
      );

      console.log("LOGIN RESPONSE:", res);

      login(res);

      if (isBoardMemberRole(res.user.role)) {
        nav("/board", { replace: true });
      } else {
        nav("/account", { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-1 text-sm text-gray-600">
          Sign in to continue to the recruitment system.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              className="mt-1"
              placeholder="you@aubg.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              placeholder="********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          No account?{" "}
          <Link
            to="/register"
            className="font-semibold text-black underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
