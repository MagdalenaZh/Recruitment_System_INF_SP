import { useEffect, useMemo, useState } from "react";
import { boardApi, resolveCurrentBoardClubId } from "../../../services/board/boardApi";
import {
  getAllClubs,
  getCachedLatestApplicationStates,
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
import {
  isConcludedApplicationState,
} from "../../../services/applications/applicationStateTypes";

function shouldHydrateLatestState(applicationStatus: number): boolean {
  return applicationStatus !== 4 && applicationStatus !== 5;
}

export function useBoardDepartments() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [applications, setApplications] = useState<UserApplicationDto[]>([]);
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

      const [departmentsResponse, applicationsResponse, allClubs] = await Promise.all([
        getDepartmentsForClub(clubId),
        boardApi.getApplicationsByClub(clubId),
        getAllClubs(),
      ]);

      setDepartments(departmentsResponse);
      setApplications(applicationsResponse);
      setClubName(allClubs.find((c) => c.clubId === clubId)?.clubName ?? "");

      const hydratableApplicationIds = applicationsResponse
        .filter((application) => shouldHydrateLatestState(application.applicationStatus))
        .map((application) => application.applicationId);
      const stateSnapshots = getCachedLatestApplicationStates(hydratableApplicationIds);

      setLiveUpdates(() => {
        const next: Record<string, LatestApplicationStateResponse> = {};
        for (const state of stateSnapshots) next[state.applicationId] = state;
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setDepartments([]);
      setApplications([]);
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
    let recoveredFromError = false;

    return subscribeToApplicationStates({
      clientId,
      applicationIds,
      onMessage: (payload) => {
        recoveredFromError = false;
        setLiveUpdates((prev) => ({ ...prev, [payload.applicationId]: payload }));
      },
      onError: (err) => {
        console.error("[useBoardDepartments] SSE error", err);
        if (recoveredFromError) {
          return;
        }

        recoveredFromError = true;
        void getLatestApplicationStates(applicationIds)
          .then((states) => {
            if (states.length === 0) return;

            setLiveUpdates((prev) => {
              const next: Record<string, LatestApplicationStateResponse> = { ...prev };
              for (const state of states) {
                next[state.applicationId] = state;
              }
              return next;
            });
          })
          .catch((hydrateError) => {
            console.error(
              "[useBoardDepartments] snapshot recovery failed",
              hydrateError,
            );
          });
      },
    });
  }, [applicationIds, clientId]);

  const data = useMemo<BoardDepartment[]>(() => {
    return departments.map((dept) => {
      const deptApps = applications.filter((app) => app.departmentId === dept.departmentId);

      const counts = deptApps.reduce(
        (acc, app) => {
          const live = liveUpdates[app.applicationId];

          if (live && isConcludedApplicationState(live)) {
            if (live.conclusionResult === 4) acc.rejectedCount += 1;
            else acc.approvedCount += 1;
          } else if (app.applicationStatus === 5) {
            acc.approvedCount += 1;
          } else if (app.applicationStatus === 4) {
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
  }, [departments, applications, liveUpdates]);

  return { data, clubName, loading, error, refetch: load };
}
