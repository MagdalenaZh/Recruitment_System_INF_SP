import type { ReactNode } from "react";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Footer } from "../../../components/layout/Footer";

type Props = {
  children: ReactNode;
  className?: string;
};

export function BoardShell({ children, className = "" }: Props) {
  return (
    <div
      className={`min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_35%,#f8fafc_100%)] text-slate-900 ${className}`}
    >
      <Navbar tone="light" />
      {children}
      <Footer />
    </div>
  );
}
