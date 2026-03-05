import { useEffect, useState } from "react";
import type { ApplicationListItem, ApplicationStatus } from "../types/boardTypes";
import { boardApi } from "../../../services/board/boardApi";

export function useDepartmentApplications(departmentId?: string) {
  const [data, setData] = useState<ApplicationListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");

  async function load() {
    if (!departmentId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await boardApi.getApplicationsByDepartment(departmentId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [departmentId]);

  const filtered =
    data?.filter((a) => {
      const matchesQuery = query.trim().length === 0
        ? true
        : a.applicantName.toLowerCase().includes(query.toLowerCase().trim());

      const matchesStatus = statusFilter === "All" ? true : a.status === statusFilter;

      return matchesQuery && matchesStatus;
    }) ?? [];

  return {
    data,
    filtered,
    loading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    refetch: load,
  };
}