import { Link, useParams } from "react-router-dom";
import { ApplicationStackList } from "../components/ApplicationStackList";
import { useDepartmentApplications } from "../hooks/useDepartmentApplications";
import type { ApplicationStatus } from "../types/boardTypes";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { Navbar } from "../../../components/layout/Navbar/Navbar";

export function BoardDepartmentApplicationsPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const {
    filtered,
    loading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    refetch,
  } = useDepartmentApplications(departmentId);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-56 left-[-12rem] h-[34rem] w-[34rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <Navbar />

      <div className="relative mx-auto max-w-6xl p-4 pt-28 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/board"
              className="mt-20 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <span className="transition-transform duration-200 hover:-translate-x-0.5">
                ←
              </span>
              Back to departments
            </Link>

            <h1 className="mt-6 text-3xl font-semibold text-white/95">
              Applications
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Department ID:{" "}
              <span className="font-semibold text-white/90">
                {departmentId}
              </span>
            </p>
          </div>

          <button
            onClick={refetch}
            className="w-fit rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/15"
          >
            Refresh
          </button>
        </div>

        <BoardSectionNav />

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-[26rem]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by applicant name or email…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition placeholder:text-slate-400 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
              />
              <div className="mt-1 text-xs text-slate-400">
                Debug logs are available in the console if something looks off.
              </div>
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md">
              Loading applications…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-200">
              <div className="font-semibold">Could not load applications.</div>
              <div className="mt-2 text-sm">{error}</div>
            </div>
          ) : (
            <ApplicationStackList items={filtered} />
          )}
        </div>
      </div>
    </div>
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
          ? "border-sky-400/40 bg-sky-400/15 text-white shadow-[0_10px_30px_-18px_rgba(56,189,248,0.35)]"
          : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10",
      ].join(" ")}
    >
      {text}
    </button>
  );
}
