import { useMemo, useState } from "react";
import { AddClubModal } from "../components/AddClubModal";
import { ClubCard } from "../components/ClubCard";
import { useSysAdmin } from "../context/SysAdminContext";

export function SystemAdminClubsPage() {
  const { clubs, loading, error, refresh, addClub } = useSysAdmin();
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return clubs;

    return clubs.filter(
      (club) =>
        club.clubName.toLowerCase().includes(normalized) ||
        club.category.toLowerCase().includes(normalized) ||
        club.description.toLowerCase().includes(normalized),
    );
  }, [clubs, query]);

  function handleAssignAdmin(clubName: string) {
    setNotice(
      `Assign/Reassign club admin for "${clubName}" is not wired yet because the backend endpoint does not exist yet.`,
    );
  }

  function handleDeleteClub(clubName: string) {
    setNotice(
      `Delete club for "${clubName}" is not wired yet because the backend endpoint does not exist yet.`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Manage clubs
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Club list</h2>
          <p className="mt-2 text-sm text-slate-400">
            Create clubs and manage existing club records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="rounded-2xl bg-sky-500/20 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
        >
          + Create club
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs by name, category, or description..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {notice ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {notice}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
          Loading clubs...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-100">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-4 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((club) => (
              <ClubCard
                key={club.clubId}
                club={club}
                actions={
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleAssignAdmin(club.clubName)}
                      className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
                    >
                      Assign / Reassign admin
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClub(club.clubName)}
                      className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20"
                    >
                      Delete club
                    </button>
                  </div>
                }
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
              No clubs found.
            </div>
          ) : null}
        </>
      ) : null}

      <AddClubModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={addClub}
      />
    </div>
  );
}
