import type { ApplicationListItem } from "../types/application";
import { StatusChip } from "../components/StatusChip";
import { StageStepper } from "../components/StageStepper";

export function AccountApplicationsPage() {
  const mockApps: ApplicationListItem[] = [
    {
      id: "1",
      clubName: "TEDx AUBG",
      stage: "UnderReview",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      clubName: "The Hub",
      stage: "Interview",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      clubName: "Dance Club",
      stage: "Rejected",
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <div>
      <div className="mt-6 space-y-4">
        {mockApps.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl bg-white p-5 ring-1 ring-slate-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {a.clubName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Updated: {new Date(a.updatedAt).toLocaleString()}
                </div>
              </div>
              <StatusChip stage={a.stage} />
            </div>

            <StageStepper stage={a.stage} />

            <div className="mt-4 flex justify-end"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
