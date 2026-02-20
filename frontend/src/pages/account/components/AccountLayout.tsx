import { Outlet } from "react-router-dom";
import { AccountSidebar } from "./AccountSidebar";
import { AccountTopBar } from "./AccountTopBar";

export function AccountLayout() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <AccountSidebar />

          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <AccountTopBar />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
