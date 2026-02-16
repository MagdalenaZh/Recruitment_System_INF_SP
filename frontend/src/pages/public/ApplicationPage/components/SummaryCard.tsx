import type { ReactNode } from "react";

export function SummaryCard(props: { title: string; children: ReactNode }) {
  const { title, children } = props;

  return (
    <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
