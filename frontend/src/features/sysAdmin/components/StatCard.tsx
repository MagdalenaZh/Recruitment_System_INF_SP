import { GlassPanel } from "./GlassPanel";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <GlassPanel className="p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-sky-200/70">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-300">{hint}</p> : null}
    </GlassPanel>
  );
}
