import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { useBoardInterviews } from "../hooks/useBoardInterviews";
import { getDepartmentsForClub } from "../../../services/applications/applicationStatusApi";
import { resolveCurrentBoardClubId } from "../../../services/board/boardApi";
import { filterSlotsByDepartment, getSlotPhase, groupSlotsByDate } from "../utils/interviewSchedule";
import type { DepartmentDto } from "../../../types/account/accountApplications";
import { BoardShell } from "../components/BoardShell";

export function BoardDepartmentInterviewsPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const { slots, loading, error, load } = useBoardInterviews();
  const [department, setDepartment] = useState<DepartmentDto | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const clubId = resolveCurrentBoardClubId();
    if (!clubId || !departmentId) return;

    getDepartmentsForClub(clubId)
      .then((departments) => {
        setDepartment(departments.find((entry) => entry.departmentId === departmentId) ?? null);
      })
      .catch(console.error);
  }, [departmentId]);

  const now = new Date().toISOString();
  const departmentSlots = useMemo(
    () => (departmentId ? filterSlotsByDepartment(slots, departmentId) : []),
    [slots, departmentId],
  );
  const groupedSlots = useMemo(() => groupSlotsByDate(departmentSlots), [departmentSlots]);

  const approved = departmentSlots.filter((slot) =>
    slot.decisions.some(
      (decision) => decision.departmentId === departmentId && decision.finalDecision === "Approved",
    ),
  ).length;
  const rejected = departmentSlots.filter((slot) =>
    slot.decisions.some(
      (decision) => decision.departmentId === departmentId && decision.finalDecision === "Rejected",
    ),
  ).length;
  const pending = departmentSlots.filter((slot) =>
    slot.decisions.some(
      (decision) => decision.departmentId === departmentId && decision.finalDecision === null,
    ),
  ).length;

  const recommendedLimit = department?.numberOfOpenPositions ?? "—";

  return (
    <BoardShell>
      <div>
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <Link
            to="/board/interviews"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            ← Back to interview schedule
          </Link>

          <div className="mt-4">
            <h1 className="text-3xl font-semibold text-white">Interview Schedule</h1>
            <p className="mt-2 text-slate-300">
              Department: <span className="font-semibold text-white">{department?.departmentName ?? departmentId}</span>
            </p>
          </div>

          <BoardSectionNav />

          {loading ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
              Loading interview schedule...
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              <div className="font-semibold">Could not load interview schedule.</div>
              <div className="mt-2 text-sm">{error}</div>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <StatCard label="Approved so far" value={approved} color="text-emerald-200" />
                <StatCard label="Rejected so far" value={rejected} color="text-rose-200" />
                <StatCard label="Pending decision" value={pending} color="text-white" />
                <StatCard label="Recommended limit" value={recommendedLimit} color="text-white" />
              </div>

              {departmentSlots.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                  No booked interview slots for this department.
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {groupedSlots.map((group) => (
                    <section
                      key={group.date}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
                    >
                      <h2 className="text-xl font-semibold text-white">{group.date}</h2>

                      <div className="mt-4 space-y-3">
                        {group.slots.map((slot) => {
                          const phase = getSlotPhase(slot, now);
                          const decision = slot.decisions.find(
                            (entry) => entry.departmentId === departmentId,
                          );

                          return (
                            <div
                              key={slot.id}
                              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="text-lg font-semibold text-white">
                                  {slot.startTime}-{slot.endTime} - {slot.candidateName}
                                </div>
                                <div className="mt-1 text-sm text-slate-400">{slot.candidateEmail}</div>
                                <div className="mt-1 text-sm text-slate-400">{slot.clubName}</div>
                                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                  <span className="text-slate-300">Phase: {phase}</span>
                                  {decision && (
                                    <span className="text-slate-300">
                                      · Decision:{" "}
                                      <span
                                        className={
                                          decision.finalDecision === "Approved"
                                            ? "font-semibold text-emerald-300"
                                            : decision.finalDecision === "Rejected"
                                              ? "font-semibold text-rose-300"
                                              : "text-slate-400"
                                        }
                                      >
                                        {decision.finalDecision ?? "Pending"}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Link
                                to={`/board/applications/${slot.applicationId}`}
                                className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                              >
                                Open application
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </BoardShell>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="text-sm text-slate-300">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
