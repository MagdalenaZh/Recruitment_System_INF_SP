import { Container } from "../../../../components/layout/Container";
import type { ClubDepartment } from "../../../../types/clubs/club";

function departmentBadge(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "DP";
}

export function DepartmentsSection({
  departments,
}: {
  departments?: ClubDepartment[];
}) {
  return (
    <section className="bg-slate-50 pb-14 text-slate-900">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-2xl font-semibold uppercase tracking-[0.24em] text-blue-700">
              Departments
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Find the team that fits you
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(departments ?? []).length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No departments listed yet.
            </div>
          ) : (
            departments!.map((d) => (
              <div
                key={d.departmentId}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-40px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-blue-200"
              >
                <div className="flex items-start gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {d.departmentName}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {d.description}
                </p>
              </div>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
