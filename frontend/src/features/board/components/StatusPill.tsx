import type { ApplicationStatus } from "../types/boardTypes";

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";

  const styles: Record<ApplicationStatus, string> = {
    Submitted: "border-sky-100 text-sky-600 bg-sky-50/80",
    Pending: "border-slate-200 text-slate-600 bg-slate-50/80",
    InterviewPending: "border-indigo-100 text-indigo-600 bg-indigo-50/80",
    Interview: "border-violet-100 text-violet-600 bg-violet-50/80",
    FinalReview: "border-fuchsia-100 text-fuchsia-600 bg-fuchsia-50/80",
    Approved: "border-emerald-100 text-emerald-600 bg-emerald-50/80",
    Rejected: "border-rose-100 text-rose-600 bg-rose-50/80",
    Unknown: "border-amber-100 text-amber-600 bg-amber-50/80",
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
