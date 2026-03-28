import { useMemo, useState } from "react";
import { AssignClubAdminModal } from "../components/AssignClubAdminModal";
import { ClubCard } from "../components/ClubCard";
import { useSysAdmin } from "../context/SysAdminContext";
import type { SysAdminClub } from "../types/sysAdminTypes";

export function SystemAdminClubAdminsPage() {
  const { clubs, adminCandidates, assignClubAdmin, getAssignedAdmin } =
    useSysAdmin();

  const [query, setQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<SysAdminClub | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return clubs;

    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(normalized) ||
        club.shortName.toLowerCase().includes(normalized),
    );
  }, [clubs, query]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
          Assign club admins
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Club admin assignments
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Simple mock page for assigning one club admin to each club.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((club) => {
          const currentAdmin = getAssignedAdmin(club.id);

          return (
            <ClubCard
              key={club.id}
              club={club}
              adminName={currentAdmin?.name}
              actions={
                <button
                  type="button"
                  onClick={() => setSelectedClub(club)}
                  className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
                >
                  {currentAdmin ? "Reassign admin" : "Assign admin"}
                </button>
              }
            />
          );
        })}
      </div>

      <AssignClubAdminModal
        open={!!selectedClub}
        club={selectedClub}
        admins={adminCandidates}
        currentAdminId={
          selectedClub ? getAssignedAdmin(selectedClub.id)?.id : undefined
        }
        onClose={() => setSelectedClub(null)}
        onAssign={assignClubAdmin}
      />
    </div>
  );
}
