import { Link } from "react-router-dom";
import type { BoardMember } from "../types/clubAdminTypes";

export function BoardMemberAssignmentCard({ member }: { member: BoardMember }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md shadow-lg">
      <h3 className="text-lg font-semibold text-white">
        {member.firstName} {member.lastName}
      </h3>

      <p className="mt-1 text-sm text-slate-300">{member.email}</p>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-200">
          Current department assignments
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {member.assignedDepartments.length > 0 ? (
            member.assignedDepartments.map((dep) => (
              <span
                key={dep}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200"
              >
                {dep}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">
              No departments assigned
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/club-admin/board-members/${member.id}/assign`}
          className="inline-flex rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          Assign departments
        </Link>
      </div>
    </div>
  );
}
