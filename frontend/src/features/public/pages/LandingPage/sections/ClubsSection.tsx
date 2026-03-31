import { Container } from "../../../../../components/layout/Container";
import { ClubFilters } from "../../../components/clubs/CLubFilters";
import { ClubGrid } from "../../../components/clubs/ClubGrid";

import type { ClubListItem } from "../../../../../types/clubs/club";

type Props = {
  clubs: ClubListItem[];
  totalCount: number;
};

export function ClubsSection({ clubs, totalCount }: Props) {
  return (
    <section
      id="clubs"
      className="bg-slate-50 py-12 text-slate-900 scroll-mt min-h-screen flex items-center"
    >
      <Container>
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Browse Clubs at AUBG</h2>
            <p className="mt-1 text-sm text-slate-600">
              {totalCount} club{totalCount === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ClubFilters totalCount={totalCount} />
        </div>

        <div className="mt-6">
          <ClubGrid clubs={clubs} />
        </div>
      </Container>
    </section>
  );
}
