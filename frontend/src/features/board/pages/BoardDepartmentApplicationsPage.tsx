import { Link, useParams } from "react-router-dom";
import { ApplicationStackList } from "../components/ApplicationStackList";
import { useDepartmentApplications } from "../hooks/useDepartmentApplications";
import type { ApplicationStatus } from "../types/boardTypes";
import { BoardShell } from "../components/BoardShell";

export function BoardDepartmentApplicationsPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const {
    filtered,
    departmentName,
    loading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
  } = useDepartmentApplications(departmentId);

  return (
    <BoardShell className="relative" showNavbar={false}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-56 left-[-12rem] h-[34rem] w-[34rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/board"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              <span className="transition-transform duration-200 hover:-translate-x-0.5">
                ←
              </span>
              Back to departments
            </Link>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              {departmentName}
            </h1>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-blue-100/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-[26rem]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by applicant name or email..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterButton
                label="All"
                active={statusFilter === "All"}
                onClick={() => setStatusFilter("All")}
              />
              <FilterButton
                label="Submitted"
                active={statusFilter === "Submitted"}
                onClick={() => setStatusFilter("Submitted")}
              />
              <FilterButton
                label="Pending"
                active={statusFilter === "Pending"}
                onClick={() => setStatusFilter("Pending")}
              />
              <FilterButton
                label="InterviewPending"
                active={statusFilter === "InterviewPending"}
                onClick={() => setStatusFilter("InterviewPending")}
              />
              <FilterButton
                label="Interview"
                active={statusFilter === "Interview"}
                onClick={() => setStatusFilter("Interview")}
              />
              <FilterButton
                label="FinalReview"
                active={statusFilter === "FinalReview"}
                onClick={() => setStatusFilter("FinalReview")}
              />
              <FilterButton
                label="Approved"
                active={statusFilter === "Approved"}
                onClick={() => setStatusFilter("Approved")}
              />
              <FilterButton
                label="Rejected"
                active={statusFilter === "Rejected"}
                onClick={() => setStatusFilter("Rejected")}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-white/80 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
              Loading applications...
            </div>
          ) : error ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <div className="font-semibold">Could not load applications.</div>
              <div className="mt-2 text-sm">{error}</div>
            </div>
          ) : (
            <ApplicationStackList items={filtered} />
          )}
        </div>
      </div>
    </BoardShell>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: ApplicationStatus | "All";
  active: boolean;
  onClick: () => void;
}) {
  const text =
    label === "InterviewPending"
      ? "Awaiting Booking"
      : label === "FinalReview"
        ? "Final Review"
        : label;

  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-[0_10px_24px_-18px_rgba(37,99,235,0.22)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
      ].join(" ")}
    >
      {text}
    </button>
  );
}
