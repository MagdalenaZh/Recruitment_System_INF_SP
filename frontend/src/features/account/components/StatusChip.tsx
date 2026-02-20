import type { ApplicationStage } from "../../../types/account/applicationStage";

function style(stage: ApplicationStage) {
  switch (stage) {
    case "Submitted":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "UnderReview":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "Interview":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "Accepted":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Rejected":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "Waitlisted":
      return "bg-violet-50 text-violet-700 ring-violet-200";
  }
}

export function StatusChip({ stage }: { stage: ApplicationStage }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        style(stage),
      ].join(" ")}
    >
      {stage === "UnderReview" ? "Under review" : stage}
    </span>
  );
}
