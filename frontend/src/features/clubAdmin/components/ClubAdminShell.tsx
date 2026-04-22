import type { ReactNode } from "react";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Footer } from "../../../components/layout/Footer";

export function ClubAdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#172554_45%,#0f172a_100%)]">
      <Navbar />

      <main className="flex-1 mt-10 pb-10">{children}</main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
