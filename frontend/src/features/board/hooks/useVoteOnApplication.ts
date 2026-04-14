import { useState } from "react";
import type { ApplicationDetail, BoardVote, VoteResult } from "../types/boardTypes";
import { boardApi, resolveCurrentUserId } from "../../../services/board/boardApi";
import { getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import { applyUpdateToApplicationDetail } from "../utils/applicationLiveState";

export function useVoteOnApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitVoteByStatus(
    applicationId: string,
    decision: BoardVote,
    status: ApplicationDetail["status"],
  ): Promise<void> {
    if (status === "Pending" || status === "Submitted") {
      await boardApi.voteOnApplication(applicationId, decision);
      return;
    }

    if (status === "Interview") {
      if (decision === "Approve") {
        await boardApi.afterInterviewApproveApplication(applicationId);
      } else {
        await boardApi.afterInterviewDisapproveApplication(applicationId);
      }
      return;
    }

    throw new Error("This application cannot be voted in its current state.");
  }

  async function vote(
    applicationId: string,
    decision: BoardVote,
    current: ApplicationDetail,
  ): Promise<VoteResult | null> {
    try {
      setLoading(true);
      setError(null);

      await submitVoteByStatus(applicationId, decision, current.status);

      const optimistic: ApplicationDetail = {
        ...current,
        myVote: decision,
      };

      const snapshots = await getLatestApplicationStates([applicationId]);
      const currentUserId = resolveCurrentUserId();
      const hydrated = snapshots[0]
        ? applyUpdateToApplicationDetail(optimistic, snapshots[0], currentUserId)
        : optimistic;

      const result: VoteResult = {
        approvalsCount: hydrated.approvalsCount,
        requiredApprovals: hydrated.requiredApprovals,
        totalVotes: hydrated.totalVotes,
        approveVotes: hydrated.approveVotes,
        rejectVotes: hydrated.rejectVotes,
        status: hydrated.status,
        myVote: hydrated.myVote,
      };

      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { vote, loading, error };
}
