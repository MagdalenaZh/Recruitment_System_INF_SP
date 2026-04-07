import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminPageHeader } from "../components/ClubAdminPageHeader";
import { useClubAdminClubInfo } from "../hooks/useClubAdminClubInfo";
import { ClubAdminDepartmentManagementCard } from "../components/ClubAdminDepartmentManagementCard";

export function ClubAdminClubInfoPage() {
  const { data, loading, error, refetch, updateOpenPositions } =
    useClubAdminClubInfo();

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Edit club info"
          description="View the current club details, department settings, and department head assignments."
          onRefresh={refetch}
        />

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading club information…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                      {data.clubName}
                    </div>

                    {data.category ? (
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200">
                        Category: {data.category}
                      </div>
                    ) : null}
                  </div>

                  <p className="text-sm leading-7 text-slate-300">
                    {data.description}
                  </p>

                  <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                    Club description editing endpoint is not ready yet.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {data.departments.map((department) => (
                  <ClubAdminDepartmentManagementCard
                    key={department.departmentId}
                    department={department}
                    onSaveOpenPositions={updateOpenPositions}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ClubAdminShell>
  );
}
