import { useState } from "react";
import type { BoardVote, VoteResult } from "../types/boardTypes";
import { boardApi } from "../../../services/board/boardApi";

export function useVoteOnApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function vote(applicationId: string, decision: BoardVote): Promise<VoteResult | null> {
    try {
      setLoading(true);
      setError(null);
      return await boardApi.voteOnApplication(applicationId, decision);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { vote, loading, error };
}