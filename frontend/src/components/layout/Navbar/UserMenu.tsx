import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { useUserProfile } from "../../../features/account/hooks/useUserProfile";
import { Button } from "../../ui/Button";

type MenuItem = {
  label: string;
  to: string;
  showDot?: boolean;
};

function getMenuItems(
  role: string | null | undefined,
  hasApplicationUpdates: boolean,
): MenuItem[] {
  if (role === "BoardMember") {
    return [
      { label: "My Profile", to: "/account" },
      { label: "Club Applications", to: "/board" },
      { label: "Interview Stage", to: "/board/interviews" },
    ];
  }

  if (role === "Admin") {
    return [
      { label: "My Profile", to: "/account" },
      { label: "System Admin", to: "/sys-admin" },
    ];
  }

  if (role === "ClubAdmin") {
    return [
      { label: "My Profile", to: "/account" },
      { label: "Club Applications", to: "/board" },
      { label: "Interview Stage", to: "/board/interviews" },
      { label: "Manage Club", to: "/club-admin" },
    ];
  }

  // Default: regular User / Applicant
  return [
    { label: "My Profile", to: "/account" },
    {
      label: "My Applications",
      to: "/account/applications",
      showDot: hasApplicationUpdates,
    },
  ];
}

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

  const hasApplicationUpdates =
    isAuthenticated &&
    role !== "BoardMember" &&
    role !== "ClubAdmin" &&
    role !== "Admin";

  const menuItems = getMenuItems(role, hasApplicationUpdates);

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
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl bg-zinc-900/95 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
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
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                {item.showDot ? (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                ) : null}
              </Link>
            ))}

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
