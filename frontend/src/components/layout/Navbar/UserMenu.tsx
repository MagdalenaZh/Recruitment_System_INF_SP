import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../pages/auth/AuthContext";
import { Button } from "../../ui/Button";

function getInitials(email?: string | null) {
  if (!email) return "U";
  return email.slice(0, 1).toUpperCase();
}

export function UserMenu() {
  const nav = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20 hover:bg-white/20"
        aria-label="Open user menu"
      >
        {getInitials(null)}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-zinc-900/95 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
          <div className="px-4 py-3">
            <div className="text-sm font-semibold">Account</div>
            <div className="mt-1 text-xs text-white/70">
              {role ? `Role: ${role}` : "Signed in"}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="p-2">
            <Link
              to="/account"
              className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Profile & settings
            </Link>

            <Link
              to="/account/applications"
              className="block rounded-xl px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              My applications
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

            <div className="my-1 h-px bg-white/10" />

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
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
