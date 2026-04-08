import { useEffect, useMemo, useState } from "react";
import type { ApplicationDetail } from "../types/boardTypes";
import {
  boardApi,
  resolveCurrentBoardClubId,
  resolveCurrentUserId,
} from "../../../services/board/boardApi";
import { getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import {
  applyUpdateToApplicationDetail,
  normalizeBaseStatus,
} from "../utils/applicationLiveState";

function buildApplicantName(userId: string): string {
  return `Applicant ${userId.slice(0, 8)}`;
}

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

      if (!clubId) {
        throw new Error("No clubId found in localStorage.");
      }

      const [applications, departments, latestStates] = await Promise.all([
        boardApi.getApplicationsByClub(clubId),
        boardApi.getDepartmentsByClub(clubId),
        getLatestApplicationStates([applicationId]),
      ]);

      const application = applications.find(
        (item) => item.applicationId === applicationId,
      );

      if (!application) {
        throw new Error("Application not found.");
      }

      const department = departments.find(
        (item) => item.departmentId === application.departmentId,
      );

      const mapped: ApplicationDetail = {
        id: application.applicationId,
        applicantName: buildApplicantName(application.userId),
        applicantEmail: "",
        status: normalizeBaseStatus(application.applicationStatus),
        approvalsCount: 0,
        requiredApprovals: 0,
        myVote: null,
        submittedAt: new Date().toISOString(),
        departmentId: application.departmentId,
        departmentName: department?.departmentName ?? "Department",
        clubId,
        userId: application.userId,
        answers: Object.entries(application.questionnaire ?? {}).map(
          ([question, answer]) => ({
            question,
            answer: String(answer ?? ""),
          }),
        ),
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
      onError: (streamError) => {
        console.error("[useBoardApplicationDetail] SSE stream error", streamError);
      },
    });
  }, [applicationId, clientId]);

  return { data, setData, loading, error, refetch: load };
}
