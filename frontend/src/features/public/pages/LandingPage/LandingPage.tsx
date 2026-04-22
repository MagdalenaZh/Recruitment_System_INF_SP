import { useEffect, useMemo, useState } from "react";

import { HeroSection } from "./sections/HeroSection";
import { ClubsSection } from "./sections/ClubsSection";

import { Footer } from "../../../../components/layout/Footer";
import { Navbar } from "../../../../components/layout/Navbar/Navbar";

import type { ClubListItem } from "../../../../types/clubs/club";
import { getClubs } from "../../../../services/clubs/clubs.api";

import { usePageTitle } from "../../../clubs/hooks/usePageTitle";

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState<ClubListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle("AUBG Clubs");

  useEffect(() => {
    let cancelled = false;

    async function loadClubs() {
      try {
        setLoading(true);
        setError(null);

        const data = await getClubs();

        if (!cancelled) {
          setClubs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load clubs.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return clubs.filter((c) => {
      if (!q) return true;

      return (
        c.clubName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [clubs, search]);

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-white">
      <Navbar search={search} setSearch={setSearch} overlay />

      <main className="flex-1">
        <HeroSection />

        {loading ? (
          <div className="mx-auto max-w-6xl px-4 py-10">Loading clubs...</div>
        ) : error ? (
          <div className="mx-auto max-w-6xl px-4 py-10 text-red-300">{error}</div>
        ) : (
          <ClubsSection clubs={filtered} totalCount={filtered.length} />
        )}
      </main>

      <Footer />
    </div>
  );
}
