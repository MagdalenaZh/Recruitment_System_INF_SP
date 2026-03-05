import { useEffect, useState } from "react";
import { boardApi } from "../../../services/board/boardApi";
import type { BoardDepartment } from "../types/boardTypes";

export function useBoardDepartments() {
  const [data, setData] = useState<BoardDepartment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await boardApi.getDepartments();
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