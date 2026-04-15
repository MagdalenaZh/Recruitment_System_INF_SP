import { useEffect, useMemo, useState } from "react";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { InterviewDetailsDrawer } from "../components/InterviewDetailsDrawer";
import { InterviewDecisionConfirmModal } from "../components/InterviewDecisionConfirmModal";
import { InterviewPhaseBadge } from "../components/InterviewPhaseBadge";
import { useBoardDepartments } from "../hooks/useBoardDepartments";
import { useBoardInterviews } from "../hooks/useBoardInterviews";
import type { BoardInterviewSlot, FinalInterviewDecision } from "../types/boardTypes";
import {
  filterSlotsByDepartment,
  getCurrentInterview,
  getDecisionProgressLabel,
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
  const { slots, clubName, loading, error, load, addNote, submitDecision } = useBoardInterviews();
  const { data: departmentStats } = useBoardDepartments();
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<PendingDecisionRequest>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date().toISOString();
  const filteredSlots = useMemo(
    () => filterSlotsByDepartment(slots, departmentFilter),
    [slots, departmentFilter],
  );
  const groupedSlots = useMemo(() => groupSlotsByDate(filteredSlots), [filteredSlots]);
  const currentInterview = useMemo(() => getCurrentInterview(filteredSlots), [filteredSlots]);
  const nextInterview = useMemo(() => getNextInterview(filteredSlots), [filteredSlots]);
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
    return sum + slot.decisions.filter((decision) => decision.finalDecision === null).length;
  }, 0);

  if (loading) {
    return (
      <BoardShell>
        <div className="mx-auto max-w-7xl p-6 pt-36">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
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
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
            <div className="font-semibold">Could not load interview schedule.</div>
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Interview day schedule</h1>
              {clubName ? <p className="mt-2 text-base font-medium text-sky-300">{clubName}</p> : null}
              <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
                One centralized page for the board. Open any slot to see the applicant&apos;s full
                application, notes, and final voting controls.
              </p>
            </div>
          </div>

          <BoardSectionNav />

          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <SummaryCard
              label="Now interviewing"
              value={currentInterview ? `${currentInterview.startTime} ${currentInterview.candidateName}` : "No live interview"}
              subtext={currentInterview ? currentInterview.decisions.map((decision) => decision.departmentName).join(" • ") : "No slot is currently live."}
            />
            <SummaryCard
              label="Next applicant"
              value={nextInterview ? `${nextInterview.startTime} ${nextInterview.candidateName}` : "No next interview"}
              subtext={nextInterview ? nextInterview.decisions.map((decision) => decision.departmentName).join(" • ") : "All remaining slots are completed."}
            />
            <SummaryCard
              label="Pending decisions"
              value={`${totalPendingAcrossView}`}
              subtext="Department-level decisions not yet submitted in this view."
            />
            <SummaryCard
              label="Current filter"
              value={departmentFilter === "all" ? "All departments" : (departmentStats.find((department) => department.departmentId === departmentFilter)?.departmentName ?? "Department")}
              subtext="Use the department cards below to narrow the schedule."
            />
          </div>

          {departmentStats.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Department overview</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Track approvals per department while working from the central timeline.
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
                      onClick={() => setDepartmentFilter((prev) => prev === department.departmentId ? "all" : department.departmentId)}
                      className={[
                        "rounded-2xl border p-5 text-left transition",
                        active
                          ? "border-sky-400/40 bg-sky-400/10 shadow-[0_10px_30px_-12px_rgba(56,189,248,0.35)]"
                          : "border-white/10 bg-white/5 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{department.departmentName}</h3>
                          <p
                            className={[
                              "mt-2 text-sm",
                              department.approvedCount > department.targetSpots
                                ? "text-rose-300"
                                : department.approvedCount === department.targetSpots
                                  ? "text-emerald-300"
                                  : "text-sky-300",
                            ].join(" ")}
                          >
                            {department.approvedCount} / {department.targetSpots} approved
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
                          <div className="mt-1 text-sm font-semibold text-white">{department.totalApplicants}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                          <div className="text-slate-400">Approved</div>
                          <div className="mt-1 text-sm font-semibold text-emerald-200">{department.approvedCount}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                          <div className="text-slate-400">Rejected</div>
                          <div className="mt-1 text-sm font-semibold text-rose-200">{department.rejectedCount}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {slots.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
              No booked interview slots found for this club.
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              {groupedSlots.map((group) => (
                <section
                  key={group.date}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">{group.date}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {group.slots.length} interview slot{group.slots.length === 1 ? "" : "s"} on this date
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
                                  {slot.startTime}-{slot.endTime}
                                </div>
                                <InterviewPhaseBadge phase={phase} />
                              </div>
                              <div className="mt-3 text-xl font-semibold text-white">{slot.candidateName}</div>
                              <div className="mt-1 text-sm text-slate-400">{slot.candidateEmail}</div>
                              <div className="mt-1 text-sm text-slate-400">
                                {slot.clubName} • {slot.departmentName}
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {slot.decisions.map((decision) => (
                                  <span
                                    key={decision.departmentId}
                                    className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100"
                                  >
                                    {decision.departmentName}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-4 text-sm text-slate-300">{getDecisionProgressLabel(slot)}</div>
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
          )}
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{subtext}</div>
    </div>
  );
}
