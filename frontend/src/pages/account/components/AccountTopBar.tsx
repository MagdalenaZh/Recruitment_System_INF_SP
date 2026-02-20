import { useLocation } from "react-router-dom";

function titleFromPath(path: string) {
  if (path.endsWith("/account")) return "Profile";
  if (path.includes("/account/inbox")) return "Inbox";
  if (path.includes("/account/applications")) return "My applications";
  if (path.includes("/account/tasks")) return "Review tasks";
  if (path.includes("/account/club")) return "Club panel";
  return "Account";
}

export function AccountTopBar() {
  const loc = useLocation();

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {titleFromPath(loc.pathname)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, applications, and updates.
        </p>
      </div>
    </div>
  );
}
