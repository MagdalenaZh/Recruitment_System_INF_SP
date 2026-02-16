import { Link } from "react-router-dom";
import type { Club } from "../../types/club";
import { ClubStatusBadge } from "./ClubStatusBadge";

export function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      to={`/clubs/${club.clubId}`}
      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700">
            {club.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{club.shortDescription}</p>
        </div>
        <ClubStatusBadge isRecruiting={club.isRecruiting} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500">
          {club.category}
        </span>
        <span className="text-xs font-medium text-blue-700">View club →</span>
      </div>
    </Link>
  );
}
