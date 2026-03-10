import { useState } from "react";
import type { AdminDecision } from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";

export function useFinalizeApplication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finalize(applicationId: string, decision: AdminDecision) {
    try {
      setLoading(true);
      setError(null);
      return await clubAdminApi.finalizeApplication(applicationId, decision);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { finalize, loading, error };
}