import { Link } from "react-router-dom";
import { StatusPill } from "./StatusPill";
import type { ApplicationListItem } from "../types/boardTypes";

export function ApplicationStackItem({ item }: { item: ApplicationListItem }) {
  const myVoteLabel =
    item.myVote === "Approve"
      ? "Approve"
      : item.myVote === "Reject"
        ? "Disapprove"
        : "-";

  const showRoundOneVoteSummary =
    item.status === "Submitted" || item.status === "Pending";

  return (
    <Link
      to={`/board/applications/${item.id}`}
      className={[
        "group relative block overflow-hidden rounded-[24px]",
        "border border-slate-200 bg-white/90 backdrop-blur-sm",
        "p-4",
        "shadow-[0_12px_32px_-20px_rgba(15,23,42,0.14)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white",
        "hover:shadow-[0_20px_45px_-24px_rgba(37,99,235,0.16)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-400/8 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">
            {item.applicantName}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {item.applicantEmail || "No email provided"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={item.status} />
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        {showRoundOneVoteSummary ? (
          <>
            <div>
              Your vote:{" "}
              <span className="font-semibold text-slate-900">
                {myVoteLabel}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Board votes:{" "}
              <span className="font-semibold text-slate-900">
                {item.totalVotes} ({item.approveVotes} approve /{" "}
                {item.rejectVotes} reject)
              </span>
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500">
            Vote details for later stages are tracked from the interview flow.
          </div>
        )}

        <div className="flex items-center gap-2 text-blue-700">
          <span className="text-xs font-medium">Open</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            -&gt;
          </span>
        </div>
      </div>
    </Link>
  );
}
