import { Link, useParams } from "react-router-dom";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { ApplicationStackList } from "../../board/components/ApplicationStackList";
import { useClubAdminDepartmentApplications } from "../hooks/useClubAdminDepartmentApplications";
import type { AdminApplicationStatus } from "../types/clubAdminTypes";

export function ClubAdminDepartmentApplicationsPage() {
  const { departmentId } = useParams<{ departmentId: string }>();

  const {
    filtered,
    loading,
    error,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    refetch,
  } = useClubAdminDepartmentApplications(departmentId);

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              to="/club-admin/applications"
              className="text-sm font-semibold text-slate-300 hover:text-white hover:underline"
            >
              ← Back to applications
            </Link>

            <h1 className="mt-3 text-3xl font-semibold text-white">
              Department Applications
            </h1>
            <p className="mt-2 text-slate-300">Department: {departmentId}</p>
          </div>

          <button
            onClick={refetch}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Refresh
          </button>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by applicant name…"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 sm:w-96"
            />

            <div className="flex flex-wrap gap-2">
              <AdminFilterButton
                label="All"
                active={statusFilter === "All"}
                onClick={() => setStatusFilter("All")}
              />
              <AdminFilterButton
                label="Pending"
                active={statusFilter === "Pending"}
                onClick={() => setStatusFilter("Pending")}
              />
              <AdminFilterButton
                label="Approved"
                active={statusFilter === "Approved"}
                onClick={() => setStatusFilter("Approved")}
              />
              <AdminFilterButton
                label="Rejected"
                active={statusFilter === "Rejected"}
                onClick={() => setStatusFilter("Rejected")}
              />
              <AdminFilterButton
                label="Admitted"
                active={statusFilter === "Admitted"}
                onClick={() => setStatusFilter("Admitted")}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading applications…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : (
            <ApplicationStackList items={filtered as any} />
          )}
        </div>
      </div>
    </ClubAdminShell>
  );
}

function AdminFilterButton({
  label,
  active,
  onClick,
}: {
  label: AdminApplicationStatus | "All";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-white/20 bg-white/20 text-white"
          : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}
