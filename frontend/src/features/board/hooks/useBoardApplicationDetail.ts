import { useEffect, useState } from "react";
import { boardApi } from "../../../services/board/boardApi";
import type { ApplicationDetail } from "../types/boardTypes";

export function useBoardApplicationDetail(applicationId?: string) {
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!applicationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await boardApi.getApplicationDetail(applicationId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [applicationId]);

  return { data, setData, loading, error, refetch: load };
}