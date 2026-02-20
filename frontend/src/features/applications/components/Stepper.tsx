type Props = {
  steps: string[];
  current: number;
};

export function Stepper({ steps, current }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((s, idx) => {
        const active = idx === current;
        const done = idx < current;

        const circle = done
          ? "bg-blue-600 text-white ring-blue-600"
          : active
            ? "bg-white text-slate-900 ring-slate-300"
            : "bg-slate-100 text-slate-500 ring-slate-200";

        const label = active ? "text-slate-900 font-medium" : "text-slate-600";

        return (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ring-1 ${circle}`}
            >
              {idx + 1}
            </div>

            <div className={`text-sm ${label}`}>{s}</div>

            {idx !== steps.length - 1 && (
              <div className="h-px w-10 bg-slate-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
