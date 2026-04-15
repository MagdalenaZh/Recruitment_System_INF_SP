import { Link } from "react-router-dom";
import { StatusPill } from "./StatusPill";
import type { ApplicationListItem } from "../types/boardTypes";

export function ApplicationStackItem({ item }: { item: ApplicationListItem }) {
  const myVoteLabel =
    item.myVote === "Approve" ? "Approve" : item.myVote === "Reject" ? "Disapprove" : "-";
  const showRoundOneVoteSummary =
    item.status === "Submitted" || item.status === "Pending";

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
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white/90">{item.applicantName}</div>
          <div className="mt-1 text-sm text-slate-300">{item.applicantEmail || "No email provided"}</div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={item.status} />
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        {showRoundOneVoteSummary ? (
          <>
            <div>
              Your vote: <span className="font-semibold text-white/90">{myVoteLabel}</span>
            </div>

            <div className="text-xs text-slate-300">
              Board votes:{" "}
              <span className="font-semibold text-white/90">
                {item.totalVotes} ({item.approveVotes} approve / {item.rejectVotes} reject)
              </span>
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-400">
            Vote details for later stages are tracked from the interview flow.
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-xs">Open</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
        </div>
      </div>
    </Link>
  );
}
