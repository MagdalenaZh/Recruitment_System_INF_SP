import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../pages/auth/AuthContext";
import { useUserProfile } from "../../../pages/account/hooks/useUserProfile";
import { Button } from "../../ui/Button";

export function UserMenu() {
  const nav = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();
  const { profile, loading } = useUserProfile();

  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const email = profile?.email ?? "";

  const initials =
    (firstName[0] ?? "U").toUpperCase() + (lastName[0] ?? "").toUpperCase();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        aria-label="Open user menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl bg-zinc-900/95 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
          <div className="px-4 py-3">
            {loading ? (
              <div className="text-sm text-white/70">Loading...</div>
            ) : (
              <>
                <div className="text-sm font-semibold">
                  {firstName} {lastName}
                </div>
                <div className="mt-1 text-xs text-white/70">{email}</div>
              </>
            )}
          </div>

          <div className="h-px bg-white/10" />

          <div className="p-2 space-y-1">
            <Link
              to="/account"
              className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              My profile
            </Link>

            <Link
              to="/account/applications"
              className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              My applications
            </Link>

            <Link
              to="/account/inbox"
              className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              My inbox
            </Link>

            {(role === "Board" || role === "ClubAdmin" || role === "Admin") && (
              <Link
                to="/account/tasks"
                className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Review tasks
              </Link>
            )}

            {role === "ClubAdmin" && (
              <Link
                to="/account/club"
                className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Club panel
              </Link>
            )}

            <div className="my-2 h-px bg-white/10" />

            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                setOpen(false);
                logout();
                nav("/login");
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
