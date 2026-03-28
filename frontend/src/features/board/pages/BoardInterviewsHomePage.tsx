import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { InterviewDetailsDrawer } from "../components/InterviewDetailsDrawer";
import { InterviewDecisionConfirmModal } from "../components/InterviewDecisionConfirmModal";
import { InterviewPhaseBadge } from "../components/InterviewPhaseBadge";
import type {
  BoardInterviewSlot,
  FinalInterviewDecision,
} from "../../../mocks/boardInterviewMock";
import {
  cloneBoardInterviewSlotsMock,
  filterSlotsByDepartment,
  getCurrentInterview,
  getDecisionProgressLabel,
  getDepartmentStats,
  getFormattedMockNow,
  getNextInterview,
  getSlotPhase,
  groupSlotsByDate,
} from "../../../mocks/boardInterviewMock";

type PendingDecisionRequest = {
  slotId: string;
  candidateName: string;
  departmentId: string;
  departmentName: string;
  decision: FinalInterviewDecision;
} | null;

export function BoardInterviewsHomePage() {
  const [slots, setSlots] = useState<BoardInterviewSlot[]>(
    cloneBoardInterviewSlotsMock(),
  );
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] =
    useState<PendingDecisionRequest>(null);

  const filteredSlots = useMemo(
    () => filterSlotsByDepartment(slots, departmentFilter),
    [slots, departmentFilter],
  );

  const groupedSlots = useMemo(
    () => groupSlotsByDate(filteredSlots),
    [filteredSlots],
  );

  const departmentStats = useMemo(() => getDepartmentStats(slots), [slots]);
  const currentInterview = useMemo(
    () => getCurrentInterview(filteredSlots),
    [filteredSlots],
  );
  const nextInterview = useMemo(
    () => getNextInterview(filteredSlots),
    [filteredSlots],
  );

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null;

  useEffect(() => {
    if (!selectedSlotId) return;

    const stillVisible = filteredSlots.some(
      (slot) => slot.id === selectedSlotId,
    );
    if (!stillVisible) {
      setSelectedSlotId(null);
    }
  }, [filteredSlots, selectedSlotId]);

  function resetMockData() {
    setSlots(cloneBoardInterviewSlotsMock());
    setSelectedSlotId(null);
    setPendingDecision(null);
    setDepartmentFilter("all");
  }

  function addNote(slotId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              notes: [
                ...slot.notes,
                {
                  id: `note-${Date.now()}`,
                  author: "Board member",
                  createdAt: getFormattedMockNow(),
                  text: trimmed,
                },
              ],
            }
          : slot,
      ),
    );
  }

  function confirmDecision() {
    if (!pendingDecision) return;

    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === pendingDecision.slotId
          ? {
              ...slot,
              decisions: slot.decisions.map((department) =>
                department.departmentId === pendingDecision.departmentId
                  ? {
                      ...department,
                      finalDecision: pendingDecision.decision,
                    }
                  : department,
              ),
            }
          : slot,
      ),
    );

    setPendingDecision(null);
  }

  const totalPendingAcrossView = filteredSlots.reduce((sum, slot) => {
    return (
      sum +
      slot.decisions.filter((department) => department.finalDecision === null)
        .length
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950">
      <Navbar />

      <div className="pt-28">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">
                Interview day schedule
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
                One centralized page for the board. Open any slot to see the
                applicant’s full application, notes, and final voting controls.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                Mock clock: {getFormattedMockNow()}
              </p>
            </div>

            <button
              type="button"
              onClick={resetMockData}
              className="w-fit rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Reset mock data
            </button>
          </div>

          <BoardSectionNav />

          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <SummaryCard
              label="Now interviewing"
              value={
                currentInterview
                  ? `${currentInterview.startTime} ${currentInterview.candidateName}`
                  : "No live interview"
              }
              subtext={
                currentInterview
                  ? currentInterview.decisions
                      .map((department) => department.departmentName)
                      .join(" • ")
                  : "The current mock time does not fall inside a live slot."
              }
            />

            <SummaryCard
              label="Next applicant"
              value={
                nextInterview
                  ? `${nextInterview.startTime} ${nextInterview.candidateName}`
                  : "No next interview"
              }
              subtext={
                nextInterview
                  ? nextInterview.decisions
                      .map((department) => department.departmentName)
                      .join(" • ")
                  : "All remaining visible slots are already completed."
              }
            />

            <SummaryCard
              label="Pending decisions"
              value={`${totalPendingAcrossView}`}
              subtext="Department-level decisions still not submitted in this view."
            />

            <SummaryCard
              label="Current filter"
              value={
                departmentFilter === "all"
                  ? "All departments"
                  : (departmentStats.find(
                      (department) =>
                        department.departmentId === departmentFilter,
                    )?.departmentName ?? "Department")
              }
              subtext="Use the cards below to narrow the schedule."
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Department overview
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Keep an eye on caps while still working from one central
                  interview timeline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDepartmentFilter("all")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  departmentFilter === "all"
                    ? "border border-sky-400/40 bg-sky-400/15 text-white"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                Show all
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {departmentStats.map((department) => {
                const active = departmentFilter === department.departmentId;

                return (
                  <button
                    key={department.departmentId}
                    type="button"
                    onClick={() =>
                      setDepartmentFilter((prev) =>
                        prev === department.departmentId
                          ? "all"
                          : department.departmentId,
                      )
                    }
                    className={[
                      "rounded-2xl border p-5 text-left transition",
                      active
                        ? "border-sky-400/40 bg-sky-400/10 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.35)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {department.departmentName}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300">
                          {department.approvedCount} / {department.targetSpots}{" "}
                          approved
                        </p>
                      </div>

                      <span
                        className={[
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          active
                            ? "border-sky-400/40 bg-sky-400/15 text-sky-100"
                            : "border-white/10 bg-white/5 text-slate-200",
                        ].join(" ")}
                      >
                        {department.pendingCount} pending
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-300">
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                        <div className="text-slate-400">Applicants</div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          {department.totalApplicants}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                        <div className="text-slate-400">Approved</div>
                        <div className="mt-1 text-sm font-semibold text-emerald-200">
                          {department.approvedCount}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                        <div className="text-slate-400">Rejected</div>
                        <div className="mt-1 text-sm font-semibold text-rose-200">
                          {department.rejectedCount}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {groupedSlots.map((group) => (
              <section
                key={group.date}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {group.date}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {group.slots.length} interview slot
                      {group.slots.length === 1 ? "" : "s"} in this date group
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {group.slots.map((slot) => {
                    const phase = getSlotPhase(slot);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={[
                          "w-full rounded-2xl border p-4 text-left transition",
                          selectedSlotId === slot.id
                            ? "border-sky-400/40 bg-sky-400/10"
                            : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-white/5",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-lg font-semibold text-white">
                                {slot.startTime}–{slot.endTime}
                              </div>
                              <InterviewPhaseBadge phase={phase} />
                            </div>

                            <div className="mt-3 text-xl font-semibold text-white">
                              {slot.candidateName}
                            </div>

                            <div className="mt-1 text-sm text-slate-400">
                              {slot.candidateEmail}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {slot.decisions.map((department) => (
                                <span
                                  key={department.departmentId}
                                  className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100"
                                >
                                  {department.departmentName}
                                </span>
                              ))}
                            </div>

                            <div className="mt-4 text-sm text-slate-300">
                              {getDecisionProgressLabel(slot)}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
                              Open details
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <InterviewDetailsDrawer
        open={!!selectedSlot}
        slot={selectedSlot}
        onClose={() => setSelectedSlotId(null)}
        onAddNote={addNote}
        onRequestDecision={(request) => setPendingDecision(request)}
      />

      <InterviewDecisionConfirmModal
        open={!!pendingDecision}
        candidateName={pendingDecision?.candidateName ?? ""}
        departmentName={pendingDecision?.departmentName ?? ""}
        decision={pendingDecision?.decision ?? "Approved"}
        onClose={() => setPendingDecision(null)}
        onConfirm={confirmDecision}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{subtext}</div>
    </div>
  );
}
