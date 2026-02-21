import { Container } from "../../../../components/layout/Container";

import type { ClubDepartment } from "../../../../types/clubs/club";

export function DepartmentsSection({
  departments,
}: {
  departments?: ClubDepartment[];
}) {
  return (
    <section className="bg-slate-50 pb-10 text-slate-900">
      <Container>
        <h2 className="text-xl font-semibold">Departments</h2>
        <p className="mt-2 text-sm text-slate-600">
          What different teams inside the club do.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(departments ?? []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              No departments listed yet.
            </div>
          ) : (
            departments!.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-base font-semibold">{d.name}</div>
                <p className="mt-2 text-sm text-slate-600">{d.description}</p>
              </div>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
