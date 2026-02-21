import { Chip } from "../../../../components/ui/Chip";

import type { ClubCategory } from "../../../../types/clubs/club";

export type RecruitingFilter = "all" | "recruiting" | "notRecruiting";

type Props = {
  categories: ClubCategory[];
  activeCategory: ClubCategory | "all";
  setActiveCategory: (v: ClubCategory | "all") => void;

  recruiting: RecruitingFilter;
  setRecruiting: (v: RecruitingFilter) => void;
};

export function ClubFilters({
  categories,
  activeCategory,
  setActiveCategory,
  recruiting,
  setRecruiting,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Chip
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          All
        </Chip>

        {categories.map((c) => (
          <Chip
            key={c}
            active={activeCategory === c}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip
          active={recruiting === "all"}
          onClick={() => setRecruiting("all")}
        >
          All statuses
        </Chip>
        <Chip
          active={recruiting === "recruiting"}
          onClick={() => setRecruiting("recruiting")}
        >
          Recruiting
        </Chip>
        <Chip
          active={recruiting === "notRecruiting"}
          onClick={() => setRecruiting("notRecruiting")}
        >
          Not recruiting
        </Chip>
      </div>
    </div>
  );
}
