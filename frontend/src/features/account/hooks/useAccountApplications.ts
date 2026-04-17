import { useEffect, useMemo, useState } from "react";
import {
  getApplicationsForCurrentUser,
  getAllClubs,
  getCachedLatestApplicationStates,
  getDepartmentsForClub,
  getLatestApplicationStates,
} from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type {
  LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import {
  isAfterInterviewReviewState,
  isApprovedApplicationState,
  isConcludedApplicationState,
  isHibernatedApplicationState,
  isInitialApplicationState,
  isProcessingApplicationState,
} from "../../../services/applications/applicationStateTypes";
import type {
  AccountApplicationCard,
  ClubDto,
  DepartmentDto,
  UserApplicationDto,
} from "../../../types/account/accountApplications";
import type { ApplicationStage } from "../../../types/account/applicationStage";

function shouldHydrateLatestState(applicationStatus: number): boolean {
  return applicationStatus !== 4 && applicationStatus !== 5;
}

function mapApplicationStatusToStage(status: number): ApplicationStage {
  switch (status) {
    case 1:
      return "Submitted";
    case 2:
      return "UnderReview";
    case 3:
      return "Interview";
    case 4:
      return "Rejected";
    case 5:
      return "Accepted";
    case 6:
      return "Interview";
    default:
      return "Submitted";
  }
}

function mapLatestStateToStage(
  state: LatestApplicationStateResponse,
): ApplicationStage | null {
  if (isConcludedApplicationState(state)) {
    return state.conclusionResult === 4 ? "Rejected" : "Accepted";
  }

  if (isHibernatedApplicationState(state)) {
    return "Interview";
  }

  if (isAfterInterviewReviewState(state)) {
    return "Interview";
  }

  if (isApprovedApplicationState(state)) {
    return "Interview";
  }

  if (isProcessingApplicationState(state)) {
    return "UnderReview";
  }

  if (isInitialApplicationState(state)) {
    return "Submitted";
  }

  return "UnderReview";
}

function buildDepartmentMap(
  departments: DepartmentDto[],
  clubs: ClubDto[],
): Map<string, { departmentName: string; clubName: string }> {
  const clubMap = new Map(
    clubs.map((club: ClubDto) => [club.clubId, club.clubName]),
  );

  const result = new Map<string, { departmentName: string; clubName: string }>();

  for (const dept of departments) {
    result.set(dept.departmentId, {
      departmentName: dept.departmentName,
      clubName: clubMap.get(dept.clubId) ?? "Unknown Club",
    });
  }

  return result;
}

function applyLatestStateToCard(
  card: AccountApplicationCard,
  state: LatestApplicationStateResponse | undefined,
): AccountApplicationCard {
  if (!state) {
    return card;
  }

  const nextStage = mapLatestStateToStage(state);

  const interviewSlot = isAfterInterviewReviewState(state)
    ? { startTime: state.scheduledTime.startTime, endTime: state.scheduledTime.endTime }
    : "scheduledTime" in state && state.scheduledTime
      ? { startTime: state.scheduledTime.startTime, endTime: state.scheduledTime.endTime }
      : card.interviewSlot;

  return {
    ...card,
    stage: nextStage ?? card.stage,
    updatedAt: new Date().toISOString(),
    interviewSlot,
  };
}

export function useAccountApplications() {
  const [applications, setApplications] = useState<AccountApplicationCard[]>([]);
  const [latestStates, setLatestStates] = useState<
    Record<string, LatestApplicationStateResponse>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = useMemo(() => createRealtimeClientId(), []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [userApplications, clubs] = await Promise.all([
          getApplicationsForCurrentUser(),
          getAllClubs(),
        ]);

        const departmentLists = await Promise.all(
          clubs.map((club: ClubDto) => getDepartmentsForClub(club.clubId)),
        );

        const allDepartments = departmentLists.flat();
        const departmentMap = buildDepartmentMap(allDepartments, clubs);

        const mapped: AccountApplicationCard[] = userApplications.map(
          (application: UserApplicationDto) => {
            const departmentInfo = departmentMap.get(application.departmentId);

            return {
              id: application.applicationId,
              clubName: departmentInfo?.clubName ?? "Unknown Club",
              departmentName:
                departmentInfo?.departmentName ?? "Unknown Department",
              stage: mapApplicationStatusToStage(application.applicationStatus),
              updatedAt: new Date().toISOString(),
            };
          },
        );

        setApplications(mapped);

        const hydratableApplicationIds = userApplications
          .filter((application) => shouldHydrateLatestState(application.applicationStatus))
          .map((application) => application.applicationId);
        const stateSnapshots = getCachedLatestApplicationStates(
          hydratableApplicationIds,
        );

        setLatestStates(() => {
          const next: Record<string, LatestApplicationStateResponse> = {};
          for (const state of stateSnapshots) {
            next[state.applicationId] = state;
          }
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load applications.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const applicationIds = useMemo(
    () => applications.map((application) => application.id),
    [applications],
  );

  useEffect(() => {
    if (applicationIds.length === 0) {
      return;
    }
    let recoveredFromError = false;

    return subscribeToApplicationStates({
      clientId,
      applicationIds,
      onMessage: (state) => {
        recoveredFromError = false;
        setLatestStates((prev) => ({
          ...prev,
          [state.applicationId]: state,
        }));
      },
      onError: (streamError) => {
        console.error("[useAccountApplications] application stream error", streamError);
        if (recoveredFromError) {
          return;
        }

        recoveredFromError = true;
        void getLatestApplicationStates(applicationIds)
          .then((states) => {
            if (states.length === 0) return;

            setLatestStates((prev) => {
              const next = { ...prev };
              for (const state of states) {
                next[state.applicationId] = state;
              }
              return next;
            });
          })
          .catch((snapshotError) => {
            console.error(
              "[useAccountApplications] snapshot recovery failed",
              snapshotError,
            );
          });
      },
    });
  }, [applicationIds, clientId]);

  const hydratedApplications = useMemo(() => {
    return applications.map((application) =>
      applyLatestStateToCard(application, latestStates[application.id]),
    );
  }, [applications, latestStates]);

  return {
    applications: hydratedApplications,
    loading,
    error,
  };
}
