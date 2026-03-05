import { Link, useParams } from "react-router-dom";
import { ApplicationAnswersSection } from "../components/ApplicationAnswersSection";
import { ApplicationAttachmentsSection } from "../components/ApplicationAttachmentsSection";
import { ApplicationDecisionBar } from "../components/ApplicationDecisionBar";
import { ApplicationDetailHeader } from "../components/ApplicationDetailHeader";
import { useBoardApplicationDetail } from "../hooks/useBoardApplicationDetail";
import { useVoteOnApplication } from "../hooks/useVoteOnApplication";
import type { BoardVote } from "../types/boardTypes";

export function BoardApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data, setData, loading, error, refetch } =
    useBoardApplicationDetail(applicationId);
  const {
    vote,
    loading: voteLoading,
    error: voteError,
  } = useVoteOnApplication();

  async function onVote(decision: BoardVote) {
    if (!data) return;
    const res = await vote(data.id, decision);
    if (!res) return;

    setData({
      ...data,
      approvalsCount: res.approvalsCount,
      requiredApprovals: res.requiredApprovals,
      status: res.status,
      myVote: res.myVote,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 pb-24 pt-28">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/board"
              className="text-sm text-white font-semibold text-slate-700 hover:underline"
            >
              ← Back to departments
            </Link>
            <div className="mt-1 text-white text-sm text-slate-600">
              Application ID: {applicationId}
            </div>
          </div>

          <button
            onClick={refetch}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
              Loading application…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
              {error}
            </div>
          ) : data ? (
            <div className="flex flex-col gap-4">
              <ApplicationDetailHeader app={data} />
              <ApplicationAnswersSection answers={data.answers} />
              <ApplicationAttachmentsSection attachments={data.attachments} />
            </div>
          ) : null}
        </div>

        {data ? (
          <ApplicationDecisionBar
            app={data}
            onVote={onVote}
            loading={voteLoading}
            error={voteError}
          />
        ) : null}
      </div>
    </div>
  );
}
