import { useState } from "react";
import type { ClubAdminClubDepartmentInfo } from "../types/clubAdminTypes";

type Props = {
  department: ClubAdminClubDepartmentInfo;
  onSaveOpenPositions: (
    departmentId: string,
    nextValue: number,
  ) => Promise<void>;
};

export function ClubAdminDepartmentManagementCard({
  department,
  onSaveOpenPositions,
}: Props) {
  const [openPositions, setOpenPositions] = useState<number>(
    department.openPositions,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      await onSaveOpenPositions(department.departmentId, openPositions);
      setMessage("Open positions updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update positions.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">
            {department.departmentName}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {department.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200">
              Head:{" "}
              <span className="font-semibold text-white">
                {department.headName ?? "No head assigned yet"}
              </span>
            </div>

            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
              onClick={() => {
                alert(
                  "Department head assignment UI should open here later. Best option: searchable modal with user lookup.",
                );
              }}
            >
              {department.headName ? "Reassign head" : "Assign head"}
            </button>

            <div className="rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
              Head assignment endpoint not ready
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72">
          <label className="block text-sm font-medium text-slate-200">
            Open positions
          </label>

          <input
            type="number"
            min={0}
            value={openPositions}
            onChange={(e) => setOpenPositions(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save positions"}
          </button>

          {message ? (
            <div className="mt-3 text-sm text-emerald-300">{message}</div>
          ) : null}

          {error ? (
            <div className="mt-3 text-sm text-rose-300">{error}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
