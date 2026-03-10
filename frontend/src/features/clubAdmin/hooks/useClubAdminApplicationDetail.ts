import { useEffect, useState } from "react";
import type { ClubAdminApplicationDetail } from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";


export function useClubAdminApplicationDetail(applicationId?: string) {
  const [data, setData] = useState<ClubAdminApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await clubAdminApi.getApplicationDetail(applicationId);
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