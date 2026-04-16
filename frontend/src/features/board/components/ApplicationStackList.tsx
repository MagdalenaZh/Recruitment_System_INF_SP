import type { ApplicationListItem } from "../types/boardTypes";
import { ApplicationStackItem } from "./ApplicationStackItem";

export function ApplicationStackList({
  items,
}: {
  items: ApplicationListItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-8 text-slate-600 shadow-sm backdrop-blur-sm">
        <div className="text-lg font-semibold text-slate-900">
          No applications found
        </div>
        <div className="mt-1 text-sm text-slate-500">
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
