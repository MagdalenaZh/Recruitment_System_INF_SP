import { useMemo, useState } from "react";

import { Container } from "../../../../../components/layout/Container";
import { ClubGrid } from "../../../components/clubs/ClubGrid";

import type { ClubListItem } from "../../../../../types/clubs/club";
import { ClubFilters } from "../../../components/clubs/CLubFilters";

type Props = {
  clubs: ClubListItem[];
  totalCount: number;
};

export function ClubsSection({ clubs }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        clubs
          .map((club) => club.category?.trim())
          .filter((category): category is string => Boolean(category)),
      ),
    );

    return ["All", ...uniqueCategories];
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    if (selectedCategory === "All") {
      return clubs;
    }

    return clubs.filter((club) => club.category === selectedCategory);
  }, [clubs, selectedCategory]);

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
              {filteredClubs.length} club{filteredClubs.length === 1 ? "" : "s"}{" "}
              found
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ClubFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            totalCount={filteredClubs.length}
          />
        </div>

        <div className="mt-6">
          <ClubGrid clubs={filteredClubs} />
        </div>
      </Container>
    </section>
  );
}
