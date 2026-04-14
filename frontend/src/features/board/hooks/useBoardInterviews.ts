import { useState, useCallback } from "react";
import { boardApi, resolveCurrentBoardClubId, resolveCurrentUserId } from "../../../services/board/boardApi";
import { getAllClubs, getDepartmentsForClub, getLatestApplicationStates } from "../../../services/applications/applicationStatusApi";
import type { BookedInterviewSlotDto } from "../../../types/board/boardApiTypes";
import type { UserApplicationDto } from "../../../types/account/accountApplications";
import { isConcludedApplicationState } from "../../../services/applications/applicationStateTypes";
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
        ? await getLatestApplicationStates(bookedAppIds)
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
              finalDecision: deriveFinalDecision(app.applicationId, stateMap),
              targetSpots: deptTargetMap[app.departmentId] ?? 0,
            },
          ],
        };
      });

      setSlots(builtSlots);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSlots([]);
      setClubName("");
    } finally {
      setLoading(false);
    }
  }, []);

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
    async (slotId: string, departmentId: string, decision: FinalInterviewDecision) => {
      if (decision === "Approved") {
        await boardApi.afterInterviewApproveApplication(slotId);
      } else {
        await boardApi.afterInterviewDisapproveApplication(slotId);
      }

      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                decisions: slot.decisions.map((entry) =>
                  entry.departmentId === departmentId
                    ? { ...entry, finalDecision: decision }
                    : entry,
                ),
              }
            : slot,
        ),
      );
    },
    [],
  );

  return { slots, setSlots, clubName, loading, error, load, addNote, submitDecision };
}
