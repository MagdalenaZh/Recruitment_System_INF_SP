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
  isApprovedApplicationState,
  isProcessingApplicationState,
  type LatestApplicationStateResponse,
} from "../../../services/applications/applicationStateTypes";
import type {
  BoardInterviewDepartmentStats,
  BoardInterviewSlot,
  BoardInterviewNote,
  FinalInterviewDecision,
} from "../types/boardTypes";

type CachedRoundTwoVote = {
  myVote: FinalInterviewDecision | null;
  approveVotes: number;
  rejectVotes: number;
  requiredApprovals: number;
};

function getRoundTwoVoteCacheKey(): string {
  const currentUserId = resolveCurrentUserId() ?? "anonymous";
  return `board:round-two-votes:${currentUserId}`;
}

function readRoundTwoVoteCache(): Record<string, CachedRoundTwoVote> {
  try {
    const raw = window.localStorage.getItem(getRoundTwoVoteCacheKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, CachedRoundTwoVote>;
  } catch {
    return {};
  }
}

function writeRoundTwoVoteCache(
  applicationId: string,
  value: CachedRoundTwoVote,
): void {
  try {
    const current = readRoundTwoVoteCache();
    current[applicationId] = value;
    window.localStorage.setItem(
      getRoundTwoVoteCacheKey(),
      JSON.stringify(current),
    );
  } catch {
    // Ignore local cache write failures.
  }
}

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

function deriveFinalDecisionFromStatus(applicationStatus: number): FinalInterviewDecision | null {
  if (applicationStatus === 5) return "Approved";
  if (applicationStatus === 4) return "Rejected";
  return null;
}

function shouldHydrateLatestState(applicationStatus: number): boolean {
  return applicationStatus !== 4 && applicationStatus !== 5;
}

export function useBoardInterviews() {
  const [slots, setSlots] = useState<BoardInterviewSlot[]>([]);
  const [departmentStats, setDepartmentStats] = useState<BoardInterviewDepartmentStats[]>([]);
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
          let roundTwoApproveVotes = entry.roundTwoApproveVotes;
          let roundTwoRejectVotes = entry.roundTwoRejectVotes;
          let requiredApprovals = entry.requiredApprovals;
          const cachedVote = readRoundTwoVoteCache()[slot.applicationId];

          if (cachedVote) {
            roundTwoDecision = cachedVote.myVote;
            roundTwoApproveVotes = cachedVote.approveVotes;
            roundTwoRejectVotes = cachedVote.rejectVotes;
            requiredApprovals = cachedVote.requiredApprovals;
          }

          if (isAfterInterviewReviewState(state) && currentUserId) {
            let approveVotes = 0;
            let rejectVotes = 0;
            for (const vote of Object.values(state.userDecisionsMap)) {
              if (vote === true) approveVotes += 1;
              else if (vote === false) rejectVotes += 1;
            }

            roundTwoApproveVotes = approveVotes;
            roundTwoRejectVotes = rejectVotes;
            requiredApprovals = state.requiredNumberOfApprovals;

            const userVote = Object.entries(state.userDecisionsMap).find(
              ([userId]) => userId.toLowerCase() === currentUserId.toLowerCase(),
            )?.[1];

            if (userVote === true) roundTwoDecision = "Approved";
            else if (userVote === false) roundTwoDecision = "Rejected";

            writeRoundTwoVoteCache(slot.applicationId, {
              myVote: roundTwoDecision,
              approveVotes,
              rejectVotes,
              requiredApprovals,
            });
          }

          // When the aggregate reaches hibernated state, round-two approvals
          // threshold has already been met and the vote map may no longer be present.
          if (isHibernatedApplicationState(state)) {
            roundTwoApproveVotes = Math.max(roundTwoApproveVotes, requiredApprovals);
          }

          if (isConcludedApplicationState(state)) {
            roundTwoApproveVotes = Math.max(roundTwoApproveVotes, requiredApprovals);
          }

          return {
            ...entry,
            roundTwoDecision,
            roundTwoApproveVotes,
            roundTwoRejectVotes,
            requiredApprovals,
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

      const currentClub = allClubs.find((c) => c.clubId === clubId);
      const clubRequiredApprovals = currentClub?.requiredApprovals ?? 0;
      const roundTwoVoteCache = readRoundTwoVoteCache();
      const notesResults = await Promise.allSettled(
        matchedSlots.map(({ app }) => boardApi.getApplicationNotes(app.applicationId)),
      );
      const notesMap: Record<string, BoardInterviewNote[]> = {};
      for (let i = 0; i < matchedSlots.length; i += 1) {
        const applicationId = matchedSlots[i].app.applicationId;
        const result = notesResults[i];
        if (result.status !== "fulfilled") {
          notesMap[applicationId] = [];
          continue;
        }

        notesMap[applicationId] = result.value.map((note) => ({
          id: note.noteId,
          authorId: note.userId,
          authorName: note.authorName,
          createdAt: null,
          text: note.content,
        }));
      }

      const hydratableBookedAppIds = matchedSlots
        .map(({ app }) => app)
        .filter((app) => shouldHydrateLatestState(app.applicationStatus))
        .map((app) => app.applicationId);

      const latestStates = hydratableBookedAppIds.length > 0
        ? await getLatestApplicationStates(hydratableBookedAppIds).catch((hydrateError) => {
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

      const bookedApplicationIds = new Set(bookedSlots.map((slot) => slot.applicationId));

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
          notes: notesMap[app.applicationId] ?? [],
          decisions: [
            {
              departmentId: app.departmentId,
              departmentName: deptMap[app.departmentId] ?? "Unknown",
              roundOneStatus: "Approved",
              roundTwoDecision:
                roundTwoVoteCache[app.applicationId]?.myVote ?? null,
              finalDecision:
                deriveFinalDecision(app.applicationId, stateMap) ??
                deriveFinalDecisionFromStatus(app.applicationStatus),
              roundTwoApproveVotes:
                roundTwoVoteCache[app.applicationId]?.approveVotes ??
                (app.applicationStatus === 5 || app.applicationStatus === 6
                  ? Math.max(clubRequiredApprovals, 1)
                  : 0),
              roundTwoRejectVotes:
                roundTwoVoteCache[app.applicationId]?.rejectVotes ?? 0,
              requiredApprovals:
                roundTwoVoteCache[app.applicationId]?.requiredApprovals ??
                clubRequiredApprovals,
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
      setDepartmentStats(
        departments
          .map((department) => {
            const departmentApplications = allApplications.filter(
              (application) => application.departmentId === department.departmentId,
            );

            let approvedCount = 0;
            let rejectedCount = 0;
            let pendingCount = 0;

            for (const application of departmentApplications) {
              const live = stateMap[application.applicationId];

              if (live && isConcludedApplicationState(live)) {
                if (live.conclusionResult === 4) rejectedCount += 1;
                else approvedCount += 1;
                continue;
              }

              if (live && isAfterInterviewReviewState(live)) {
                if (
                  live.currentNumberOfPostInterviewApprovals >=
                  live.requiredNumberOfApprovals
                ) {
                  approvedCount += 1;
                } else {
                  pendingCount += 1;
                }
                continue;
              }

              if (live && isHibernatedApplicationState(live)) {
                approvedCount += 1;
                continue;
              }

              if (bookedApplicationIds.has(application.applicationId)) {
                pendingCount += 1;
                continue;
              }

              if (live && isApprovedApplicationState(live)) {
                approvedCount += 1;
                continue;
              }

              if (live && isProcessingApplicationState(live)) {
                pendingCount += 1;
                continue;
              }

              if (application.applicationStatus === 4) rejectedCount += 1;
              else if (application.applicationStatus === 3) approvedCount += 1;
              else pendingCount += 1;
            }

            return {
              departmentId: department.departmentId,
              departmentName: department.departmentName,
              totalApplicants: departmentApplications.length,
              approvedCount,
              rejectedCount,
              pendingCount,
              targetSpots: department.numberOfOpenPositions,
            };
          })
          .sort((left, right) =>
            left.departmentName.localeCompare(right.departmentName),
          ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSlots([]);
      setDepartmentStats([]);
      setClubName("");
    } finally {
      setLoading(false);
    }
  }, [applyLiveStateToSlot]);

  const addNote = useCallback(async (slotId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const slot = slots.find((entry) => entry.id === slotId);
    if (!slot) return;

    await boardApi.createApplicationNote(slot.applicationId, trimmed);

    const refreshedNotes = await boardApi.getApplicationNotes(slot.applicationId);
    const mappedNotes: BoardInterviewNote[] = refreshedNotes.map((note) => ({
      id: note.noteId,
      authorId: note.userId,
      authorName: note.authorName,
      createdAt: null,
      text: note.content,
    }));

    setSlots((prev) =>
      prev.map((entry) =>
        entry.id === slotId ? { ...entry, notes: mappedNotes } : entry,
      ),
    );
  }, [slots]);

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
                ? (() => {
                    const nextApproveVotes =
                      decision === "Approved"
                        ? Math.max(
                            entry.roundTwoApproveVotes,
                            entry.roundTwoApproveVotes + 1,
                          )
                        : entry.roundTwoApproveVotes;
                    const nextRejectVotes =
                      decision === "Rejected"
                        ? Math.max(
                            entry.roundTwoRejectVotes,
                            entry.roundTwoRejectVotes + 1,
                          )
                        : entry.roundTwoRejectVotes;

                    writeRoundTwoVoteCache(applicationId, {
                      myVote: decision,
                      approveVotes: nextApproveVotes,
                      rejectVotes: nextRejectVotes,
                      requiredApprovals: entry.requiredApprovals,
                    });

                    return {
                      ...entry,
                      roundTwoDecision: decision,
                      roundTwoApproveVotes: nextApproveVotes,
                      roundTwoRejectVotes: nextRejectVotes,
                    };
                  })()
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

  const refreshNotes = useCallback(async (slotId: string) => {
    const slot = slots.find((entry) => entry.id === slotId);
    if (!slot) return;

    const refreshedNotes = await boardApi.getApplicationNotes(slot.applicationId);
    const mappedNotes: BoardInterviewNote[] = refreshedNotes.map((note) => ({
      id: note.noteId,
      authorId: note.userId,
      authorName: note.authorName,
      createdAt: null,
      text: note.content,
    }));

    setSlots((prev) =>
      prev.map((entry) =>
        entry.id === slotId ? { ...entry, notes: mappedNotes } : entry,
      ),
    );
  }, [slots]);

  const updateNote = useCallback(async (slotId: string, noteId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const slot = slots.find((entry) => entry.id === slotId);
    if (!slot) return;

    await boardApi.updateApplicationNote(noteId, trimmed);
    await refreshNotes(slotId);
  }, [refreshNotes, slots]);

  return {
    slots,
    setSlots,
    departmentStats,
    clubName,
    loading,
    error,
    load,
    addNote,
    refreshNotes,
    updateNote,
    submitDecision,
  };
}
