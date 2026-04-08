import { useEffect, useMemo, useState } from "react";
import {
  getApplicationsForCurrentUser,
  getAllClubs,
  getDepartmentsForClub,
} from "../../../services/account/accountApplications.api";
import { getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type {
  LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import {
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

  if (isProcessingApplicationState(state)) {
    return "UnderReview";
  }

  if (isInitialApplicationState(state)) {
    return "Submitted";
  }

  return "Interview";
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

  return {
    ...card,
    stage: nextStage ?? card.stage,
    updatedAt: new Date().toISOString(),
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

        const stateSnapshots = await getLatestApplicationStates(
          mapped.map((application) => application.id),
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

    return subscribeToApplicationStates({
      clientId,
      applicationIds,
      onMessage: (state) => {
        setLatestStates((prev) => ({
          ...prev,
          [state.applicationId]: state,
        }));
      },
      onError: (streamError) => {
        console.error("[useAccountApplications] application stream error", streamError);
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
