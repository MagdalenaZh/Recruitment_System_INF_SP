import { Navbar } from "../../../components/layout/Navbar/Navbar";
import { DepartmentCardGrid } from "../components/DepartmentCardGrid";
import { useBoardDepartments } from "../hooks/useBoardDepartments";

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
            </div>

            <button
              onClick={refetch}
              className="w-fit rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              Refresh
            </button>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-6 text-slate-200 shadow">
                Loading departments…
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-red-500/10 border border-red-400/30 p-6 text-red-300">
                {error}
              </div>
            ) : data ? (
              <DepartmentCardGrid departments={data} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
