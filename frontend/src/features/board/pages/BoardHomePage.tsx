import { DepartmentCardGrid } from "../components/DepartmentCardGrid";
import { useBoardDepartments } from "../hooks/useBoardDepartments";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { BoardShell } from "../components/BoardShell";

export function BoardHomePage() {
  const { data, clubName, loading, error } = useBoardDepartments();

  return (
    <BoardShell>
      <div className="pt-28">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
              {clubName && (
                <p className="mt-2 text-base font-medium text-sky-300">{clubName}</p>
              )}
              <p className="mt-6 text-lg font-medium text-slate-300">
                {clubName ? `Current Applications for ${clubName}` : "Current Applications"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Open a department to view applicants and vote on applications.
              </p>
            </div>

          </div>

          <BoardSectionNav />

          <div className="mt-10">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-slate-200 shadow">
                Loading departments...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
                <div className="font-semibold">Could not load board departments.</div>
                <div className="mt-2 text-sm">{error}</div>
              </div>
            ) : data && data.length > 0 ? (
              <DepartmentCardGrid departments={data} />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
                No departments found for this board member.
              </div>
            )}
          </div>
        </div>
      </div>
    </BoardShell>
  );
}
