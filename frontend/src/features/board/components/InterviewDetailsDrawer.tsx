import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BoardInterviewSlot, FinalInterviewDecision } from "../types/boardTypes";
import {
  getDecisionProgressLabel,
  getInterviewVotingHint,
  getSlotPhase,
} from "../utils/interviewSchedule";
import { InterviewPhaseBadge } from "./InterviewPhaseBadge";

type DecisionRequest = {
  slotId: string;
  candidateName: string;
  departmentId: string;
  departmentName: string;
  decision: FinalInterviewDecision;
};

type Props = {
  open: boolean;
  slot: BoardInterviewSlot | null;
  onClose: () => void;
  onAddNote: (slotId: string, text: string) => void;
  onRequestDecision: (request: DecisionRequest) => void;
};

export function InterviewDetailsDrawer({
  open,
  slot,
  onClose,
  onAddNote,
  onRequestDecision,
}: Props) {
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    setNoteText("");
  }, [slot?.id, open]);

  if (!open || !slot) return null;

  const phase = getSlotPhase(slot);
  const canVote = phase === "Ready for decision";

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-slate-950/95 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                Interview details
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{slot.candidateName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <span>
                  {slot.date} • {slot.startTime}-{slot.endTime}
                </span>
                <InterviewPhaseBadge phase={phase} />
              </div>
              <p className="mt-2 text-sm text-slate-400">{slot.candidateEmail}</p>
              <p className="mt-2 text-sm text-slate-400">
                {slot.clubName} • {slot.departmentName}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-6 px-4 py-6 sm:px-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Applied departments</h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {slot.decisions.map((department) => (
                <span
                  key={department.departmentId}
                  className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100"
                >
                  {department.departmentName}
                </span>
              ))}
            </div>

            <p className="mt-4 text-sm text-slate-300">{getDecisionProgressLabel(slot)}</p>
            <p className="mt-2 text-sm text-slate-400">{getInterviewVotingHint(slot)}</p>
            <Link
              to={`/board/applications/${slot.applicationId}`}
              className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Open application details
            </Link>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Application answers</h3>

            <div className="mt-4 space-y-4">
              {slot.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="text-sm font-semibold text-slate-200">{answer.question}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{answer.answer}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Attachments</h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {slot.attachments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                  No attachments provided.
                </div>
              ) : (
                slot.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="text-sm font-semibold text-slate-200">{attachment.name}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">Board notes</h3>
              <span className="text-xs text-slate-400">Use this during or after the interview</span>
            </div>

            <div className="mt-4 space-y-3">
              {slot.notes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4 text-sm text-slate-400">
                  No notes yet.
                </div>
              ) : (
                slot.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-slate-200">{note.author}</div>
                      <div className="text-xs text-slate-400">{note.createdAt}</div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{note.text}</div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write interview notes here..."
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const trimmed = noteText.trim();
                  if (!trimmed) return;
                  onAddNote(slot.id, trimmed);
                  setNoteText("");
                }}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Save note
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Round two decisions</h3>

            <div className="mt-4 space-y-4">
              {slot.decisions.map((department) => {
                const alreadyDecided = department.finalDecision !== null;

                return (
                  <div
                    key={department.departmentId}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-white">{department.departmentName}</h4>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-200">
                            Round 1: {department.roundOneStatus}
                          </span>

                          {department.finalDecision ? (
                            <span
                              className={[
                                "rounded-full border px-3 py-1 font-semibold",
                                department.finalDecision === "Approved"
                                  ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-100"
                                  : "border-rose-400/30 bg-rose-400/15 text-rose-100",
                              ].join(" ")}
                            >
                              Final: {department.finalDecision}
                            </span>
                          ) : (
                            <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 font-semibold text-amber-100">
                              Final: pending
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-sm text-slate-400">
                          {!canVote && !alreadyDecided
                            ? getInterviewVotingHint(slot)
                            : alreadyDecided
                              ? "A final decision has already been submitted for this department."
                              : "The interview slot has ended. You can vote now."}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          disabled={!canVote || alreadyDecided}
                          onClick={() =>
                            onRequestDecision({
                              slotId: slot.id,
                              candidateName: slot.candidateName,
                              departmentId: department.departmentId,
                              departmentName: department.departmentName,
                              decision: "Approved",
                            })
                          }
                          className={[
                            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                            !canVote || alreadyDecided
                              ? "cursor-not-allowed bg-emerald-700/40 opacity-50"
                              : "bg-emerald-600 hover:bg-emerald-500",
                          ].join(" ")}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={!canVote || alreadyDecided}
                          onClick={() =>
                            onRequestDecision({
                              slotId: slot.id,
                              candidateName: slot.candidateName,
                              departmentId: department.departmentId,
                              departmentName: department.departmentName,
                              decision: "Rejected",
                            })
                          }
                          className={[
                            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                            !canVote || alreadyDecided
                              ? "cursor-not-allowed bg-rose-700/40 opacity-50"
                              : "bg-rose-600 hover:bg-rose-500",
                          ].join(" ")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
