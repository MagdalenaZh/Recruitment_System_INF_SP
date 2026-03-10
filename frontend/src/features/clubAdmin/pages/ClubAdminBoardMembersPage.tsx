import { Link } from "react-router-dom";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { useBoardMembers } from "../hooks/useBoardMembers";
import { BoardMemberAssignmentCard } from "../components/BoardMemberAssignmentCard";

export function ClubAdminBoardMembersPage() {
  const { data, loading, error, refetch } = useBoardMembers();

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              to="/club-admin"
              className="text-sm font-semibold text-slate-300 hover:text-white hover:underline"
            >
              ← Back to admin home
            </Link>

            <h1 className="mt-3 text-3xl font-semibold text-white">
              Manage Board Members
            </h1>
            <p className="mt-2 text-slate-300">
              Assign board members to departments that they will review.
            </p>
          </div>

          <button
            onClick={refetch}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Refresh
          </button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading board members…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.map((member) => (
                <BoardMemberAssignmentCard key={member.id} member={member} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ClubAdminShell>
  );
}
