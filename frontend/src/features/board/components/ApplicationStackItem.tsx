import { Link } from "react-router-dom";
import { StatusPill } from "./StatusPill";
import type { ApplicationListItem } from "../types/boardTypes";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function ApplicationStackItem({ item }: { item: ApplicationListItem }) {
  return (
    <Link
      to={`/board/applications/${item.id}`}
      className={[
        "group relative block overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/5 backdrop-blur-md",
        "p-4",
        "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:bg-white/8 hover:border-white/20",
        "hover:shadow-[0_18px_50px_-18px_rgba(0,0,0,0.75)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
      ].join(" ")}
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white/90">
            {item.applicantName}
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Submitted: {formatDate(item.submittedAt)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={item.status} />
          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white/85">
            {item.approvalsCount}/{item.requiredApprovals}
          </div>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between gap-3 text-sm text-slate-300">
        <div>
          Your vote:{" "}
          <span className="font-semibold text-white/90">
            {item.myVote ? item.myVote : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-xs">Open</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
