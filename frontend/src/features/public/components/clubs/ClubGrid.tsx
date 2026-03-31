import type { ClubListItem } from "../../../../types/clubs/club";
import { ClubCard } from "./ClubCard";

export function ClubGrid({ clubs }: { clubs: ClubListItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {clubs.map((c) => (
        <ClubCard key={c.clubId} club={c} />
      ))}
    </div>
  );
}
