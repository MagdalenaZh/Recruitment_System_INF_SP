import { useEffect, useMemo, useState } from "react";
import type { ApplicationListItem, ApplicationStatus } from "../types/boardTypes";
import {
  boardApi,
  resolveCurrentBoardClubId,
  resolveCurrentUserId,
} from "../../../services/board/boardApi";
import type { RecruitmentApplicationDto } from "../../../services/board/boardApi";
import { getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type { LatestApplicationStateResponse } from "../../../services/applications/applicationStateTypes";
import {
  applyUpdateToApplicationListItem,
  normalizeBaseStatus,
} from "../utils/applicationLiveState";

function buildApplicantName(userId: string): string {
  return `Applicant ${userId.slice(0, 8)}`;
}

export function useDepartmentApplications(departmentId?: string) {
  const [applications, setApplications] = useState<RecruitmentApplicationDto[]>([]);
  const [departmentName, setDepartmentName] = useState("Department");
  const [liveUpdates, setLiveUpdates] = useState<Record<string, LatestApplicationStateResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All");
  const clientId = useMemo(() => createRealtimeClientId(), []);

  async function load() {
    if (!departmentId) {
      setApplications([]);
      setLiveUpdates({});
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

      const [applicationsResponse, departmentsResponse] = await Promise.all([
        boardApi.getApplicationsByDepartment(departmentId),
        boardApi.getDepartmentsByClub(clubId),
      ]);

      setApplications(applicationsResponse);

      const matchedDepartment = departmentsResponse.find(
        (department) => department.departmentId === departmentId,
      );

      setDepartmentName(matchedDepartment?.departmentName ?? "Department");

      const stateSnapshots = await getLatestApplicationStates(
        applicationsResponse.map((application) => application.applicationId),
      );

      setLiveUpdates(() => {
        const next: Record<string, LatestApplicationStateResponse> = {};
        for (const state of stateSnapshots) {
          next[state.applicationId] = state;
        }
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setApplications([]);
      setLiveUpdates({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [departmentId]);

  const applicationIds = useMemo(
    () => applications.map((application) => application.applicationId),
    [applications],
  );

  useEffect(() => {
    if (applicationIds.length === 0) {
      return;
    }

    return subscribeToApplicationStates({
      clientId,
      applicationIds,
      onMessage: (payload) => {
        setLiveUpdates((prev) => ({
          ...prev,
          [payload.applicationId]: payload,
        }));
      },
      onError: (streamError) => {
        console.error("[useDepartmentApplications] SSE stream error", streamError);
      },
    });
  }, [applicationIds, clientId]);

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
