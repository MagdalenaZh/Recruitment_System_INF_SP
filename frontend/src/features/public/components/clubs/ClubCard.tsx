import { Link } from "react-router-dom";
import type { ClubListItem } from "../../../../types/clubs/club";

export function ClubCard({ club }: { club: ClubListItem }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col h-[200px]">
      <Link
        to={`/clubs/${club.clubId}`}
        state={{ club }}
        className="block group flex-1 min-h-0"
      >
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700">
          {club.clubName}
        </h3>
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
          {club.description || "No description yet."}
        </p>
      </Link>

      <div className="flex items-center justify-end border-t border-slate-100 pt-3 shrink-0">
        <Link
          to={`/clubs/${club.clubId}`}
          state={{ club }}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          View club →
        </Link>
      </div>
    </div>
  );
}
