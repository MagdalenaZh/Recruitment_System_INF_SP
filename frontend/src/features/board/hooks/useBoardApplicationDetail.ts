import { useEffect, useMemo, useState } from "react";
import { boardApi, resolveCurrentBoardClubId, resolveCurrentUserId } from "../../../services/board/boardApi";
import { getDepartmentsForClub, getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type { LatestApplicationStateResponse } from "../../../services/applications/applicationStateTypes";
import type { ApplicationDetail } from "../types/boardTypes";
import { applyUpdateToApplicationDetail, normalizeBaseStatus } from "../utils/applicationLiveState";

export function useBoardApplicationDetail(applicationId?: string) {
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientId = useMemo(() => createRealtimeClientId(), []);

  async function load() {
    if (!applicationId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentBoardClubId();
      if (!clubId) throw new Error("No club assigned to this board member.");

      const [applications, departments, latestStates] = await Promise.all([
        boardApi.getApplicationsByClub(clubId),
        getDepartmentsForClub(clubId),
        getLatestApplicationStates([applicationId]).catch((hydrateError) => {
          console.error("[useBoardApplicationDetail] latest-state hydration failed", hydrateError);
          return [] as LatestApplicationStateResponse[];
        }),
      ]);

      const application = applications.find((a) => a.applicationId === applicationId);
      if (!application) throw new Error("Application not found.");

      // Fetch real name and email for the applicant. If lookup fails, keep page usable.
      const userInfo = await boardApi
        .getUserInformation(application.userId)
        .catch(() => null);

      const department = departments.find((d) => d.departmentId === application.departmentId);

      const mapped: ApplicationDetail = {
        id: application.applicationId,
        applicantName: userInfo
          ? `${userInfo.firstName} ${userInfo.lastName}`.trim()
          : application.userId,
        applicantEmail: userInfo?.email ?? "",
        status: normalizeBaseStatus(application.applicationStatus),
        approvalsCount: 0,
        requiredApprovals: 0,
        totalVotes: 0,
        approveVotes: 0,
        rejectVotes: 0,
        myVote: null,
        submittedAt: "",
        departmentId: application.departmentId,
        departmentName: department?.departmentName ?? "Department",
        clubId,
        userId: application.userId,
        answers: Object.entries(application.questionnaire ?? {}).map(([question, answer]) => ({
          question,
          answer: String(answer ?? ""),
        })),
        attachments: [],
        rawApplication: application,
      };

      const currentUserId = resolveCurrentUserId();
      const hydrated = latestStates[0]
        ? applyUpdateToApplicationDetail(mapped, latestStates[0], currentUserId)
        : mapped;

      setData(hydrated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId) return;

    const currentUserId = resolveCurrentUserId();

    return subscribeToApplicationStates({
      clientId,
      applicationIds: [applicationId],
      onMessage: (payload) => {
        setData((prev) => {
          if (!prev) return prev;
          return applyUpdateToApplicationDetail(prev, payload, currentUserId);
        });
      },
      onError: (err) => {
        console.error("[useBoardApplicationDetail] SSE error", err);
      },
    });
  }, [applicationId, clientId]);

  return { data, setData, loading, error, refetch: load };
}
