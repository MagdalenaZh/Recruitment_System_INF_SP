import { useState, useCallback, useEffect, useMemo } from "react";
import { boardApi, resolveCurrentBoardClubId, resolveCurrentUserId } from "../../../services/board/boardApi";
import { getAllClubs, getDepartmentsForClub, getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import {
  createRealtimeClientId,
  subscribeToApplicationStates,
} from "../../../services/applications/applicationStateStream";
import type { BookedInterviewSlotDto } from "../../../types/board/boardApiTypes";
import type { UserApplicationDto } from "../../../types/account/accountApplications";
import {
  isAfterInterviewReviewState,
  isConcludedApplicationState,
  isHibernatedApplicationState,
  type LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import type {
  BoardInterviewSlot,
  BoardInterviewNote,
  FinalInterviewDecision,
} from "../types/boardTypes";

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function deriveFinalDecision(
  applicationId: string,
  stateMap: Record<string, ReturnType<typeof Object.values>[number]>,
): FinalInterviewDecision | null {
  const state = stateMap[applicationId];
  if (!state || !isConcludedApplicationState(state)) return null;
  if (state.conclusionResult === 5) return "Approved";
  if (state.conclusionResult === 4) return "Rejected";
  return null;
}

export function useBoardInterviews() {
  const [slots, setSlots] = useState<BoardInterviewSlot[]>([]);
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clientId = useMemo(() => createRealtimeClientId(), []);

  const applyLiveStateToSlot = useCallback(
    (
      slot: BoardInterviewSlot,
      state: LatestApplicationStateResponse,
    ): BoardInterviewSlot => {
      if (slot.applicationId !== state.applicationId) {
        return slot;
      }

      const currentUserId = resolveCurrentUserId();

      return {
        ...slot,
        decisions: slot.decisions.map((entry) => {
          const finalDecision = deriveFinalDecision(slot.applicationId, {
            [state.applicationId]: state,
          });

          let roundTwoDecision = entry.roundTwoDecision;

          if (isAfterInterviewReviewState(state) && currentUserId) {
            const userVote = Object.entries(state.userDecisionsMap).find(
              ([userId]) => userId.toLowerCase() === currentUserId.toLowerCase(),
            )?.[1];

            if (userVote === true) roundTwoDecision = "Approved";
            else if (userVote === false) roundTwoDecision = "Rejected";
          }

          // When the aggregate reaches hibernated state, round-two approvals
          // threshold has already been met and the vote map is no longer present.
          // Keep this as Approved across refreshes.
          if (isHibernatedApplicationState(state)) {
            roundTwoDecision = "Approved";
          }

          return {
            ...entry,
            roundTwoDecision,
            finalDecision: finalDecision ?? entry.finalDecision,
          };
        }),
      };
    },
    [],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const clubId = resolveCurrentBoardClubId();
      if (!clubId) throw new Error("No club assigned to this board member.");

      const [bookedSlots, allApplications, departments, allClubs] = await Promise.all([
        boardApi.getBookedInterviewSlots(clubId),
        boardApi.getApplicationsByClub(clubId),
        getDepartmentsForClub(clubId),
        getAllClubs(),
      ]);

      const resolvedClubName = allClubs.find((c) => c.clubId === clubId)?.clubName ?? "";
      setClubName(resolvedClubName);

      const appMap: Record<string, UserApplicationDto> = {};
      for (const app of allApplications) appMap[app.applicationId] = app;

      const matchedSlots: Array<{ slot: BookedInterviewSlotDto; app: UserApplicationDto }> = [];
      for (const slot of bookedSlots) {
        const app = appMap[slot.applicationId];
        if (app) matchedSlots.push({ slot, app });
      }

      const uniqueUserIds = [...new Set(matchedSlots.map(({ app }) => app.userId))];
      const userInfoResults = await Promise.allSettled(
        uniqueUserIds.map((id) => boardApi.getUserInformation(id)),
      );
      const userInfoMap: Record<string, { firstName: string; lastName: string; email: string }> = {};
      for (const result of userInfoResults) {
        if (result.status === "fulfilled") {
          userInfoMap[result.value.userId] = result.value;
        }
      }

      const bookedAppIds = matchedSlots.map(({ app }) => app.applicationId);
      const latestStates = bookedAppIds.length > 0
        ? await getLatestApplicationStates(bookedAppIds).catch((hydrateError) => {
            console.error("[useBoardInterviews] latest-state hydration failed", hydrateError);
            return [] as LatestApplicationStateResponse[];
          })
        : [];

      const stateMap: Record<string, (typeof latestStates)[number]> = {};
      for (const state of latestStates) stateMap[state.applicationId] = state;

      const deptMap: Record<string, string> = {};
      const deptTargetMap: Record<string, number> = {};
      for (const department of departments) {
        deptMap[department.departmentId] = department.departmentName;
        deptTargetMap[department.departmentId] = department.numberOfOpenPositions;
      }

      const builtSlots: BoardInterviewSlot[] = matchedSlots.map(({ slot, app }) => {
        const user = userInfoMap[app.userId];
        const candidateName = user
          ? `${user.firstName} ${user.lastName}`.trim()
          : app.userId;

        return {
          id: app.applicationId,
          applicationId: app.applicationId,
          clubId,
          clubName: resolvedClubName,
          departmentId: app.departmentId,
          departmentName: deptMap[app.departmentId] ?? "Unknown",
          date: formatDate(slot.startTime),
          startTime: formatTime(slot.startTime),
          endTime: formatTime(slot.endTime),
          startAt: slot.startTime,
          endAt: slot.endTime,
          candidateName,
          candidateEmail: user?.email ?? "",
          answers: Object.entries(app.questionnaire ?? {}).map(([question, answer], i) => ({
            id: `q-${i}`,
            question,
            answer: String(answer ?? ""),
          })),
          attachments: [],
          notes: [],
          decisions: [
            {
              departmentId: app.departmentId,
              departmentName: deptMap[app.departmentId] ?? "Unknown",
              roundOneStatus: "Approved",
              roundTwoDecision: null,
              finalDecision: deriveFinalDecision(app.applicationId, stateMap),
              targetSpots: deptTargetMap[app.departmentId] ?? 0,
            },
          ],
        };
      });

      const hydratedSlots = builtSlots.map((slot) => {
        const live = stateMap[slot.applicationId];
        return live ? applyLiveStateToSlot(slot, live) : slot;
      });

      setSlots(hydratedSlots);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSlots([]);
      setClubName("");
    } finally {
      setLoading(false);
    }
  }, [applyLiveStateToSlot]);

  const addNote = useCallback((slotId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const currentUserId = resolveCurrentUserId();
    const note: BoardInterviewNote = {
      id: `note-${Date.now()}`,
      author: currentUserId ?? "Board member",
      createdAt: new Date().toLocaleString(),
      text: trimmed,
    };

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, notes: [...slot.notes, note] } : slot,
      ),
    );
  }, []);

  const submitDecision = useCallback(
    async (applicationId: string, departmentId: string, decision: FinalInterviewDecision) => {
      if (decision === "Approved") {
        await boardApi.afterInterviewApproveApplication(applicationId);
      } else {
        await boardApi.afterInterviewDisapproveApplication(applicationId);
      }

      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.applicationId !== applicationId) return slot;

          return {
            ...slot,
            decisions: slot.decisions.map((entry) =>
              entry.departmentId === departmentId
                ? { ...entry, roundTwoDecision: decision }
                : entry,
            ),
          };
        }),
      );
    },
    [],
  );

  const applicationIdsKey = useMemo(() => {
    return [...new Set(slots.map((slot) => slot.applicationId))]
      .sort()
      .join(",");
  }, [slots]);

  useEffect(() => {
    const applicationIds = applicationIdsKey
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (applicationIds.length === 0) return;

    return subscribeToApplicationStates({
      clientId,
      applicationIds,
      onMessage: (payload) => {
        setSlots((prev) => prev.map((slot) => applyLiveStateToSlot(slot, payload)));
      },
      onError: (streamError) => {
        console.error("[useBoardInterviews] SSE error", streamError);
      },
    });
  }, [applicationIdsKey, clientId, applyLiveStateToSlot]);

  return { slots, setSlots, clubName, loading, error, load, addNote, submitDecision };
}
