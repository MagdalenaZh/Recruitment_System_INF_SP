import { useState } from "react";
import type { ClubAdminClubDepartmentInfo } from "../types/clubAdminTypes";

type Props = {
  department: ClubAdminClubDepartmentInfo;
  onSaveOpenPositions: (
    departmentId: string,
    nextValue: number,
  ) => Promise<void>;
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
  onSaveOpenPositions,
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-200">
            Department name
          </label>
          <input
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <label className="mt-4 block text-sm font-medium text-slate-200">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
          />

          <h3 className="mt-4 text-xl font-semibold text-white">
            {department.departmentName}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {department.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100">
              Department head:{" "}
              <span className="font-semibold text-white">
                {department.headName ?? "Not assigned"}
              </span>
            </div>

            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
              onClick={() => onAssignBoardMember(department.departmentId)}
            >
              {department.headUserId ? "Reassign head" : "Assign head"}
            </button>
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

          <button
            onClick={handleSaveDepartment}
            disabled={saving}
            className="mt-3 w-full rounded-xl border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save department info"}
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
