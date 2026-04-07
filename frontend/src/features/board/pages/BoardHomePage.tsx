import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { DepartmentCardGrid } from "../components/DepartmentCardGrid";
import { useBoardDepartments } from "../hooks/useBoardDepartments";
import { BoardSectionNav } from "../components/BoardSectionNav";

export function BoardHomePage() {
  const { data, loading, error, refetch } = useBoardDepartments();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950">
      <Navbar />

      <div className="pt-28">
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">
                Welcome back 👋
              </h1>
              <p className="mt-6 text-lg font-medium text-slate-300">
                Current Applications
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Open a department to view applicants and vote on applications.
              </p>
            </div>

            <button
              onClick={refetch}
              className="w-fit rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Refresh
            </button>
          </div>

          <BoardSectionNav />

          <div className="mt-10">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-slate-200 shadow">
                Loading departments…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
                <div className="font-semibold">
                  Could not load board departments.
                </div>
                <div className="mt-2 text-sm">{error}</div>
                <div className="mt-3 text-xs text-red-200/80">
                  Open the browser console too — I added debug logs there.
                </div>
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
    </div>
  );
}
