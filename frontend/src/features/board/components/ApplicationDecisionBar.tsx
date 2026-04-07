import type { ApplicationDetail, BoardVote } from "../types/boardTypes";

export function ApplicationDecisionBar({
  app,
  onVote,
  loading,
  error,
}: {
  app: ApplicationDetail;
  onVote: (vote: BoardVote) => void;
  loading: boolean;
  error: string | null;
}) {
  const btnBase =
    "rounded-xl px-4 py-2 text-sm font-semibold border transition disabled:opacity-60 disabled:cursor-not-allowed";

  const approveActive = app.myVote === "Approve";
  const rejectActive = app.myVote === "Reject";

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-800">
              Status: {app.status}
            </div>
            <div className="text-sm text-slate-600">
              Your vote:{" "}
              <span className="font-medium text-slate-900">
                {app.myVote ?? "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`${btnBase} ${
                approveActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
              onClick={() => onVote("Approve")}
              disabled={loading}
            >
              Approve
            </button>

            <button
              className={`${btnBase} ${
                rejectActive
                  ? "border-rose-300 bg-rose-50 text-rose-800"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
              onClick={() => onVote("Reject")}
              disabled={loading}
            >
              Reject
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-3 text-sm text-rose-700">{error}</div>
        ) : null}
      </div>
    </div>
  );
}
