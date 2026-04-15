import { useEffect, useMemo, useState } from "react";
import { boardApi, resolveCurrentBoardClubId, resolveCurrentUserId } from "../../../services/board/boardApi";
import { getAllClubs, getDepartmentsForClub, getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type { UserApplicationDto } from "../../../types/account/accountApplications";
import type { UserInfoDto } from "../../../types/board/boardApiTypes";
import type { LatestApplicationStateResponse } from "../../../services/applications/applicationStateTypes";
import type { ApplicationListItem, ApplicationStatus } from "../types/boardTypes";
import { applyUpdateToApplicationListItem, normalizeBaseStatus } from "../utils/applicationLiveState";

function shouldHydrateLatestState(applicationStatus: number): boolean {
  return applicationStatus !== 4 && applicationStatus !== 5;
}

function inferFallbackApprovals(
  applicationStatus: number,
  requiredApprovals: number,
): Pick<ApplicationListItem, "approvalsCount" | "requiredApprovals"> {
  if (applicationStatus === 3 || applicationStatus === 5 || applicationStatus === 6) {
    return {
      approvalsCount: requiredApprovals,
      requiredApprovals,
    };
  }

  return {
    approvalsCount: 0,
    requiredApprovals,
  };
}

export function useDepartmentApplications(departmentId?: string) {
  const [applications, setApplications] = useState<UserApplicationDto[]>([]);
  const [bookedApplicationIds, setBookedApplicationIds] = useState<Set<string>>(new Set());
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfoDto>>({});
  const [departmentName, setDepartmentName] = useState("Department");
  const [clubRequiredApprovals, setClubRequiredApprovals] = useState(0);
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
      if (!clubId) throw new Error("No club assigned to this board member.");

      const [applicationsResponse, departmentsResponse, allClubs] = await Promise.all([
        boardApi.getApplicationsByDepartment(departmentId),
        getDepartmentsForClub(clubId),
        getAllClubs(),
      ]);

      setApplications(applicationsResponse);
      const bookedSlots = await boardApi.getBookedInterviewSlots(clubId);
      setBookedApplicationIds(new Set(bookedSlots.map((slot) => slot.applicationId)));
      setDepartmentName(
        departmentsResponse.find((d) => d.departmentId === departmentId)?.departmentName ?? "Department",
      );
      setClubRequiredApprovals(
        allClubs.find((club) => club.clubId === clubId)?.requiredApprovals ?? 0,
      );

      // Fetch real name + email for every unique applicant in parallel
      const uniqueUserIds = [...new Set(applicationsResponse.map((a) => a.userId))];
      const userInfoResults = await Promise.allSettled(
        uniqueUserIds.map((id) => boardApi.getUserInformation(id)),
      );
      const infoMap: Record<string, UserInfoDto> = {};
      for (const result of userInfoResults) {
        if (result.status === "fulfilled") {
          infoMap[result.value.userId] = result.value;
        }
      }
      setUserInfoMap(infoMap);

      const stateSnapshots = await getLatestApplicationStates(
        applicationsResponse
          .filter((application) => shouldHydrateLatestState(application.applicationStatus))
          .map((application) => application.applicationId),
      ).catch((hydrateError) => {
        console.error("[useDepartmentApplications] latest-state hydration failed", hydrateError);
        return [] as LatestApplicationStateResponse[];
      });

      setLiveUpdates(() => {
        const next: Record<string, LatestApplicationStateResponse> = {};
        for (const state of stateSnapshots) next[state.applicationId] = state;
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setApplications([]);
      setBookedApplicationIds(new Set());
      setUserInfoMap({});
      setLiveUpdates({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [departmentId]);

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
        console.error("[useDepartmentApplications] SSE error", err);
      },
    });
  }, [applicationIds, clientId]);

  const currentUserId = resolveCurrentUserId();

  const data = useMemo<ApplicationListItem[]>(() => {
    return applications.map((app) => {
      const info = userInfoMap[app.userId];
      const applicantName = info
        ? `${info.firstName} ${info.lastName}`.trim()
        : app.userId;
      const fallbackApprovals = inferFallbackApprovals(
        app.applicationStatus,
        clubRequiredApprovals,
      );

      const baseItem: ApplicationListItem = {
        id: app.applicationId,
        applicantName,
        applicantEmail: info?.email ?? "",
        status: normalizeBaseStatus(app.applicationStatus),
        submittedAt: "",
        approvalsCount: fallbackApprovals.approvalsCount,
        requiredApprovals: fallbackApprovals.requiredApprovals,
        totalVotes: 0,
        approveVotes: 0,
        rejectVotes: 0,
        departmentId: app.departmentId,
        departmentName,
        userId: app.userId,
        myVote: null,
      };

      const live = liveUpdates[app.applicationId];
      const nextItem = live
        ? applyUpdateToApplicationListItem(baseItem, live, currentUserId)
        : baseItem;

      if (
        bookedApplicationIds.has(app.applicationId) &&
        nextItem.status === "InterviewPending"
      ) {
        return {
          ...nextItem,
          status: "Interview",
        };
      }

      return nextItem;
    });
  }, [applications, bookedApplicationIds, userInfoMap, departmentName, liveUpdates, currentUserId, clubRequiredApprovals]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        q.length === 0 ||
        item.applicantName.toLowerCase().includes(q) ||
        item.applicantEmail.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, statusFilter]);

  return {
    data,
    filtered,
    departmentName,
    loading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    refetch: load,
  };
}
