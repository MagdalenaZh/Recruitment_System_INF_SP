import type { ApplicationListItem } from "../types/boardTypes";
import { ApplicationStackItem } from "./ApplicationStackItem";

export function ApplicationStackList({
  items,
}: {
  items: ApplicationListItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-slate-200 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)]">
        <div className="text-lg font-semibold text-white/90">
          No applications found
        </div>
        <div className="mt-1 text-sm text-slate-300">
          Try a different status filter or search query.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((i) => (
        <ApplicationStackItem key={i.id} item={i} />
      ))}
    </div>
  );
}
