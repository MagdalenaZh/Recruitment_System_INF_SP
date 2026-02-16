import { Container } from "../../../../../components/layout/Container";
import { Badge } from "../../../../../components/ui/Badge";
import type { Club } from "../../../../../types/club";

export function HeaderSection({ club }: { club: Club }) {
  return (
    <section className="mt-6">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 mb-10">
          {/* Photos */}
          <div className="lg:col-span-7">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 h-56 rounded-2xl bg-gradient-to-br from-blue-700/30 via-white/5 to-slate-950 ring-1 ring-white/10" />
              <div className="h-56 rounded-2xl bg-gradient-to-br from-sky-400/20 via-white/5 to-slate-950 ring-1 ring-white/10" />
            </div>
            <div className="mt-3 h-40 rounded-2xl bg-gradient-to-r from-white/5 via-blue-500/10 to-white/5 ring-1 ring-white/10" />
          </div>

          {/* Info */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {club.name}
                  </h1>
                  <p className="mt-2 text-white/70">{club.shortDescription}</p>
                </div>

                <Badge variant={club.isRecruiting ? "info" : "muted"}>
                  {club.isRecruiting ? "Recruiting" : "Not recruiting"}
                </Badge>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/70">
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  Category: {club.category}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  Campus organization
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
