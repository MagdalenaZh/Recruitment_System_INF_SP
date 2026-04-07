import { useEffect, useMemo, useState } from "react";
import type { ApplicationListItem, ApplicationStatus } from "../types/boardTypes";
import {
  boardApi,
  getApplicationUpdatesUrl,
  resolveCurrentBoardClubId,
  resolveCurrentUserId,
} from "../../../services/board/boardApi";
import type {
  RecruitmentApplicationDto,
  RecruitmentDepartmentDto,
} from "../../../services/board/boardApi";
import {
  applyUpdateToApplicationListItem,
  normalizeBaseStatus,
  getApplicationIdFromUpdate,
  type ApplicationUpdatePayload,
} from "../utils/applicationLiveState";

function buildApplicantName(userId: string): string {
  return `Applicant ${userId.slice(0, 8)}`;
}

export function useDepartmentApplications(departmentId?: string) {
  const [applications, setApplications] = useState<RecruitmentApplicationDto[]>([]);
  const [departmentName, setDepartmentName] = useState("Department");
  const [liveUpdates, setLiveUpdates] = useState<Record<string, ApplicationUpdatePayload>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");

  async function load() {
    if (!departmentId) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentBoardClubId();
      if (!clubId) {
        throw new Error("No clubId found in localStorage.");
      }

      console.log("[useDepartmentApplications] loading", { departmentId, clubId });

      const [applicationsResponse, departmentsResponse] = await Promise.all([
        boardApi.getApplicationsByDepartment(departmentId),
        boardApi.getDepartmentsByClub(clubId),
      ]);

      console.log("[useDepartmentApplications] raw applications:", applicationsResponse);
      console.log("[useDepartmentApplications] raw departments:", departmentsResponse);

      setApplications(applicationsResponse);

      const matchedDepartment = departmentsResponse.find(
        (department) => department.departmentId === departmentId,
      );

      setDepartmentName(matchedDepartment?.departmentName ?? "Department");
    } catch (e) {
      console.error("[useDepartmentApplications] load error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [departmentId]);

  useEffect(() => {
    const url = getApplicationUpdatesUrl();
    console.log("[useDepartmentApplications] opening SSE connection:", url);

    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ApplicationUpdatePayload;
        const applicationId = getApplicationIdFromUpdate(payload);

        if (!applicationId) return;

        console.log("[useDepartmentApplications] SSE update received:", payload);

        setLiveUpdates((prev) => ({
          ...prev,
          [applicationId]: payload,
        }));
      } catch (e) {
        console.error("[useDepartmentApplications] failed to parse SSE payload:", e);
      }
    };

    source.onerror = (event) => {
      console.error("[useDepartmentApplications] SSE error:", event);
    };

    return () => {
      console.log("[useDepartmentApplications] closing SSE connection");
      source.close();
    };
  }, []);

  const currentUserId = resolveCurrentUserId();

  const data = useMemo<ApplicationListItem[]>(() => {
    return applications.map((application) => {
      const baseItem: ApplicationListItem = {
        id: application.applicationId,
        applicantName: buildApplicantName(application.userId),
        applicantEmail: "",
        status: normalizeBaseStatus(application.applicationStatus),
        submittedAt: new Date().toISOString(),
        approvalsCount: 0,
        requiredApprovals: 0,
        departmentId: application.departmentId,
        departmentName,
        userId: application.userId,
        myVote: null,
      };

      const liveUpdate = liveUpdates[application.applicationId];

      if (!liveUpdate) {
        return baseItem;
      }

      return applyUpdateToApplicationListItem(baseItem, liveUpdate, currentUserId);
    });
  }, [applications, departmentName, liveUpdates, currentUserId]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const normalizedQuery = query.toLowerCase().trim();

      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : item.applicantName.toLowerCase().includes(normalizedQuery) ||
            item.userId.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "All" ? true : item.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [data, query, statusFilter]);

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