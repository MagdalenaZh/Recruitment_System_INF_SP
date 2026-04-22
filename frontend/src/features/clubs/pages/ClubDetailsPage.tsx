import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

import { HeaderSection } from "./sections/HeaderSection";
import { AboutSection } from "./sections/AboutSection";
import { DepartmentsSection } from "./sections/DepartmentsSection";
import { ApplySection } from "./sections/ApplySection";

import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { Container } from "../../../components/layout/Container";

import type { ClubDepartment, ClubListItem } from "../../../types/clubs/club";
import {
  getDepartmentsByClubId,
  getClubById,
} from "../../../services/clubs/clubs.api";

import { usePageTitle } from "../hooks/usePageTitle";

type LocationState = {
  club?: ClubListItem;
};

export default function ClubDetailsPage() {
  const { clubId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [search, setSearch] = useState("");
  const [club, setClub] = useState<ClubListItem | null>(state?.club ?? null);
  const [departments, setDepartments] = useState<ClubDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  usePageTitle(club ? club.clubName : "Club details");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!clubId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        let currentClub = state?.club ?? null;

        if (!currentClub) {
          currentClub = await getClubById(clubId);
        }

        const departmentsData = await getDepartmentsByClubId(clubId);

        if (!cancelled) {
          setClub(currentClub);
          setDepartments(departmentsData);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [clubId, state?.club]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Navbar search={search} setSearch={setSearch} />

      <main className="flex-1 pt-24">
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
            <HeaderSection
              club={{
                clubId: club.clubId,
                clubName: club.clubName,
                description: club.description,
                admissionQuestions: club.admissionQuestions,
                departments,
                category: club.category,
              }}
            />
            <AboutSection about={club.description} />
            <DepartmentsSection departments={departments} />
            <ApplySection
              clubId={club.clubId}
              clubName={club.clubName}
              clubDescription={club.description}
              admissionQuestions={club.admissionQuestions}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
