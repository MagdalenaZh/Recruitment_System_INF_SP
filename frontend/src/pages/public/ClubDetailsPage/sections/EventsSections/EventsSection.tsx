import { Container } from "../../../../../components/layout/Container";
import type { ClubEvent } from "../../../../../types/club";

export function EventsSection({ events }: { events?: ClubEvent[] }) {
  return (
    <section className="bg-slate-50 pb-12 text-slate-900">
      <Container>
        <h2 className="text-xl font-semibold">Events</h2>
        <p className="mt-2 text-sm text-slate-600">
          Some recent or upcoming activities.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(events ?? []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              No events posted yet.
            </div>
          ) : (
            events!.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base font-semibold">{e.title}</div>
                  <span className="text-xs text-slate-500">{e.dateText}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{e.description}</p>
              </div>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
