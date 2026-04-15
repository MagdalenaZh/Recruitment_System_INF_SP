import type { ApplicationDetail } from "../types/boardTypes";
import { StatusPill } from "./StatusPill";

export function ApplicationDetailHeader({ app }: { app: ApplicationDetail }) {
  const showApprovals = app.status !== "InterviewPending";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{app.applicantName}</h1>
          <div className="mt-1 text-sm text-slate-600">Email: {app.applicantEmail}</div>
          <div className="mt-1 text-sm text-slate-600">Department: {app.departmentName}</div>
          {showApprovals ? (
            <div className="mt-1 text-sm text-slate-600">
              Approvals:{" "}
              <span className="font-semibold text-slate-900">
                {app.approvalsCount}/{app.requiredApprovals}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={app.status} />
        </div>
      </div>

      {app.interviewSlot ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Interview scheduled
          </div>
          <div className="mt-1 text-sm text-amber-900">
            {new Date(app.interviewSlot.startTime).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            &ndash;{" "}
            {new Date(app.interviewSlot.endTime).toLocaleTimeString(undefined, {
              timeStyle: "short",
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
