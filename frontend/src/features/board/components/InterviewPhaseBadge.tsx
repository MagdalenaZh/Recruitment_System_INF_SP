import type { InterviewSlotPhase } from "../types/boardTypes";

type Props = {
  phase: InterviewSlotPhase;
};

export function InterviewPhaseBadge({ phase }: Props) {
  const className =
    phase === "Live now"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : phase === "Ready for decision"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : phase === "Decision submitted"
          ? "border-sky-100 bg-sky-50 text-sky-700"
          : "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {phase}
    </span>
  );
}
