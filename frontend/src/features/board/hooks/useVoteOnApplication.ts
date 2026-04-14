import { useState } from "react";
import type { ApplicationDetail, BoardVote, VoteResult } from "../types/boardTypes";
import { boardApi } from "../../../services/board/boardApi";

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

      const result: VoteResult = {
        approvalsCount: current.approvalsCount,
        requiredApprovals: current.requiredApprovals,
        totalVotes: current.totalVotes,
        approveVotes: current.approveVotes,
        rejectVotes: current.rejectVotes,
        status: current.status,
        myVote: decision,
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
