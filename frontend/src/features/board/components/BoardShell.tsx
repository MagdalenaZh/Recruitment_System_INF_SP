import type { ReactNode } from "react";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Footer } from "../../../components/layout/Footer";

type Props = {
  children: ReactNode;
  className?: string;
  showNavbar?: boolean;
};

export function BoardShell({
  children,
  className = "",
  showNavbar = true,
}: Props) {
  return (
    <div
      className={`flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_35%,#f8fafc_100%)] text-slate-900 ${className}`}
    >
      {showNavbar ? <Navbar tone="light" /> : null}
      <main className="flex-1">{children}</main>
      <Footer tone="light" />
    </div>
  );
}
