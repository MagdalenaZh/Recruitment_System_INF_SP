import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../../components/ui/Button";

function titleFromPath(path: string) {
  if (path === "/account") return "Profile";
  if (path.includes("/account/inbox")) return "Inbox";
  if (path.includes("/account/applications")) return "My applications";
  if (path.includes("/account/tasks")) return "Review tasks";
  if (path.includes("/account/club")) return "Club panel";
  return "Account";
}

export function AccountTopBar() {
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <div className="text-2xl font-semibold text-slate-900">
            {titleFromPath(loc.pathname)}
          </div>
          <div className="text-sm text-slate-500">
            Manage your profile and applications
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => nav("/home")}
        className="bg-blue-600 hover:bg-blue-700 text-white "
      >
        ← Back to Home
      </Button>
    </div>
  );
}
