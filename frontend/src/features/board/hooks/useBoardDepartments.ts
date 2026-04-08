import { useEffect, useMemo, useState } from "react";
import {
  boardApi,
  resolveCurrentBoardClubId,
} from "../../../services/board/boardApi";
import type {
  RecruitmentApplicationDto,
  RecruitmentDepartmentDto,
} from "../../../services/board/boardApi";
import { getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type { LatestApplicationStateResponse } from "../../../services/applications/applicationStateTypes";
import type { BoardDepartment } from "../types/boardTypes";
import {
  inferStatusFromUpdate,
  normalizeBaseStatus,
} from "../utils/applicationLiveState";

export function useBoardDepartments() {
  const [departments, setDepartments] = useState<RecruitmentDepartmentDto[]>([]);
  const [applications, setApplications] = useState<RecruitmentApplicationDto[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<Record<string, LatestApplicationStateResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientId = useMemo(() => createRealtimeClientId(), []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentBoardClubId();

      if (!clubId) {
        throw new Error("No clubId found in localStorage.");
      }

      const [departmentsResponse, applicationsResponse] = await Promise.all([
        boardApi.getDepartmentsByClub(clubId),
        boardApi.getApplicationsByClub(clubId),
      ]);

      setDepartments(departmentsResponse);
      setApplications(applicationsResponse);

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
      setDepartments([]);
      setApplications([]);
      setLiveUpdates({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
        console.error("[useBoardDepartments] SSE stream error", streamError);
      },
    });
  }, [applicationIds, clientId]);

  const data = useMemo<BoardDepartment[]>(() => {
    return departments.map((department) => {
      const departmentApplications = applications.filter(
        (app) => app.departmentId === department.departmentId,
      );

      const counts = departmentApplications.reduce(
        (acc, application) => {
          const liveUpdate = liveUpdates[application.applicationId];
          const liveStatus = liveUpdate ? inferStatusFromUpdate(liveUpdate) : null;
          const status = liveStatus ?? normalizeBaseStatus(application.applicationStatus);

          if (status === "Approved") acc.approvedCount += 1;
          else if (status === "Rejected") acc.rejectedCount += 1;
          else acc.pendingCount += 1;

          return acc;
        },
        { approvedCount: 0, rejectedCount: 0, pendingCount: 0 },
      );

      return {
        clubId: department.clubId,
        departmentId: department.departmentId,
        departmentName: department.departmentName,
        description: department.description,
        targetSpots: department.numberOfOpenPositions,
        totalApplicants: departmentApplications.length,
        approvedCount: counts.approvedCount,
        rejectedCount: counts.rejectedCount,
        pendingCount: counts.pendingCount,
      };
    });
  }, [departments, applications, liveUpdates]);

  return { data, loading, error, refetch: load };
}
