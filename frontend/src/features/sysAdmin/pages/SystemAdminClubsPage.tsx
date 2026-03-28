import { useMemo, useState } from "react";
import { AddClubModal } from "../components/AddClubModal";
import { ClubCard } from "../components/ClubCard";
import { useSysAdmin } from "../context/SysAdminContext";

export function SystemAdminClubsPage() {
  const { clubs, addClub, getAssignedAdmin } = useSysAdmin();
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return clubs;

    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(normalized) ||
        club.shortName.toLowerCase().includes(normalized) ||
        club.category.toLowerCase().includes(normalized),
    );
  }, [clubs, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Manage clubs
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Club list</h2>
          <p className="mt-2 text-sm text-slate-400">
            Add clubs and review the current mock setup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="rounded-2xl bg-sky-500/20 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
        >
          + Add club
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs by name, short name, or category..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((club) => (
          <ClubCard
            key={club.id}
            club={club}
            adminName={getAssignedAdmin(club.id)?.name}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
          No clubs found.
        </div>
      ) : null}

      <AddClubModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={addClub}
      />
    </div>
  );
}
