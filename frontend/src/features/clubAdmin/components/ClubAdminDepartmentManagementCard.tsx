import { useState } from "react";
import type { ClubAdminClubDepartmentInfo } from "../types/clubAdminTypes";

type Props = {
  department: ClubAdminClubDepartmentInfo;
  onSaveDepartment: (
    departmentId: string,
    departmentName: string,
    openPositions: number,
    description: string,
  ) => Promise<void>;
  onAssignBoardMember: (departmentId: string) => void;
};

export function ClubAdminDepartmentManagementCard({
  department,
  onSaveDepartment,
  onAssignBoardMember,
}: Props) {
  const [departmentName, setDepartmentName] = useState<string>(
    department.departmentName,
  );
  const [description, setDescription] = useState<string>(
    department.description,
  );
  const [openPositions, setOpenPositions] = useState<number>(
    department.openPositions,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveDepartment() {
    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      await onSaveDepartment(
        department.departmentId,
        departmentName,
        openPositions,
        description,
      );
      setMessage("Department info updated.");
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
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {department.departmentName}
            </h3>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
              Department head
            </div>
            <div className="mt-2 font-semibold text-white">
              {department.headName ?? "Not assigned"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
              Department name
            </label>
            <input
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
              Open positions
            </label>
            <input
              type="number"
              min={0}
              value={openPositions}
              onChange={(e) => setOpenPositions(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mt-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="rounded-2xl bg-white/12 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={() => onAssignBoardMember(department.departmentId)}
            >
              {department.headUserId ? "Reassign head" : "Assign head"}
            </button>

            <button
              onClick={handleSaveDepartment}
              disabled={saving}
              className="rounded-2xl bg-sky-500/15 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>

          {message ? (
            <div className="text-right text-sm text-emerald-300">{message}</div>
          ) : null}

          {error ? (
            <div className="text-right text-sm text-rose-300">{error}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
