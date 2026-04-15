import type { ReactNode } from "react";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Footer } from "../../../components/layout/Footer";

type Props = {
  children: ReactNode;
  className?: string;
};

export function BoardShell({ children, className = "" }: Props) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 ${className}`}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
