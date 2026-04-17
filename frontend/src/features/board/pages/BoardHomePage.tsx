import { DepartmentCardGrid } from "../components/DepartmentCardGrid";
import { useBoardDepartments } from "../hooks/useBoardDepartments";
import { BoardSectionNav } from "../components/BoardSectionNav";
import { BoardShell } from "../components/BoardShell";
import { getStoredUser } from "../../../services/auth/auth.api";

export function BoardHomePage() {
  const { data, clubName, loading, error } = useBoardDepartments();
  const currentUser = getStoredUser();
  const userName = currentUser?.firstName ?? "there";

  return (
    <BoardShell>
      <div className="pt-28 mb-20">
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <div className="mb-10">
            <BoardSectionNav />
          </div>

          <div className="">
            <div>
              <p className="text-3xl font-semibold uppercase tracking-[0.24em] text-blue-700">
                Board workspace
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-blue-700">
                Welcome back, {userName}!
              </h1>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-blue-100/70 bg-white/60 p-6 shadow-[0_20px_50px_-35px_rgba(37,99,235,0.18)] backdrop-blur-sm">
            <div className="mb-6">
              <p className="text-2xl font-medium text-slate-800">
                {clubName
                  ? `Current Applications for ${clubName}`
                  : "Current Applications"}
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                Loading departments...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <div className="font-semibold">
                  Could not load board departments.
                </div>
                <div className="mt-2 text-sm">{error}</div>
              </div>
            ) : data && data.length > 0 ? (
              <DepartmentCardGrid departments={data} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
                No departments found for this board member.
              </div>
            )}
          </div>
        </div>
      </div>
    </BoardShell>
  );
}
