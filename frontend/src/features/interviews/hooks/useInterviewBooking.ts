import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bookInterviewSlot,
  getAvailableInterviewSlotsForClub,
} from "../api/interviewApi";
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
import {
  isAfterInterviewReviewState,
  isApprovedApplicationState,
  isConcludedApplicationState,
  isHibernatedApplicationState,
  type LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import type {
  ApprovedInterviewApplication,
  InterviewSlot,
  UserApplication,
} from "../types/interviewTypes";
import type { ClubDto, DepartmentDto } from "../../../types/account/accountApplications";

function normalizeStatus(status: string | number | null | undefined): string {
  if (status === null || status === undefined) return "";

  if (typeof status === "number") {
    switch (status) {
      case 3:
        return "interviewscheduled";
      case 5:
        return "accepted";
      case 4:
        return "rejected";
      case 2:
        return "inprogress";
      case 6:
        return "inreview";
      case 1:
        return "applicationsubmited";
      default:
        return String(status).toLowerCase();
    }
  }

  return status.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function isApprovedApplication(app: UserApplication): boolean {
  const normalized = normalizeStatus(app.status ?? app.applicationStatus);

  return (
    !!app.interviewSlot ||
    normalized === "interviewscheduled" ||
    normalized === "applicationapproved" ||
    normalized === "approvedstate" ||
    normalized === "approved"
  );
}

function toApprovedInterviewApplications(
  apps: UserApplication[]
): ApprovedInterviewApplication[] {
  return apps
    .filter(isApprovedApplication)
    .filter((app) => !app.interviewSlot)
    .filter((app) => !!app.applicationId && !!app.clubId)
    .map((app) => ({
      applicationId: app.applicationId,
      clubId: app.clubId!,
      clubName: app.clubName || "Club interview",
      departmentName: app.departmentName,
      interviewSlot: app.interviewSlot,
    }));
}

function getDerivedInterviewStatus(
  state: LatestApplicationStateResponse | undefined,
  fallbackStatus: string | number | null | undefined,
): string | number | null | undefined {
  if (!state) return fallbackStatus;
  if (isConcludedApplicationState(state)) {
    return state.conclusionResult === 4 ? "rejected" : "accepted";
  }
  if (isAfterInterviewReviewState(state)) return "interviewscheduled";
  if (isApprovedApplicationState(state)) return "approved";
  if (isHibernatedApplicationState(state)) return "approved";
  return fallbackStatus;
}

export function useInterviewBooking(userId?: string) {
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [latestStates, setLatestStates] = useState<Record<string, LatestApplicationStateResponse>>({});
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const clientId = useMemo(() => createRealtimeClientId(), []);

  const hydratedApplications = useMemo(
    () =>
      applications.map((application) =>
        applyLatestStateToUserApplication(
          application,
          latestStates[application.applicationId],
        ),
      ),
    [applications, latestStates],
  );

  const approvedApplications = useMemo(
    () => toApprovedInterviewApplications(hydratedApplications),
    [hydratedApplications]
  );

  const selectedApplication = useMemo(
    () =>
      approvedApplications.find(
        (app) => app.applicationId === selectedApplicationId
      ) || approvedApplications[0] || null,
    [approvedApplications, selectedApplicationId]
  );

  const loadApplications = useCallback(async () => {
    if (!userId) return;

    setLoadingApplications(true);
    setError("");

    try {
      const [data, clubs] = await Promise.all([
        getApplicationsForCurrentUser(),
        getAllClubs(),
      ]);
      const initialStates = getCachedLatestApplicationStates(
        data.map((application) => application.applicationId),
      );
      const latestStateMap = new Map<string, LatestApplicationStateResponse>(
        initialStates.map((state) => [state.applicationId, state]),
      );

      const departmentLists = await Promise.all(
        clubs.map((club: ClubDto) => getDepartmentsForClub(club.clubId)),
      );
      const departments = departmentLists.flat();
      const departmentMap = new Map<string, DepartmentDto>(
        departments.map((department) => [department.departmentId, department]),
      );
      const clubNameMap = new Map<string, string>(
        clubs.map((club: ClubDto) => [club.clubId, club.clubName]),
      );

      const enrichedData: UserApplication[] = data.map((application) => {
        const department = application.departmentId
          ? departmentMap.get(application.departmentId)
          : undefined;
        const clubId = department?.clubId;
        const latestState = latestStateMap.get(application.applicationId);
        const interviewSlot =
          latestState && "scheduledTime" in latestState && latestState.scheduledTime
            ? {
                slotId: latestState.scheduledTime.slotId,
                startTime: latestState.scheduledTime.startTime,
                endTime: latestState.scheduledTime.endTime,
              }
            : undefined;

        return {
          ...application,
          clubId,
          clubName: clubId ? clubNameMap.get(clubId) : undefined,
          departmentName: department?.departmentName,
          status: getDerivedInterviewStatus(
            latestState,
            application.applicationStatus,
          ),
          interviewSlot,
        };
      });

      setApplications(enrichedData);
      setLatestStates(() => {
        const next: Record<string, LatestApplicationStateResponse> = {};
        for (const state of initialStates) {
          next[state.applicationId] = state;
        }
        return next;
      });

      const approved = toApprovedInterviewApplications(
        enrichedData.map((application) =>
          applyLatestStateToUserApplication(
            application,
            latestStateMap.get(application.applicationId),
          ),
        ),
      );
      if (approved.length > 0) {
        setSelectedApplicationId((current) =>
          current || approved[0].applicationId
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  }, [userId]);

  const loadSlots = useCallback(async () => {
    if (!selectedApplication?.clubId) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setError("");

    try {
      const data = await getAvailableInterviewSlotsForClub(
        selectedApplication.clubId
      );
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview slots");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedApplication?.clubId]);

  const submitBooking = useCallback(
    async (slotId: string) => {
      if (!selectedApplication) {
        throw new Error("No approved application selected.");
      }
      const selectedSlot = slots.find((slot) => slot.slotId === slotId);
      if (!selectedSlot) {
        throw new Error("Selected interview slot was not found.");
      }

      setBooking(true);
      setError("");
      setSuccessMessage("");

      try {
        const result = await bookInterviewSlot({
          applicationId: selectedApplication.applicationId,
          slot: selectedSlot,
        });

        setSuccessMessage(result.message || "Interview slot booked successfully.");
        await loadApplications();
        setSlots([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to book interview slot");
        throw err;
      } finally {
        setBooking(false);
      }
    },
    [selectedApplication, slots, loadSlots]
  );

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const applicationIds = useMemo(
    () => hydratedApplications.map((application) => application.applicationId),
    [hydratedApplications],
  );

  useEffect(() => {
    if (applicationIds.length === 0) return;
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
        console.error("[useInterviewBooking] SSE error", streamError);
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
          .catch(() => {
            return;
          });
      },
    });
  }, [applicationIds, clientId]);

  useEffect(() => {
    if (selectedApplication?.clubId) {
      loadSlots();
    } else {
      setSlots([]);
    }
  }, [selectedApplication?.clubId, loadSlots]);

  return {
    applications: hydratedApplications,
    approvedApplications,
    selectedApplication,
    selectedApplicationId,
    setSelectedApplicationId,
    slots,
    loadingApplications,
    loadingSlots,
    booking,
    error,
    successMessage,
    refresh: async () => {
      await loadApplications();
      await loadSlots();
    },
    submitBooking,
  };
}

function applyLatestStateToUserApplication(
  application: UserApplication,
  latestState: LatestApplicationStateResponse | undefined,
): UserApplication {
  const interviewSlot =
    latestState && "scheduledTime" in latestState && latestState.scheduledTime
      ? {
          slotId: latestState.scheduledTime.slotId,
          startTime: latestState.scheduledTime.startTime,
          endTime: latestState.scheduledTime.endTime,
        }
      : application.interviewSlot;

  return {
    ...application,
    status: getDerivedInterviewStatus(latestState, application.applicationStatus),
    interviewSlot,
  };
}
