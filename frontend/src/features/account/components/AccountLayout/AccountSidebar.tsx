import { NavLink } from "react-router-dom";
import { useAuth } from "../../../auth/components/AuthContext";
import { normalizeRole } from "../../../../types/account/roles";
import { useAccountNav } from "../../hooks/useAccountNav";
import { useUserProfile } from "../../hooks/useUserProfile";

function cx({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

export function AccountSidebar() {
  const { role } = useAuth();
  const normalized = normalizeRole(role);

  const sections = useAccountNav(normalized);

  const { profile, loading } = useUserProfile();

  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const email = profile?.email ?? "";

  const initials =
    (firstName[0] ?? "U").toUpperCase() + (lastName[0] ?? "").toUpperCase();

  return (
    <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white text-sm font-semibold">
          {initials}
        </div>

        <div className="min-w-0">
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : (
            <>
              <div className="truncate text-sm font-semibold text-slate-900">
                {firstName} {lastName}
              </div>
              <div className="truncate text-xs text-slate-500">{email}</div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {sections.map((section) => (
          <div key={section.title ?? "section"}>
            {section.title && (
              <div className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {section.title}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.key} to={item.to} className={cx} end>
                  <span className="truncate">{item.label}</span>
                  <span className="text-slate-400">›</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
