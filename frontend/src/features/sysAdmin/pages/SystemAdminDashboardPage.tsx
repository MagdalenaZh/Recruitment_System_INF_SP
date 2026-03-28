import { Link } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { StatCard } from "../components/StatCard";
import { useSysAdmin } from "../context/SysAdminContext";

export function SystemAdminDashboardPage() {
  const { clubs, adminCandidates, assignments, getAssignedAdmin } =
    useSysAdmin();

  const activeClubs = clubs.filter((club) => club.status === "active").length;
  const unassignedClubs = clubs.filter(
    (club) => !getAssignedAdmin(club.id),
  ).length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total clubs"
          value={clubs.length}
          hint="All clubs currently visible in the mock system."
        />
        <StatCard
          label="Active clubs"
          value={activeClubs}
          hint="Currently active clubs."
        />
        <StatCard
          label="Assigned admins"
          value={assignments.length}
          hint={`${unassignedClubs} club(s) still need an admin.`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Quick actions
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Get things done fast
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Link
              to="/sys-admin/clubs"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <p className="text-lg font-medium text-white">Manage clubs</p>
              <p className="mt-2 text-sm text-slate-400">
                Add clubs and review existing mock club records.
              </p>
            </Link>

            <Link
              to="/sys-admin/club-admins"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <p className="text-lg font-medium text-white">
                Assign club admins
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Connect a mock club admin to each club.
              </p>
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Club admin pool
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Available admins
          </h2>

          <div className="mt-5 space-y-3">
            {adminCandidates.map((admin) => (
              <div
                key={admin.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="font-medium text-white">{admin.name}</p>
                <p className="text-sm text-slate-400">{admin.email}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </section>
    </div>
  );
}
