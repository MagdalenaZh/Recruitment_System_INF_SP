import { useEffect, useMemo, useState } from "react";
import {
  boardApi,
  getApplicationUpdatesUrl,
  resolveCurrentBoardClubId,
} from "../../../services/board/boardApi";
import type { BoardDepartment } from "../types/boardTypes";
import type {
  RecruitmentApplicationDto,
  RecruitmentDepartmentDto,
} from "../../../services/board/boardApi";
import {
  getApplicationIdFromUpdate,
  inferStatusFromUpdate,
  normalizeBaseStatus,
  type ApplicationUpdatePayload,
} from "../utils/applicationLiveState";

export function useBoardDepartments() {
  const [departments, setDepartments] = useState<RecruitmentDepartmentDto[]>([]);
  const [applications, setApplications] = useState<RecruitmentApplicationDto[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<Record<string, ApplicationUpdatePayload>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentBoardClubId();

      if (!clubId) {
        throw new Error("No clubId found in localStorage.");
      }

      console.log("[useBoardDepartments] loading departments and applications for clubId:", clubId);

      const [departmentsResponse, applicationsResponse] = await Promise.all([
        boardApi.getDepartmentsByClub(clubId),
        boardApi.getApplicationsByClub(clubId),
      ]);

      console.log("[useBoardDepartments] raw departments:", departmentsResponse);
      console.log("[useBoardDepartments] raw club applications:", applicationsResponse);

      setDepartments(departmentsResponse);
      setApplications(applicationsResponse);
    } catch (e) {
      console.error("[useBoardDepartments] load error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
      setDepartments([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const url = getApplicationUpdatesUrl();
    console.log("[useBoardDepartments] opening SSE connection:", url);

    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ApplicationUpdatePayload;
        const applicationId = getApplicationIdFromUpdate(payload);

        if (!applicationId) return;

        console.log("[useBoardDepartments] SSE update received:", payload);

        setLiveUpdates((prev) => ({
          ...prev,
          [applicationId]: payload,
        }));
      } catch (e) {
        console.error("[useBoardDepartments] failed to parse SSE payload:", e);
      }
    };

    source.onerror = (event) => {
      console.error("[useBoardDepartments] SSE error:", event);
    };

    return () => {
      console.log("[useBoardDepartments] closing SSE connection");
      source.close();
    };
  }, []);

  const data = useMemo<BoardDepartment[]>(() => {
    const mapped = departments.map((department) => {
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

    console.log("[useBoardDepartments] mapped department cards:", mapped);
    return mapped;
  }, [departments, applications, liveUpdates]);

  return { data, loading, error, refetch: load };
}