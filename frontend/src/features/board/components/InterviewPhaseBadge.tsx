import type { InterviewSlotPhase } from "../types/boardTypes";

type Props = {
  phase: InterviewSlotPhase;
};

export function InterviewPhaseBadge({ phase }: Props) {
  const className =
    phase === "Live now"
      ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-100"
      : phase === "Ready for decision"
        ? "border-amber-400/30 bg-amber-400/15 text-amber-100"
        : phase === "Decision submitted"
          ? "border-sky-400/30 bg-sky-400/15 text-sky-100"
          : "border-white/10 bg-white/5 text-slate-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {phase}
    </span>
  );
}
