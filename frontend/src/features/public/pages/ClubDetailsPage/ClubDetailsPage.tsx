import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { Footer } from "../../../../components/layout/Footer";
import { Container } from "../../../../components/layout/Container";
import type { Club } from "../../../../types/clubs/club";
import { AboutSection } from "./sections/AboutSection";
import * as Navbar from "../../../../components/layout/Navbar/Navbar";
import { usePageTitle } from "../../hooks/usePageTitle";
import { getClubById } from "../../../../services/clubs/clubs.api";
import { HeaderSection } from "./sections/HeaderSection";
import { DepartmentsSection } from "./sections/DepartmentsSection";
import { EventsSection } from "./sections/EventsSection";
import { ApplySection } from "./sections/ApplySection";

export default function ClubDetailsPage() {
  const { clubId } = useParams();
  const [search, setSearch] = useState("");
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(club ? club.name : "Club details");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = clubId ? await getClubById(clubId) : null;
      if (!cancelled) {
        setClub(res);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar.Navbar search={search} setSearch={setSearch} />

      <main className="pt-24">
        <Container>
          <Link
            to="/home"
            className="inline-flex text-sm text-white/70 hover:text-white"
          >
            ← Back to clubs
          </Link>
        </Container>

        {loading ? (
          <Container>
            <div className="mt-10 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              Loading club...
            </div>
          </Container>
        ) : !club ? (
          <Container>
            <div className="mt-10 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              Club not found.
            </div>
          </Container>
        ) : (
          <>
            <HeaderSection club={club} />
            <AboutSection about={club.about} />
            <DepartmentsSection departments={club.departments} />
            <EventsSection events={club.events} />
            <ApplySection
              clubId={club.clubId}
              isRecruiting={club.isRecruiting}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
