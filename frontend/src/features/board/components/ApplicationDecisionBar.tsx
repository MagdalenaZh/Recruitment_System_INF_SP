import { resolveCurrentUserId } from "../../../services/board/boardApi";
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
  const canVote =
    app.status === "Pending" || app.status === "Submitted" || app.status === "Interview";

  const approveActive = app.myVote === "Approve";
  const rejectActive = app.myVote === "Reject";
  const myVoteLabel =
    app.myVote === "Approve" ? "Approve" : app.myVote === "Reject" ? "Disapprove" : "-";

  const currentUserId = resolveCurrentUserId();
  const voterEntries = app.voterDecisions ? Object.entries(app.voterDecisions) : [];

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-800">
              Status: {app.status}
            </div>
            <div className="text-sm text-slate-600">
              Your vote:{" "}
              <span className="font-medium text-slate-900">{myVoteLabel}</span>
            </div>
            <div className="text-sm text-slate-600">
              Board votes:{" "}
              <span className="font-medium text-slate-900">
                {app.totalVotes} ({app.approveVotes} approve / {app.rejectVotes} reject)
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
              disabled={loading || !canVote}
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
              disabled={loading || !canVote}
            >
              Disapprove
            </button>
          </div>
        </div>

        {voterEntries.length > 0 ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Board member votes
            </div>
            <div className="flex flex-col gap-1">
              {voterEntries.map(([userId, approved]) => {
                const isMe =
                  currentUserId !== null &&
                  userId.toLowerCase() === currentUserId.toLowerCase();
                return (
                  <div key={userId} className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        isMe ? "font-semibold text-blue-700" : "text-slate-600"
                      }
                    >
                      {isMe ? "You" : `${userId.slice(0, 8)}\u2026`}
                    </span>
                    <span
                      className={
                        approved
                          ? "font-medium text-emerald-600"
                          : "font-medium text-rose-600"
                      }
                    >
                      {approved ? "Approved" : "Rejected"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {!canVote ? (
          <div className="mt-3 text-sm text-slate-600">
            Voting is available only while the application is in submitted, pending, or interview
            review stages.
          </div>
        ) : null}

        {error ? <div className="mt-3 text-sm text-rose-700">{error}</div> : null}

        {loading ? <div className="mt-3 text-sm text-slate-600">Submitting your vote...</div> : null}
      </div>
    </div>
  );
}
