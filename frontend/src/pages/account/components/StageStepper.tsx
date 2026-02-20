import type { ApplicationStage } from "../types/application";

const STEPS: { key: ApplicationStage; label: string }[] = [
  { key: "Submitted", label: "Submitted" },
  { key: "UnderReview", label: "Review" },
  { key: "Interview", label: "Interview" },
  { key: "Accepted", label: "Decision" }, // last bubble used as "Decision"
];

function stepIndex(stage: ApplicationStage) {
  switch (stage) {
    case "Submitted":
      return 0;
    case "UnderReview":
      return 1;
    case "Interview":
      return 2;
    case "Accepted":
    case "Rejected":
    case "Waitlisted":
      return 3;
  }
}

export function StageStepper({ stage }: { stage: ApplicationStage }) {
  const idx = stepIndex(stage);

  const isFinalBad = stage === "Rejected";
  const isFinalOk = stage === "Accepted";
  const isFinalMaybe = stage === "Waitlisted";

  function bubbleClass(i: number) {
    const done = i < idx;
    const active = i === idx;

    if (i === 3) {
      if (isFinalOk) return "bg-emerald-600 ring-emerald-200 text-white";
      if (isFinalBad) return "bg-rose-600 ring-rose-200 text-white";
      if (isFinalMaybe) return "bg-violet-600 ring-violet-200 text-white";
    }

    if (done) return "bg-slate-900 ring-slate-200 text-white";
    if (active) return "bg-white ring-slate-400 text-slate-900";
    return "bg-slate-100 ring-slate-200 text-slate-500";
  }

  function lineClass(i: number) {
    const done = i < idx;
    return done ? "bg-slate-900" : "bg-slate-200";
  }

  return (
    <div className="mt-3">
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={[
                "grid h-7 w-7 place-items-center rounded-full ring-1 text-xs font-semibold",
                bubbleClass(i),
              ].join(" ")}
            >
              {i + 1}
            </div>
            {i !== STEPS.length - 1 && (
              <div
                className={["mx-2 h-1 w-10 rounded-full", lineClass(i)].join(
                  " ",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>Submitted</span>
        <span>Review</span>
        <span>Interview</span>
        <span>
          {isFinalOk
            ? "Accepted"
            : isFinalBad
              ? "Rejected"
              : isFinalMaybe
                ? "Waitlist"
                : "Decision"}
        </span>
      </div>
    </div>
  );
}
