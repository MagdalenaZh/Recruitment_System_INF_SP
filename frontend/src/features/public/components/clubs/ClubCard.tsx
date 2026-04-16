import { Link } from "react-router-dom";
import type { ClubListItem } from "../../../../types/clubs/club";
import { getClubLogo } from "./logoMap";

type Props = {
  club: ClubListItem;
};

export function ClubCard({ club }: Props) {
  const logoLabel = club.clubName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const logoSrc = getClubLogo(club.clubName);

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-[28px]",
        "border border-slate-200 bg-white",
        "shadow-[0_18px_45px_-30px_rgba(15,23,42,0.16)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-blue-200",
        "hover:shadow-[0_24px_60px_-32px_rgba(37,99,235,0.18)]",
      ].join(" ")}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {club.category}
          </span>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden  transition-colors duration-300 group-hover:border-blue-100 group-hover:bg-blue-50">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`${club.clubName} logo`}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-sm font-bold tracking-[0.18em] text-slate-700">
                {logoLabel || "CL"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-1">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
            {club.clubName}
          </h3>

          <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
            {club.description}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 px-6 py-4">
        <Link
          to={`/clubs/${club.clubId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 transition-colors duration-300 hover:text-blue-800"
        >
          View details
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
