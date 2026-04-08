import type { ApplicationStatus } from "../types/boardTypes";

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";

  const styles: Record<ApplicationStatus, string> = {
    Submitted: "border-sky-200 text-sky-700 bg-sky-50",
    Pending: "border-slate-300 text-slate-700 bg-white",
    InterviewPending: "border-indigo-200 text-indigo-700 bg-indigo-50",
    Interview: "border-violet-200 text-violet-700 bg-violet-50",
    FinalReview: "border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50",
    Approved: "border-emerald-200 text-emerald-700 bg-emerald-50",
    Rejected: "border-rose-200 text-rose-700 bg-rose-50",
    Unknown: "border-amber-200 text-amber-700 bg-amber-50",
  };

  const labels: Record<ApplicationStatus, string> = {
    Submitted: "Submitted",
    Pending: "Pending",
    InterviewPending: "Awaiting Booking",
    Interview: "Interview",
    FinalReview: "Final Review",
    Approved: "Approved",
    Rejected: "Rejected",
    Unknown: "Unknown",
  };

  return <span className={`${base} ${styles[status]}`}>{labels[status]}</span>;
}
