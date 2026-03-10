import type { ReactNode } from "react";
import { Navbar } from "../../../components/layout/Navbar/Navbar";

export function ClubAdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#172554_45%,#0f172a_100%)]">
      <Navbar />

      <div className="pt-28 pb-10">{children}</div>
    </div>
  );
}
