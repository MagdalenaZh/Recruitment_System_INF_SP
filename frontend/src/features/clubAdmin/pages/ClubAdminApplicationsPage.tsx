import { Link } from "react-router-dom";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminDepartmentCardGrid } from "../components/ClubAdminDepartmentCardGrid";
import { useClubAdminDepartments } from "../hooks/useClubAdminDepartments";

export function ClubAdminApplicationsPage() {
  const { data, loading, error, refetch } = useClubAdminDepartments();

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/club-admin"
              className="text-sm font-semibold text-slate-300 hover:text-white hover:underline"
            >
              ← Back to admin home
            </Link>

            <h1 className="mt-3 text-3xl font-semibold text-white">
              Applications
            </h1>
            <p className="mt-2 text-slate-300">
              Choose a department to review its applications.
            </p>
          </div>

          <button
            onClick={refetch}
            className="w-fit rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Refresh
          </button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading departments…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : data ? (
            <ClubAdminDepartmentCardGrid departments={data} />
          ) : null}
        </div>
      </div>
    </ClubAdminShell>
  );
}
