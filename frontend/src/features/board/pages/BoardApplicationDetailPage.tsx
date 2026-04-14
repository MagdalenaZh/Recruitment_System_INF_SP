import { Link, useParams } from "react-router-dom";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { ApplicationAnswersSection } from "../components/ApplicationAnswersSection";
import { ApplicationAttachmentsSection } from "../components/ApplicationAttachmentsSection";
import { ApplicationDecisionBar } from "../components/ApplicationDecisionBar";
import { ApplicationDetailHeader } from "../components/ApplicationDetailHeader";
import { useBoardApplicationDetail } from "../hooks/useBoardApplicationDetail";
import { useVoteOnApplication } from "../hooks/useVoteOnApplication";
import type { BoardVote } from "../types/boardTypes";

export function BoardApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data, setData, loading, error } =
    useBoardApplicationDetail(applicationId);
  const {
    vote,
    loading: voteLoading,
    error: voteError,
  } = useVoteOnApplication();

  async function onVote(decision: BoardVote) {
    if (!data) return;

    const result = await vote(data.id, decision, data);
    if (!result) return;

    setData({
      ...data,
      approvalsCount: result.approvalsCount,
      requiredApprovals: result.requiredApprovals,
      status: result.status,
      myVote: result.myVote,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950">
      <Navbar />

      <div className="mx-auto max-w-6xl p-4 pb-24 pt-28 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              to={
                data?.departmentId
                  ? `/board/departments/${data.departmentId}/applications`
                  : "/board"
              }
              className="text-sm font-semibold text-slate-300 hover:text-white"
            >
              ← Back to applications
            </Link>
            <div className="mt-1 text-sm text-slate-400">
              Application ID: {applicationId}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200 shadow-sm">
              Loading application…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-200">
              <div className="font-semibold">Could not load application.</div>
              <div className="mt-2 text-sm">{error}</div>
            </div>
          ) : data ? (
            <div className="flex flex-col gap-4">
              <ApplicationDetailHeader app={data} />
              <ApplicationAnswersSection answers={data.answers} />
              <ApplicationAttachmentsSection attachments={data.attachments} />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
              Application not found.
            </div>
          )}
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
