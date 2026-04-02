import { Link } from "react-router-dom";
import type { ClubListItem } from "../../../../types/clubs/club";

type Props = {
  club: ClubListItem;
};

export function ClubCard({ club }: Props) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">
          {club.clubName}
        </h3>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {club.category}
        </span>
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
        {club.description}
      </p>

      <div className="mt-6">
        <Link
          to={`/clubs/${club.clubId}`}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
