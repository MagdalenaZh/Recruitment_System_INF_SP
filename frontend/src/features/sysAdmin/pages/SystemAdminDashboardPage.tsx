import { GlassPanel } from "../components/GlassPanel";
import { StatCard } from "../components/StatCard";
import { useSysAdmin } from "../context/SysAdminContext";

export function SystemAdminDashboardPage() {
  const { clubs, loading, error, refresh } = useSysAdmin();

  const totalClubs = clubs.length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total clubs"
          value={totalClubs}
          hint="All clubs currently in the system."
        />
        <StatCard
          label="Club admins"
          value="—"
          hint="Available once admin data is wired."
        />
        <StatCard
          label="Clubs without admin"
          value="—"
          hint="Available once assignment data is wired."
        />
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
          Loading overview...
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
        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <GlassPanel className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
                  Recently added
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Latest clubs
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  The newest club records currently visible in the system.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Total
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {totalClubs}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {clubs.slice(0, 6).map((club) => (
                <div
                  key={club.clubId}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{club.clubName}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {club.category || "Uncategorized"}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Club
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
                    {club.description}
                  </p>
                </div>
              ))}

              {clubs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                  No clubs found in the system yet.
                </div>
              ) : null}
            </div>
          </GlassPanel>

          <div className="space-y-6">
            <GlassPanel className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
                Admin overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Club admin status
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This section should show how many club admins exist and which
                clubs still need one assigned.
              </p>

              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-white">
                  Admin data not connected yet
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Once the backend provides club admin and assignment data, this
                  panel can show missing admins, reassignment needs, and quick
                  actions.
                </p>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
                System summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Current state
              </h2>

              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Total clubs</span>
                  <span className="font-medium text-white">{totalClubs}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Club admins</span>
                  <span className="font-medium text-white">Unavailable</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Clubs missing admin</span>
                  <span className="font-medium text-white">Unavailable</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </section>
      ) : null}
    </div>
  );
}
