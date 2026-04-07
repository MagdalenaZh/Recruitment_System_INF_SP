import { useState } from "react";
import type { ApplicationDetail, BoardVote, VoteResult } from "../types/boardTypes";
import { boardApi } from "../../../services/board/boardApi";

export function useVoteOnApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function vote(
    applicationId: string,
    decision: BoardVote,
    current: ApplicationDetail,
  ): Promise<VoteResult | null> {
    try {
      setLoading(true);
      setError(null);

      console.log("[useVoteOnApplication] voting", {
        applicationId,
        decision,
        current,
      });

      await boardApi.voteOnApplication(applicationId, decision);

      const result: VoteResult = {
        approvalsCount:
          decision === "Approve"
            ? current.approvalsCount + 1
            : current.approvalsCount,
        requiredApprovals: current.requiredApprovals,
        status: current.status,
        myVote: decision,
      };

      console.log("[useVoteOnApplication] optimistic result:", result);

      return result;
    } catch (e) {
      console.error("[useVoteOnApplication] vote error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { vote, loading, error };
}