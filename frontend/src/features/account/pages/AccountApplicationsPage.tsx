import { useLocation } from "react-router-dom";
import { StatusChip } from "../components/StatusChip";
import { StageStepper } from "../components/StageStepper";
import { useAccountApplications } from "../hooks/useAccountApplications";

export function AccountApplicationsPage() {
  const location = useLocation();
  const notice =
    location.state &&
    typeof location.state === "object" &&
    "notice" in location.state &&
    typeof (location.state as { notice?: unknown }).notice === "string"
      ? (location.state as { notice: string }).notice
      : null;
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
    <div className="space-y-6">
      <div className="rounded-[28px] border border-blue-100 bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white shadow-[0_24px_55px_-38px_rgba(37,99,235,0.45)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
          My applications
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Track every application in one place
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85">
          Follow your progress, interview booking, and final decision updates
          without losing track of where each application stands.
        </p>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-100">
          {notice}
        </div>
      ) : null}

      <div className="space-y-4">
        {applications.map((a) => (
          <div
            key={a.id}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.3)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950">
                  {a.clubName}
                </div>
                <div className="mt-2 text-sm font-medium text-blue-700">
                  {a.departmentName}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Updated: {new Date(a.updatedAt).toLocaleString()}
                </div>
              </div>

              <StatusChip stage={a.stage} />
            </div>

            {a.interviewSlot ? (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="font-semibold">Interview:</span>
                <span>
                  {new Date(a.interviewSlot.startTime).toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  )}{" "}
                  &ndash;{" "}
                  {new Date(a.interviewSlot.endTime).toLocaleTimeString(
                    undefined,
                    {
                      timeStyle: "short",
                    },
                  )}
                </span>
              </div>
            ) : null}

            <div className="mt-5">
              <StageStepper stage={a.stage} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
