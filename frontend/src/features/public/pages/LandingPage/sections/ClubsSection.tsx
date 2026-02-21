import { Container } from "../../../../../components/layout/Container";
import {
  ClubFilters,
  type RecruitingFilter,
} from "../../../components/clubs/CLubFilters";
import { ClubGrid } from "../../../components/clubs/ClubGrid";

import type { Club, ClubCategory } from "../../../../../types/clubs/club";

type Props = {
  clubs: Club[];
  totalCount: number;

  categories: ClubCategory[];
  activeCategory: ClubCategory | "all";
  setActiveCategory: (v: ClubCategory | "all") => void;

  recruiting: RecruitingFilter;
  setRecruiting: (v: RecruitingFilter) => void;
};

export function ClubsSection({
  clubs,
  totalCount,
  categories,
  activeCategory,
  setActiveCategory,
  recruiting,
  setRecruiting,
}: Props) {
  return (
    <section
      id="clubs"
      className="bg-slate-50 py-12 text-slate-900 scroll-mt min-h-screen flex items-center"
    >
      <Container>
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-end md:justify-between ">
          <div>
            <h2 className="text-2xl font-semibold">Browse Clubs at AUBG</h2>
            <p className="mt-1 text-sm text-slate-600">
              {totalCount} club{totalCount === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ClubFilters
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            recruiting={recruiting}
            setRecruiting={setRecruiting}
          />
        </div>

        <div className="mt-6">
          <ClubGrid clubs={clubs} />
        </div>
      </Container>
    </section>
  );
}
