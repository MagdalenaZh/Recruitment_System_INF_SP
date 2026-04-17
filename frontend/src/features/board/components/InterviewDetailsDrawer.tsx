import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type {
  BoardInterviewSlot,
  FinalInterviewDecision,
} from "../types/boardTypes";
import { resolveCurrentUserId } from "../../../services/board/boardApi";
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
  onAddNote: (slotId: string, text: string) => Promise<void> | void;
  onRefreshNotes: (slotId: string) => Promise<void> | void;
  onUpdateNote: (
    slotId: string,
    noteId: string,
    text: string,
  ) => Promise<void> | void;
  onRequestDecision: (request: DecisionRequest) => void;
};

export function InterviewDetailsDrawer({
  open,
  slot,
  onClose,
  onAddNote,
  onRefreshNotes,
  onUpdateNote,
  onRequestDecision,
}: Props) {
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [refreshingNotes, setRefreshingNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [savingEditedNote, setSavingEditedNote] = useState(false);

  useEffect(() => {
    setNoteText("");
    setSavingNote(false);
    setNoteError(null);
    setRefreshingNotes(false);
    setEditingNoteId(null);
    setEditingNoteText("");
    setSavingEditedNote(false);
  }, [slot?.id, open]);

  if (!open || !slot) return null;

  const phase = getSlotPhase(slot);
  const canVote = phase === "Ready for decision" || phase === "Live now";
  const currentUserId = resolveCurrentUserId();

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-white/10 bg-slate-950/95 shadow-2xl lg:w-1/2">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                Interview details
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {slot.candidateName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <span>
                  {slot.date} • {slot.startTime}-{slot.endTime}
                </span>
                <InterviewPhaseBadge phase={phase} />
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {slot.candidateEmail}
              </p>
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
            <h3 className="text-lg font-semibold text-white">
              Round two voting
            </h3>

            <div className="mt-4 space-y-4">
              {slot.decisions.map((department) => {
                const alreadyDecided =
                  department.finalDecision !== null ||
                  department.roundTwoDecision !== null;
                const roundTwoApproved =
                  department.roundTwoApproveVotes >=
                  department.requiredApprovals;
                const finalAwaitingDecision =
                  department.finalDecision === null && roundTwoApproved;

                return (
                  <div
                    key={department.departmentId}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-white">
                          {department.departmentName}
                        </h4>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-200">
                            Round 1: {department.roundOneStatus}
                          </span>
                          {roundTwoApproved ? (
                            <span
                              className={[
                                "rounded-full border px-3 py-1 font-semibold",
                                "border-sky-400/30 bg-sky-400/15 text-sky-100",
                              ].join(" ")}
                            >
                              Round 2: Approved
                            </span>
                          ) : (
                            <span className="rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-1 font-semibold text-sky-100">
                              Round 2: pending
                            </span>
                          )}

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
                          ) : finalAwaitingDecision ? (
                            <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 font-semibold text-amber-100">
                              Final: awaiting final decision
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
                              ? "Your round two vote has been recorded. Final result stays pending until conclusion."
                              : "The interview has started. You can submit your vote now."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-1 font-semibold text-sky-100">
                            Your vote:{" "}
                            {department.roundTwoDecision ?? "pending"}
                          </span>
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-100">
                            Approvals: {department.roundTwoApproveVotes}
                          </span>
                          <span className="rounded-full border border-rose-400/30 bg-rose-400/15 px-3 py-1 font-semibold text-rose-100">
                            Rejections: {department.roundTwoRejectVotes}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-200">
                            Required: {department.requiredApprovals}
                          </span>
                        </div>
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

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">
              Application answers
            </h3>

            <div className="mt-4 space-y-4">
              {slot.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="text-sm font-semibold text-slate-200">
                    {answer.question}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">
                    {answer.answer}
                  </div>
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
                    <div className="text-sm font-semibold text-slate-200">
                      {attachment.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">Board notes</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  Use this during or after the interview
                </span>
                <button
                  type="button"
                  disabled={refreshingNotes}
                  onClick={async () => {
                    setRefreshingNotes(true);
                    setNoteError(null);
                    try {
                      await onRefreshNotes(slot.id);
                    } catch (error) {
                      setNoteError(
                        error instanceof Error
                          ? error.message
                          : "Failed to refresh notes.",
                      );
                    } finally {
                      setRefreshingNotes(false);
                    }
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
                >
                  {refreshingNotes ? "Refreshing..." : "Refresh"}
                </button>
              </div>
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
                      <div className="text-sm font-semibold text-slate-200">
                        {note.authorName}
                      </div>
                      {note.createdAt ? (
                        <div className="text-xs text-slate-400">
                          {note.createdAt}
                        </div>
                      ) : null}
                    </div>
                    {editingNoteId === note.id ? (
                      <div className="mt-3">
                        <textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          rows={4}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteText("");
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={savingEditedNote}
                            onClick={async () => {
                              setSavingEditedNote(true);
                              setNoteError(null);
                              try {
                                await onUpdateNote(
                                  slot.id,
                                  note.id,
                                  editingNoteText,
                                );
                                setEditingNoteId(null);
                                setEditingNoteText("");
                              } catch (error) {
                                setNoteError(
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to update note.",
                                );
                              } finally {
                                setSavingEditedNote(false);
                              }
                            }}
                            className="rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/30 disabled:opacity-60"
                          >
                            {savingEditedNote ? "Saving..." : "Save changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm leading-6 text-slate-300">
                        {note.text}
                      </div>
                    )}
                    {note.authorId === currentUserId &&
                    editingNoteId !== note.id ? (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingNoteText(note.text);
                          }}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
                        >
                          Edit
                        </button>
                      </div>
                    ) : null}
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

            {noteError ? (
              <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                {noteError}
              </div>
            ) : null}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={savingNote}
                onClick={async () => {
                  const trimmed = noteText.trim();
                  if (!trimmed) return;
                  setSavingNote(true);
                  setNoteError(null);
                  try {
                    await onAddNote(slot.id, trimmed);
                    setNoteText("");
                  } catch (error) {
                    setNoteError(
                      error instanceof Error
                        ? error.message
                        : "Failed to save note.",
                    );
                  } finally {
                    setSavingNote(false);
                  }
                }}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:opacity-60"
              >
                {savingNote ? "Saving..." : "Save note"}
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
