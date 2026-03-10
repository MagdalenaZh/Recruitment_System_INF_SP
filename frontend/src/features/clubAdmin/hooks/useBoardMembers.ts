import { useEffect, useState } from "react";
import type { BoardMember } from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";

export function useBoardMembers() {
  const [data, setData] = useState<BoardMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await clubAdminApi.getBoardMembers();
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