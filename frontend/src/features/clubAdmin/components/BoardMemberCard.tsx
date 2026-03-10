// src/features/clubAdmin/components/BoardMemberCard.tsx
import type { BoardMember } from "../types/clubAdminTypes";

export function BoardMemberCard({ member }: { member: BoardMember }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur shadow-sm">
      <h3 className="text-lg font-semibold text-white">
        {member.firstName} {member.lastName}
      </h3>
      <p className="mt-1 text-sm text-slate-300">{member.email}</p>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-200">
          Assigned departments
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {member.assignedDepartments.map((dep) => (
            <span
              key={dep}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200"
            >
              {dep}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20">
          Assign
        </button>
        <button className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20">
          Edit assignments
        </button>
      </div>
    </div>
  );
}
