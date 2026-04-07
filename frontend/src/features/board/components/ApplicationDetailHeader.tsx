import type { ApplicationDetail } from "../types/boardTypes";
import { StatusPill } from "./StatusPill";

function formatDateTime(iso: string) {
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "Unknown date";
  }

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApplicationDetailHeader({ app }: { app: ApplicationDetail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {app.applicantName}
          </h1>
          <div className="mt-1 text-sm text-slate-600">
            User ID: {app.userId}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Submitted: {formatDateTime(app.submittedAt)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={app.status} />
        </div>
      </div>
    </div>
  );
}
