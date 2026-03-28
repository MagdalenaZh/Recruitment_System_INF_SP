import type { FinalInterviewDecision } from "../../../mocks/boardInterviewMock";

type Props = {
  open: boolean;
  candidateName: string;
  departmentName: string;
  decision: FinalInterviewDecision;
  onClose: () => void;
  onConfirm: () => void;
};

export function InterviewDecisionConfirmModal({
  open,
  candidateName,
  departmentName,
  decision,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  const isApprove = decision === "Approved";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isApprove ? "Approve applicant?" : "Reject applicant?"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              You are about to{" "}
              <span className="font-semibold text-white">
                {isApprove ? "approve" : "reject"}
              </span>{" "}
              <span className="font-semibold text-white">{candidateName}</span>{" "}
              for{" "}
              <span className="font-semibold text-white">{departmentName}</span>
              .
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Please make sure this is the correct final choice before
              submitting.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-rose-600 hover:bg-rose-500",
            ].join(" ")}
          >
            Confirm {isApprove ? "approval" : "rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
