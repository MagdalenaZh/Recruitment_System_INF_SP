import { useEffect, useMemo, useState } from "react";
import { AddClubModal } from "../components/AddClubModal";
import { AssignClubAdminModal } from "../components/AssignClubAdminModal";
import { GlassPanel } from "../components/GlassPanel";
import { useSysAdmin } from "../context/SysAdminContext";
import {
  getAvailableRoles,
  getUserInformation,
  assignClubAdmin,
} from "../api/sysAdminApi";
import type { SysAdminRole } from "../types/sysAdminTypes";

const CATEGORY_OPTIONS = [
  "All",
  "Math & Science",
  "Technology",
  "Sports",
  "Business",
  "Politics",
  "Art",
  "Media & Journalism",
  "Entrepreneurship",
  "Music",
  "Other",
] as const;

type PendingClubAdminAssignment = {
  clubId: string;
  clubName: string;
} | null;

type CachedClubAdminAssignment = {
  clubId: string;
  userId: string;
  name: string;
};

const CLUB_ADMIN_ASSIGNMENTS_STORAGE_KEY = "sysadmin:club-admin-assignments";

function readCachedAssignments(): Record<string, CachedClubAdminAssignment> {
  try {
    const raw = window.localStorage.getItem(CLUB_ADMIN_ASSIGNMENTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, CachedClubAdminAssignment>;
  } catch {
    return {};
  }
}

function writeCachedAssignments(
  assignments: Record<string, CachedClubAdminAssignment>,
): void {
  try {
    window.localStorage.setItem(
      CLUB_ADMIN_ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify(assignments),
    );
  } catch {
    // Ignore cache write failures.
  }
}

export function SystemAdminDashboardPage() {
  const { clubs, loading, error, refresh, addClub } = useSysAdmin();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof CATEGORY_OPTIONS)[number]>("All");
  const [openAddClub, setOpenAddClub] = useState(false);
  const [pendingAssignment, setPendingAssignment] =
    useState<PendingClubAdminAssignment>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleteNoticeClubId, setDeleteNoticeClubId] = useState<string | null>(
    null,
  );
  const [clubAdminAssignments, setClubAdminAssignments] = useState<
    Record<string, CachedClubAdminAssignment>
  >(() => readCachedAssignments());
  const [roles, setRoles] = useState<SysAdminRole[]>([]);

  const filteredClubs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clubs.filter((club) => {
      const matchesCategory =
        categoryFilter === "All" || club.category === categoryFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        club.clubName.toLowerCase().includes(normalizedQuery) ||
        club.category.toLowerCase().includes(normalizedQuery) ||
        club.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [clubs, query, categoryFilter]);

  useEffect(() => {
    void getAvailableRoles()
      .then(setRoles)
      .catch(() => setRoles([]));
  }, []);

  async function handleAssignAdmin(userId: string) {
    if (!pendingAssignment) return;

    try {
      const clubAdminRole = roles.find(
        (entry) => entry.roleName === "ClubAdmin",
      );
      if (!clubAdminRole) {
        throw new Error('Role "ClubAdmin" is not available.');
      }

      await assignClubAdmin(
        userId,
        pendingAssignment.clubId,
        clubAdminRole.roleId,
      );

      const user = await getUserInformation(userId);
      const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
      setClubAdminAssignments((prev) => {
        const next = {
          ...prev,
          [pendingAssignment.clubId]: {
            clubId: pendingAssignment.clubId,
            userId,
            name,
          },
        };
        writeCachedAssignments(next);
        return next;
      });
      setNotice(
        `Assigned ClubAdmin and club ownership to ${name} for "${pendingAssignment.clubName}".`,
      );
      setPendingAssignment(null);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? `Failed to assign role: ${err.message}`
          : "Failed to assign role.",
      );
      throw err;
    }
  }

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
              System admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Club management overview
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Search clubs, filter by category, create new clubs, and assign
              club admins from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setOpenAddClub(true)}
              className="rounded-2xl bg-sky-500/20 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
            >
              + Add club
            </button>
          </div>
        </div>
      </GlassPanel>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_220px]">
        <GlassPanel className="p-4">
          <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Search clubs
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by club name, category, or description..."
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </GlassPanel>

        <GlassPanel className="p-4">
          <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value as (typeof CATEGORY_OPTIONS)[number],
              )
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </GlassPanel>
      </section>

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
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredClubs.length}
              </span>{" "}
              club{filteredClubs.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredClubs.map((club) => {
              const showDeleteNotice = deleteNoticeClubId === club.clubId;
              const assignedAdmin = clubAdminAssignments[club.clubId];

              return (
                <GlassPanel
                  key={club.clubId}
                  className="flex min-h-[280px] flex-col p-5 transition hover:border-sky-300/20 hover:bg-white/10"
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
                          {club.category || "Uncategorized"}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          {club.clubName}
                        </h3>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Club
                      </span>
                    </div>

                    <p className="min-h-[72px] text-sm leading-6 text-slate-300">
                      {club.description || "No description yet."}
                    </p>

                    <div className="rounded-2xl border border-sky-300/10 bg-gradient-to-br from-white/10 to-sky-400/5 px-4 py-3 text-sm text-slate-200">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Club admin
                      </div>
                      <div className="mt-1 font-semibold text-white">
                        {assignedAdmin?.name ?? "Not assigned"}
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAssignment({
                            clubId: club.clubId,
                            clubName: club.clubName,
                          })
                        }
                        className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
                      >
                        Assign admin
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteNoticeClubId((prev) =>
                            prev === club.clubId ? null : club.clubId,
                          );
                        }}
                        className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20"
                      >
                        Delete club
                      </button>
                    </div>

                    {showDeleteNotice ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                        Club deletion is not wired yet because the backend
                        currently does not expose a delete-club endpoint.
                      </div>
                    ) : null}
                  </div>
                </GlassPanel>
              );
            })}
          </div>

          {filteredClubs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
              No clubs match the current search or category filter.
            </div>
          ) : null}
        </>
      ) : null}

      <AddClubModal
        open={openAddClub}
        onClose={() => setOpenAddClub(false)}
        onSubmit={addClub}
      />

      <AssignClubAdminModal
        open={pendingAssignment !== null}
        clubName={pendingAssignment?.clubName ?? ""}
        onClose={() => setPendingAssignment(null)}
        onSubmit={handleAssignAdmin}
      />
    </div>
  );
}
