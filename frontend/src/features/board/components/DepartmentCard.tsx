import { Link } from "react-router-dom";
import type { BoardDepartment } from "../types/boardTypes";

export function DepartmentCard({ d }: { d: BoardDepartment }) {
  return (
    <Link
      to={`/board/departments/${d.id}/applications`}
      className={[
        "group relative block overflow-hidden rounded-2xl",
        "bg-white/5 backdrop-blur-md",
        "border border-white/10",
        "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-white/20 hover:bg-white/8",
        "hover:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.75)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-0",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative p-6">
        <div className="flex h-25 items-start justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-white/95">{d.name}</h3>

            <p className="mt-2 text-sm text-slate-300">
              Total applications:{" "}
              <span className="font-semibold text-white/90">
                {d.totalApplications}
              </span>
            </p>
          </div>

          <div className="shrink-0">
            <div
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                "border border-white/10 bg-white/10 text-white/90",
                "transition-colors duration-300",
                "group-hover:border-white/20 group-hover:bg-white/15",
              ].join(" ")}
            >
              {d.pendingApplications} pending
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-2 text-sm text-slate-300">
          <span className="transition-colors duration-300 group-hover:text-white/90">
            Click to review applications
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
