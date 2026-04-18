import { Outlet } from "react-router-dom";
import { SysAdminProvider } from "../context/SysAdminContext";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Footer } from "../../../components/layout/Footer";

export function SystemAdminLayout() {
  return (
    <SysAdminProvider>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 text-white">
        <Navbar />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute left-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-[-8rem] right-1/4 h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-3xl uppercase tracking-[0.28em] text-sky-200/70">
              System Administration
            </p>
          </div>

          <Outlet />
        </div>

        <Footer />
      </div>
    </SysAdminProvider>
  );
}
