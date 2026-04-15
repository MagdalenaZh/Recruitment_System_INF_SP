import { useEffect, useMemo, useState } from "react";
import { boardApi, resolveCurrentBoardClubId } from "../../../services/board/boardApi";
import {
  getAllClubs,
  getDepartmentsForClub,
  getLatestApplicationStates,
} from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type { UserApplicationDto, DepartmentDto } from "../../../types/account/accountApplications";
import type { LatestApplicationStateResponse } from "../../../services/applications/applicationStateTypes";
import type { BoardDepartment } from "../types/boardTypes";
import { inferStatusFromUpdate, normalizeBaseStatus } from "../utils/applicationLiveState";
import {
  isAfterInterviewReviewState,
  isApprovedApplicationState,
  isConcludedApplicationState,
  isHibernatedApplicationState,
} from "../../../services/applications/applicationStateTypes";

function shouldHydrateLatestState(applicationStatus: number): boolean {
  return applicationStatus !== 4 && applicationStatus !== 5;
}

export function useBoardDepartments() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [applications, setApplications] = useState<UserApplicationDto[]>([]);
  const [bookedApplicationIds, setBookedApplicationIds] = useState<Set<string>>(new Set());
  const [clubName, setClubName] = useState("");
  const [liveUpdates, setLiveUpdates] = useState<Record<string, LatestApplicationStateResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientId = useMemo(() => createRealtimeClientId(), []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentBoardClubId();
      if (!clubId) throw new Error("No club assigned to this board member.");

      const [departmentsResponse, applicationsResponse, allClubs, bookedSlots] = await Promise.all([
        getDepartmentsForClub(clubId),
        boardApi.getApplicationsByClub(clubId),
        getAllClubs(),
        boardApi.getBookedInterviewSlots(clubId),
      ]);

      setDepartments(departmentsResponse);
      setApplications(applicationsResponse);
      setBookedApplicationIds(new Set(bookedSlots.map((slot) => slot.applicationId)));
      setClubName(allClubs.find((c) => c.clubId === clubId)?.clubName ?? "");

      const stateSnapshots = await getLatestApplicationStates(
        applicationsResponse
          .filter((application) => shouldHydrateLatestState(application.applicationStatus))
          .map((application) => application.applicationId),
      ).catch((hydrateError) => {
        console.error("[useBoardDepartments] latest-state hydration failed", hydrateError);
        return [] as LatestApplicationStateResponse[];
      });

      setLiveUpdates(() => {
        const next: Record<string, LatestApplicationStateResponse> = {};
        for (const state of stateSnapshots) next[state.applicationId] = state;
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setDepartments([]);
      setApplications([]);
      setBookedApplicationIds(new Set());
      setClubName("");
      setLiveUpdates({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const applicationIds = useMemo(
    () => applications.map((a) => a.applicationId),
    [applications],
  );

  useEffect(() => {
    if (applicationIds.length === 0) return;

    return subscribeToApplicationStates({
      clientId,
      applicationIds,
      onMessage: (payload) => {
        setLiveUpdates((prev) => ({ ...prev, [payload.applicationId]: payload }));
      },
      onError: (err) => {
        console.error("[useBoardDepartments] SSE error", err);
      },
    });
  }, [applicationIds, clientId]);

  const data = useMemo<BoardDepartment[]>(() => {
    return departments.map((dept) => {
      const deptApps = applications.filter((app) => app.departmentId === dept.departmentId);

      const counts = deptApps.reduce(
        (acc, app) => {
          const live = liveUpdates[app.applicationId];
          const status = live
            ? (inferStatusFromUpdate(live) ?? normalizeBaseStatus(app.applicationStatus))
            : normalizeBaseStatus(app.applicationStatus);

          if (live && isConcludedApplicationState(live)) {
            if (live.conclusionResult === 4) acc.rejectedCount += 1;
            else acc.approvedCount += 1;
          } else if (live && isAfterInterviewReviewState(live)) {
            if (
              live.currentNumberOfPostInterviewApprovals >=
              live.requiredNumberOfApprovals
            ) {
              acc.approvedCount += 1;
            } else {
              acc.pendingCount += 1;
            }
          } else if (live && isHibernatedApplicationState(live)) {
            acc.approvedCount += 1;
          } else if (bookedApplicationIds.has(app.applicationId)) {
            acc.pendingCount += 1;
          } else if (live && isApprovedApplicationState(live)) {
            acc.approvedCount += 1;
          } else if (status === "Approved" || status === "InterviewPending") {
            acc.approvedCount += 1;
          } else if (status === "Rejected") {
            acc.rejectedCount += 1;
          } else {
            acc.pendingCount += 1;
          }

          return acc;
        },
        { approvedCount: 0, rejectedCount: 0, pendingCount: 0 },
      );

      return {
        clubId: dept.clubId,
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        description: dept.description,
        targetSpots: dept.numberOfOpenPositions,
        totalApplicants: deptApps.length,
        approvedCount: counts.approvedCount,
        rejectedCount: counts.rejectedCount,
        pendingCount: counts.pendingCount,
      };
    });
  }, [departments, applications, bookedApplicationIds, liveUpdates]);

  return { data, clubName, loading, error, refetch: load };
}
