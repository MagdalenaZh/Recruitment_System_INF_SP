import { useEffect, useMemo, useState } from "react";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { InterviewDetailsDrawer } from "../components/InterviewDetailsDrawer";
import { InterviewDecisionConfirmModal } from "../components/InterviewDecisionConfirmModal";
import { InterviewPhaseBadge } from "../components/InterviewPhaseBadge";
import { useBoardInterviews } from "../hooks/useBoardInterviews";
import type {
  BoardInterviewSlot,
  FinalInterviewDecision,
} from "../types/boardTypes";
import {
  filterSlotsByDepartment,
  getCurrentInterview,
  getNextInterview,
  getSlotPhase,
  groupSlotsByDate,
} from "../utils/interviewSchedule";
import { BoardShell } from "../components/BoardShell";

type PendingDecisionRequest = {
  slotId: string;
  candidateName: string;
  departmentId: string;
  departmentName: string;
  decision: FinalInterviewDecision;
} | null;

export function BoardInterviewsHomePage() {
  const {
    slots,
    departmentStats,
    clubName,
    loading,
    error,
    load,
    addNote,
    refreshNotes,
    updateNote,
    submitDecision,
  } = useBoardInterviews();
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] =
    useState<PendingDecisionRequest>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date().toISOString();
  const filteredSlots = useMemo(
    () => filterSlotsByDepartment(slots, departmentFilter),
    [slots, departmentFilter],
  );
  const groupedSlots = useMemo(
    () => groupSlotsByDate(filteredSlots),
    [filteredSlots],
  );
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
    if (!filteredSlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(null);
    }
  }, [filteredSlots, selectedSlotId]);

  async function confirmDecision() {
    if (!pendingDecision) return;
    try {
      setDecisionLoading(true);
      await submitDecision(
        pendingDecision.slotId,
        pendingDecision.departmentId,
        pendingDecision.decision,
      );
    } finally {
      setDecisionLoading(false);
      setPendingDecision(null);
    }
  }

  const totalPendingAcrossView = filteredSlots.reduce((sum, slot) => {
    return (
      sum +
      slot.decisions.filter((decision) => decision.finalDecision === null)
        .length
    );
  }, 0);

  if (loading) {
    return (
      <BoardShell>
        <div className="mx-auto max-w-7xl p-6 pt-36">
          <div className="rounded-[28px] border border-blue-100/70 bg-white/70 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
            Loading interview schedule...
          </div>
        </div>
      </BoardShell>
    );
  }

  if (error) {
    return (
      <BoardShell>
        <div className="mx-auto max-w-7xl p-6 pt-36">
          <div className="rounded-[28px] border border-red-200 bg-red-50/90 p-6 text-red-700 shadow-sm">
            <div className="font-semibold">
              Could not load interview schedule.
            </div>
            <div className="mt-2 text-sm">{error}</div>
          </div>
        </div>
      </BoardShell>
    );
  }

  return (
    <BoardShell>
      <div className="pt-28">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="mb-10">
            <BoardSectionNav />
          </div>

          <div className="">
            <div>
              {clubName && (
                <p className="mt-4 mb-8 text-4xl font-bold tracking-tight text-slate-950">
                  {clubName}
                </p>
              )}
              <p className="text-3xl font-semibold uppercase tracking-[0.24em] text-blue-700">
                Interviews
              </p>
            </div>
          </div>

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
                      .map((decision) => decision.departmentName)
                      .join(" • ")
                  : "No slot is currently live."
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
                      .map((decision) => decision.departmentName)
                      .join(" • ")
                  : "All remaining slots are completed."
              }
            />
            <SummaryCard
              label="Pending decisions"
              value={`${totalPendingAcrossView}`}
              subtext="Department-level decisions not yet submitted in this view."
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
              subtext="Use the department cards below to narrow the schedule."
            />
          </div>

          {departmentStats.length > 0 && (
            <div className="mt-8 rounded-[30px] border border-blue-100/70 bg-white/60 p-5 shadow-[0_20px_50px_-35px_rgba(37,99,235,0.16)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Department overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track approvals per department while working from the
                    central timeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDepartmentFilter("all")}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    departmentFilter === "all"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
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
                        "rounded-[24px] border p-5 text-left transition-all duration-300",
                        active
                          ? "border-blue-200 bg-blue-50/80 shadow-[0_18px_40px_-30px_rgba(37,99,235,0.28)]"
                          : "border-slate-200 bg-white/85 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {department.departmentName}
                          </h3>
                          <p
                            className={[
                              "mt-2 text-sm font-medium",
                              department.approvedCount > department.targetSpots
                                ? "text-rose-600"
                                : department.approvedCount ===
                                    department.targetSpots
                                  ? "text-emerald-600"
                                  : "text-blue-600",
                            ].join(" ")}
                          >
                            {department.approvedCount} /{" "}
                            {department.targetSpots} approved
                          </p>
                        </div>
                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-semibold",
                            active
                              ? "border-blue-200 bg-blue-100 text-blue-700"
                              : "border-slate-200 bg-slate-50 text-slate-600",
                          ].join(" ")}
                        >
                          {department.pendingCount} pending
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-slate-500">Applicants</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {department.totalApplicants}
                          </div>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                          <div className="text-emerald-700">Approved</div>
                          <div className="mt-1 text-sm font-semibold text-emerald-700">
                            {department.approvedCount}
                          </div>
                        </div>
                        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
                          <div className="text-rose-700">Rejected</div>
                          <div className="mt-1 text-sm font-semibold text-rose-700">
                            {department.rejectedCount}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {slots.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-blue-100/70 bg-white/70 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
              No booked interview slots found for this club.
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              {groupedSlots.map((group) => (
                <section
                  key={group.date}
                  className="rounded-[30px] border border-blue-100/70 bg-white/60 p-5 shadow-[0_20px_50px_-35px_rgba(37,99,235,0.16)] backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {group.date}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {group.slots.length} interview slot
                        {group.slots.length === 1 ? "" : "s"} on this date
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {group.slots.map((slot: BoardInterviewSlot) => {
                      const phase = getSlotPhase(slot, now);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={[
                            "w-full rounded-[24px] border p-4 text-left transition-all duration-300",
                            selectedSlotId === slot.id
                              ? "border-blue-200 bg-blue-50/80 shadow-[0_18px_40px_-30px_rgba(37,99,235,0.2)]"
                              : "border-slate-200 bg-white/90 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white",
                          ].join(" ")}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="text-lg font-semibold text-slate-900">
                                  {slot.startTime}-{slot.endTime}
                                </div>
                                <InterviewPhaseBadge phase={phase} />
                              </div>
                              <div className="mt-3 text-xl font-semibold text-slate-900">
                                {slot.candidateName}
                              </div>
                              <div className="mt-1 text-sm text-slate-600">
                                {slot.candidateEmail}
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {slot.decisions.map((decision) => (
                                  <span
                                    key={decision.departmentId}
                                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                  >
                                    {decision.departmentName}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
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
          )}
        </div>
      </div>

      <InterviewDetailsDrawer
        open={!!selectedSlot}
        slot={selectedSlot}
        onClose={() => setSelectedSlotId(null)}
        onAddNote={addNote}
        onRefreshNotes={refreshNotes}
        onUpdateNote={updateNote}
        onRequestDecision={(request) => setPendingDecision(request)}
      />

      <InterviewDecisionConfirmModal
        open={!!pendingDecision}
        candidateName={pendingDecision?.candidateName ?? ""}
        departmentName={pendingDecision?.departmentName ?? ""}
        decision={pendingDecision?.decision ?? "Approved"}
        onClose={() => setPendingDecision(null)}
        onConfirm={() => void confirmDecision()}
        loading={decisionLoading}
      />
    </BoardShell>
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
    <div className="rounded-[24px] border border-blue-100/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-600">{subtext}</div>
    </div>
  );
}
