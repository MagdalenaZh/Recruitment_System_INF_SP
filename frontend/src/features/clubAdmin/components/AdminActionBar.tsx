// src/features/clubAdmin/components/AdminActionBar.tsx
import type {
  ClubAdminApplicationDetail,
  AdminDecision,
} from "../types/clubAdminTypes";

export function AdminActionBar({
  app,
  onFinalize,
  loading,
  error,
}: {
  app: ClubAdminApplicationDetail;
  onFinalize: (decision: AdminDecision) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="sticky bottom-4">
      <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
              {app.approvalsCount}/{app.requiredApprovals} approvals
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200">
              Status:{" "}
              <span className="font-semibold text-white">{app.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onFinalize("Admit")}
              disabled={loading}
              className="rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-60"
            >
              Admit applicant
            </button>

            <button
              onClick={() => onFinalize("Reject")}
              disabled={loading}
              className="rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/25 disabled:opacity-60"
            >
              Reject applicant
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 text-sm text-rose-300">{error}</div>
        ) : null}
      </div>
    </div>
  );
}
