import type { ApplicationStatus } from "../types/boardTypes";

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";

  const styles: Record<ApplicationStatus, string> = {
    Pending: "border-slate-300 text-slate-700 bg-white",
    Approved: "border-emerald-200 text-emerald-700 bg-emerald-50",
    Rejected: "border-rose-200 text-rose-700 bg-rose-50",
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}
