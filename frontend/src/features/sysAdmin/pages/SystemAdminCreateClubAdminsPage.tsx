import { useMemo, useState } from "react";
import { useSysAdmin } from "../context/SysAdminContext";
import { GlassPanel } from "../components/GlassPanel";

export function SystemAdminCreateClubAdminsPage() {
  const { promotableUsers, promoteToClubAdmin } = useSysAdmin();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return promotableUsers;

    return promotableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    );
  }, [promotableUsers, query]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
          Create club admins
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Promote normal users to club admins
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Registered users start as applicants. From here the system admin can
          promote them into club admins.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((user) => (
          <GlassPanel key={user.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-medium text-white">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-300/80">
                  Current role: applicant
                </p>
              </div>

              <button
                type="button"
                onClick={() => promoteToClubAdmin(user.id)}
                className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
              >
                Make club admin
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
          No normal users found.
        </div>
      ) : null}
    </div>
  );
}
