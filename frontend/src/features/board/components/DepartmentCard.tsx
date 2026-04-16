import { Link } from "react-router-dom";
import type { BoardDepartment } from "../types/boardTypes";

export function DepartmentCard({ d }: { d: BoardDepartment }) {
  return (
    <Link
      to={`/board/departments/${d.departmentId}/applications`}
      className={[
        "group relative block overflow-hidden rounded-[28px]",
        "border border-slate-200/80 bg-white/95 backdrop-blur",
        "shadow-[0_20px_50px_-35px_rgba(15,23,42,0.28)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-blue-200",
        "hover:shadow-[0_30px_70px_-35px_rgba(37,99,235,0.18)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Department
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {d.departmentName}
            </h3>
          </div>

          <div className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {d.pendingCount} pending
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="flex min-h-[88px] flex-col px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total applications
            </div>
            <div className="mt-auto text-lg font-bold leading-none text-slate-900">
              {d.totalApplicants}
            </div>
          </div>

          <div className="flex min-h-[88px] flex-col  px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Open positions
            </div>
            <div className="mt-auto text-lg font-bold leading-none text-slate-900">
              {d.targetSpots}
            </div>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Approved
            </div>
            <div className="mt-1 text-lg font-bold text-emerald-700">
              {d.approvedCount}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-rose-700">
              Rejected
            </div>
            <div className="mt-1 text-lg font-bold text-rose-700">
              {d.rejectedCount}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 transition-all duration-300 group-hover:text-blue-800">
            Review applications
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
