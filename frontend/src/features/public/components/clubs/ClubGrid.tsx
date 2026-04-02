import { ClubCard } from "./ClubCard";
import type { ClubListItem } from "../../../../types/clubs/club";

type Props = {
  clubs: ClubListItem[];
};

export function ClubGrid({ clubs }: Props) {
  if (clubs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">No clubs found</h3>
        <p className="mt-2 text-sm text-slate-600">
          Try selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {clubs.map((club) => (
        <ClubCard key={club.clubId} club={club} />
      ))}
    </div>
  );
}
