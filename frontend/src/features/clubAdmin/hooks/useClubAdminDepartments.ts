import { useEffect, useState } from "react";
import type { ClubAdminDepartment } from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";

export function useClubAdminDepartments() {
  const [data, setData] = useState<ClubAdminDepartment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await clubAdminApi.getDepartments();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, refetch: load };
}