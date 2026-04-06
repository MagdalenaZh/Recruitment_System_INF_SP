import { StatusChip } from "../components/StatusChip";
import { StageStepper } from "../components/StageStepper";
import { useAccountApplications } from "../hooks/useAccountApplications";

export function AccountApplicationsPage() {
  const { applications, loading, error } = useAccountApplications();

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-500 ring-1 ring-slate-100">
        Loading applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-rose-600 ring-1 ring-rose-100">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-500 ring-1 ring-slate-100">
        You have not submitted any applications yet.
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 space-y-4">
        {applications.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl bg-white p-5 ring-1 ring-slate-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {a.clubName}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {a.departmentName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Updated: {new Date(a.updatedAt).toLocaleString()}
                </div>
              </div>

              <StatusChip stage={a.stage} />
            </div>

            <StageStepper stage={a.stage} />
          </div>
        ))}
      </div>
    </div>
  );
}
