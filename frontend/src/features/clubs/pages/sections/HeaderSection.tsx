import { Container } from "../../../../components/layout/Container";
import type { ClubDetails } from "../../../../types/clubs/club";

export function HeaderSection({ club }: { club: ClubDetails }) {
  return (
    <section className="mt-6">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 mb-10">
          <div className="lg:col-span-7">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 h-56 rounded-2xl bg-gradient-to-br from-blue-700/30 via-white/5 to-slate-950 ring-1 ring-white/10" />
              <div className="h-56 rounded-2xl bg-gradient-to-br from-sky-400/20 via-white/5 to-slate-950 ring-1 ring-white/10" />
            </div>
            <div className="mt-3 h-40 rounded-2xl bg-gradient-to-r from-white/5 via-blue-500/10 to-white/5 ring-1 ring-white/10" />
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {club.clubName}
                </h1>
                <p className="mt-2 text-white/70">
                  {club.description || "No description yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
