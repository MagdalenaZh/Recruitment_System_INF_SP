import { Outlet } from "react-router-dom";
import { AccountSidebar } from "./AccountSidebar";
import { AccountTopBar } from "./AccountTopBar";

export function AccountLayout() {
  return (
    // pt-24 to avoid your fixed Navbar overlapping
    <div className="min-h-screen bg-slate-50 pt-24">
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Sidebar always visible */}
          <AccountSidebar />

          {/* Right content */}
          <div className="min-w-0">
            <AccountTopBar />
            <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
