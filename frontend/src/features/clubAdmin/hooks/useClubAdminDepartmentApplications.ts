import { useEffect, useState } from "react";
import type {
  ClubAdminApplicationListItem,
  AdminApplicationStatus,
} from "../types/clubAdminTypes";
import { clubAdminApi } from "../../../services/clubAdmin/clubAdminApi";


export function useClubAdminDepartmentApplications(departmentId?: string) {
  const [data, setData] = useState<ClubAdminApplicationListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AdminApplicationStatus | "All">("All");

  async function load() {
    if (!departmentId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await clubAdminApi.getApplicationsByDepartment(departmentId);
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
      const matchesQuery = query.trim()
        ? a.applicantName.toLowerCase().includes(query.toLowerCase().trim())
        : true;

      const matchesStatus =
        statusFilter === "All" ? true : a.status === statusFilter;

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