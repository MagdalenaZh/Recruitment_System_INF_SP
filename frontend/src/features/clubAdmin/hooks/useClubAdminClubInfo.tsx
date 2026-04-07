import { useCallback, useEffect, useState } from "react";
import type { ClubAdminClubInfo } from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";

export function useClubAdminClubInfo() {
  const [data, setData] = useState<ClubAdminClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clubAdminApi.getCurrentClubInfo();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load club info.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateOpenPositions = useCallback(
    async (departmentId: string, openPositions: number) => {
      await clubAdminApi.updateOpenPositions(departmentId, openPositions);

      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          departments: prev.departments.map((department) =>
            department.departmentId === departmentId
              ? { ...department, openPositions }
              : department,
          ),
        };
      });
    },
    [],
  );

  return {
    data,
    loading,
    error,
    refetch: load,
    updateOpenPositions,
  };
}
