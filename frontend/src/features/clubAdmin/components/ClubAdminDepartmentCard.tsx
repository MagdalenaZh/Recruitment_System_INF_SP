import { Link } from "react-router-dom";
import type { ClubAdminDepartment } from "../types/clubAdminTypes";

export function ClubAdminDepartmentCard({ d }: { d: ClubAdminDepartment }) {
  return (
    <Link
      to={`/club-admin/applications/departments/${d.id}`}
      className="block rounded-3xl border border-white/10 bg-white/10 p-5 shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{d.name}</h3>
          <p className="mt-2 text-sm text-slate-300">
            Total applications:{" "}
            <span className="font-medium text-white">
              {d.totalApplications}
            </span>
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
          {d.pendingApplications} pending
        </div>
      </div>

      <div className="mt-5 text-sm text-blue-200">Review department →</div>
    </Link>
  );
}
