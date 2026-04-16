import type {
  BoardInterviewDepartmentDecision,
  BoardInterviewDepartmentStats,
  BoardInterviewSlot,
  InterviewSlotPhase,
} from "../types/boardTypes";

function toDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPendingDecisionCount(slot: BoardInterviewSlot): number {
  return slot.decisions.filter((decision) => decision.finalDecision === null).length;
}

export function filterSlotsByDepartment(
  slots: BoardInterviewSlot[],
  departmentId: string,
): BoardInterviewSlot[] {
  if (departmentId === "all") return slots;
  return slots.filter((slot) =>
    slot.decisions.some((decision) => decision.departmentId === departmentId),
  );
}

export function groupSlotsByDate(slots: BoardInterviewSlot[]) {
  const groups = new Map<string, BoardInterviewSlot[]>();

  for (const slot of [...slots].sort((a, b) => a.startAt.localeCompare(b.startAt))) {
    const current = groups.get(slot.date) ?? [];
    current.push(slot);
    groups.set(slot.date, current);
  }

  return [...groups.entries()].map(([date, groupedSlots]) => ({
    date,
    slots: groupedSlots,
  }));
}

export function getCurrentInterview(slots: BoardInterviewSlot[]): BoardInterviewSlot | null {
  const now = new Date();
  return (
    slots.find((slot) => {
      const start = toDate(slot.startAt);
      const end = toDate(slot.endAt);
      return !!start && !!end && start <= now && now < end;
    }) ?? null
  );
}

export function getNextInterview(slots: BoardInterviewSlot[]): BoardInterviewSlot | null {
  const now = new Date();
  const upcoming = slots
    .map((slot) => ({ slot, start: toDate(slot.startAt) }))
    .filter(
      (entry): entry is { slot: BoardInterviewSlot; start: Date } =>
        !!entry.start && entry.start > now,
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return upcoming[0]?.slot ?? null;
}

export function getSlotPhase(
  slot: BoardInterviewSlot,
  nowIso: string = new Date().toISOString(),
): InterviewSlotPhase {
  const now = toDate(nowIso);
  const start = toDate(slot.startAt);
  const end = toDate(slot.endAt);

  if (!now || !start || !end) return "Scheduled";
  if (getPendingDecisionCount(slot) === 0) return "Decision submitted";
  if (start <= now && now < end) return "Live now";
  if (now >= start) return "Ready for decision";
  return "Scheduled";
}

export function getDecisionProgressLabel(slot: BoardInterviewSlot): string {
  const total = slot.decisions.length;
  const completed = slot.decisions.filter((decision) => decision.finalDecision !== null).length;
  return `${completed} of ${total} final decision${total === 1 ? "" : "s"} submitted`;
}

export function getInterviewVotingHint(slot: BoardInterviewSlot): string {
  const phase = getSlotPhase(slot);

  if (phase === "Decision submitted") {
    return "All department decisions for this interview have already been submitted.";
  }

  if (phase === "Ready for decision") {
    return "Voting is available now.";
  }

  if (phase === "Live now") {
    return "The interview is live and voting is already available.";
  }

  return "Voting becomes available once the scheduled interview starts.";
}

function emptyStats(decision: BoardInterviewDepartmentDecision): BoardInterviewDepartmentStats {
  return {
    departmentId: decision.departmentId,
    departmentName: decision.departmentName,
    totalApplicants: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    targetSpots: 0,
  };
}

export function getDepartmentStats(slots: BoardInterviewSlot[]): BoardInterviewDepartmentStats[] {
  const stats = new Map<string, BoardInterviewDepartmentStats>();

  for (const slot of slots) {
    for (const decision of slot.decisions) {
      const current = stats.get(decision.departmentId) ?? emptyStats(decision);
      current.totalApplicants += 1;

      if (decision.finalDecision === "Approved") current.approvedCount += 1;
      else if (decision.finalDecision === "Rejected") current.rejectedCount += 1;
      else current.pendingCount += 1;

      if (decision.targetSpots > 0) {
        current.targetSpots = decision.targetSpots;
      }

      stats.set(decision.departmentId, current);
    }
  }

  return [...stats.values()].sort((a, b) => a.departmentName.localeCompare(b.departmentName));
}
