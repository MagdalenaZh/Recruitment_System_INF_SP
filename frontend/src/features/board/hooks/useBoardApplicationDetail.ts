import { useEffect, useState } from "react";
import type { ApplicationDetail } from "../types/boardTypes";
import {
  boardApi,
  getApplicationUpdatesUrl,
  resolveCurrentBoardClubId,
  resolveCurrentUserId,
} from "../../../services/board/boardApi";
import {
  applyUpdateToApplicationDetail,
  getApplicationIdFromUpdate,
  normalizeBaseStatus,
  type ApplicationUpdatePayload,
} from "../utils/applicationLiveState";

function buildApplicantName(userId: string): string {
  return `Applicant ${userId.slice(0, 8)}`;
}

export function useBoardApplicationDetail(applicationId?: string) {
  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      console.log("[useBoardApplicationDetail] loading", { applicationId, clubId });

      const [applications, departments] = await Promise.all([
        boardApi.getApplicationsByClub(clubId),
        boardApi.getDepartmentsByClub(clubId),
      ]);

      console.log("[useBoardApplicationDetail] raw club applications:", applications);
      console.log("[useBoardApplicationDetail] raw departments:", departments);

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

      console.log("[useBoardApplicationDetail] mapped application detail:", mapped);

      setData(mapped);
    } catch (e) {
      console.error("[useBoardApplicationDetail] load error:", e);
      setError(e instanceof Error ? e.message : "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId) return;

    const currentUserId = resolveCurrentUserId();
    const url = getApplicationUpdatesUrl();

    console.log("[useBoardApplicationDetail] opening SSE connection:", url);

    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ApplicationUpdatePayload;
        const payloadApplicationId = getApplicationIdFromUpdate(payload);

        if (!payloadApplicationId) return;
        if (payloadApplicationId.toLowerCase() !== applicationId.toLowerCase()) return;

        console.log("[useBoardApplicationDetail] SSE update received:", payload);

        setData((prev) => {
          if (!prev) return prev;
          return applyUpdateToApplicationDetail(prev, payload, currentUserId);
        });
      } catch (e) {
        console.error("[useBoardApplicationDetail] failed to parse SSE payload:", e);
      }
    };

    source.onerror = (event) => {
      console.error("[useBoardApplicationDetail] SSE error:", event);
    };

    return () => {
      console.log("[useBoardApplicationDetail] closing SSE connection");
      source.close();
    };
  }, [applicationId]);

  return { data, setData, loading, error, refetch: load };
}