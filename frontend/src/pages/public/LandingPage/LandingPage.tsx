import { useMemo, useState } from "react";

import { Navbar } from "../../../components/layout/Navbar/Navbar";

import { clubsMock } from "../../services/clubs/clubs.mock";
import type { ClubCategory } from "../../../types/club";

import { HeroSection } from "./sections/HeroSection/HeroSection";
import { ClubsSection } from "./sections/ClubsSection/ClubsSection";
import { Footer } from "../../../components/layout/Footer";
import type { RecruitingFilter } from "../../../components/clubs/CLubFilters";

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ClubCategory | "all">(
    "all",
  );
  const [recruiting, setRecruiting] = useState<RecruitingFilter>("all");

  const categories = useMemo(() => {
    const set = new Set(clubsMock.map((c) => c.category));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clubsMock
      .filter((c) =>
        activeCategory === "all" ? true : c.category === activeCategory,
      )
      .filter((c) => {
        if (recruiting === "all") return true;
        if (recruiting === "recruiting") return c.isRecruiting;
        return !c.isRecruiting;
      })
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q)
        );
      });
  }, [search, activeCategory, recruiting]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar search={search} setSearch={setSearch} />

      <HeroSection />

      <ClubsSection
        clubs={filtered}
        totalCount={filtered.length}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        recruiting={recruiting}
        setRecruiting={setRecruiting}
      />

      <Footer />
    </div>
  );
}
