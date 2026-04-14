import { useMemo, useState } from "react";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminPageHeader } from "../components/ClubAdminPageHeader";
import { useClubAdminClubInfo } from "../hooks/useClubAdminClubInfo";
import { ClubAdminDepartmentManagementCard } from "../components/ClubAdminDepartmentManagementCard";

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoString(value: string): string {
  return new Date(value).toISOString();
}

export function ClubAdminClubInfoPage() {
  const {
    data,
    interviewSlots,
    loading,
    error,
    refetch,
    updateOpenPositions,
    updateDepartment,
    createDepartment,
    updateClubInfo,
    createInterviewSlot,
    updateInterviewSlot,
  } = useClubAdminClubInfo();

  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [newDepartmentOpenPositions, setNewDepartmentOpenPositions] = useState(0);
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const clubQuestionsCsv = useMemo(
    () => (data?.admissionQuestions ?? []).join(", "),
    [data?.admissionQuestions],
  );

  async function handleSaveClubInfo() {
    if (!data) return;

    const nextName = window.prompt("Club name", data.clubName);
    if (!nextName) return;

    const nextDescription =
      window.prompt("Club description", data.description) ?? data.description;
    const nextCategory = window.prompt(
      "Category (Math & Science, Technology, Sports, Business, Politics, Art, Media & Journalism, Entrepreneurship, Music, Other)",
      data.category || "Other",
    );
    if (!nextCategory) return;

    const nextQuestionsCsv = window.prompt(
      "Application questions (comma-separated)",
      clubQuestionsCsv,
    );
    const requiredApprovalsRaw = window.prompt("Required approvals", "1");
    const requiredApprovals = Number(requiredApprovalsRaw ?? "1");

    try {
      await updateClubInfo({
        clubName: nextName,
        description: nextDescription,
        category: nextCategory,
        requiredApprovals:
          Number.isFinite(requiredApprovals) && requiredApprovals > 0
            ? requiredApprovals
            : 1,
        applicationQuestions:
          nextQuestionsCsv?.split(",").map((q) => q.trim()).filter(Boolean) ?? [],
      });
      setMessage("Club info updated.");
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update club info.",
      );
    }
  }

  async function handleCreateDepartment() {
    if (!newDepartmentName.trim()) return;

    try {
      await createDepartment(
        newDepartmentName.trim(),
        Math.max(0, newDepartmentOpenPositions),
        newDepartmentDescription.trim(),
      );
      setNewDepartmentName("");
      setNewDepartmentDescription("");
      setNewDepartmentOpenPositions(0);
      setMessage("Department created.");
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to create department.",
      );
    }
  }

  async function handleCreateSlot() {
    if (!newSlotStart || !newSlotEnd) return;

    try {
      await createInterviewSlot(toIsoString(newSlotStart), toIsoString(newSlotEnd));
      setNewSlotStart("");
      setNewSlotEnd("");
      setMessage("Interview slot created.");
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to create interview slot.",
      );
    }
  }

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Edit club info"
          description="Manage your club details, departments, and available interview slots."
          onRefresh={refetch}
        />

        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading club information...
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

                  <button
                    type="button"
                    onClick={() => void handleSaveClubInfo()}
                    className="w-fit rounded-xl border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/20"
                  >
                    Edit club details
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
                <h3 className="text-xl font-semibold text-white">Create department</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    placeholder="Department name"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={newDepartmentOpenPositions}
                    onChange={(e) => setNewDepartmentOpenPositions(Number(e.target.value))}
                    placeholder="Open positions"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    value={newDepartmentDescription}
                    onChange={(e) => setNewDepartmentDescription(e.target.value)}
                    placeholder="Description"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleCreateDepartment()}
                  className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
                >
                  Create department
                </button>
              </div>

              <div className="space-y-4">
                {data.departments.map((department) => (
                  <ClubAdminDepartmentManagementCard
                    key={department.departmentId}
                    department={department}
                    onSaveOpenPositions={updateOpenPositions}
                    onSaveDepartment={updateDepartment}
                  />
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
                <h3 className="text-xl font-semibold text-white">
                  Available interview slots
                </h3>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input
                    type="datetime-local"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    type="datetime-local"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateSlot()}
                    className="rounded-xl border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/20"
                  >
                    Create slot
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {interviewSlots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      No available interview slots.
                    </div>
                  ) : (
                    interviewSlots.map((slot) => (
                      <InterviewSlotRow
                        key={slot.slotId}
                        slotId={slot.slotId}
                        startTime={slot.startTime}
                        endTime={slot.endTime}
                        onSave={updateInterviewSlot}
                      />
                    ))
                  )}
                </div>
              </div>

              {message ? (
                <div className="text-sm text-emerald-300">{message}</div>
              ) : null}
              {saveError ? <div className="text-sm text-rose-300">{saveError}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </ClubAdminShell>
  );
}

function InterviewSlotRow({
  slotId,
  startTime,
  endTime,
  onSave,
}: {
  slotId: string;
  startTime: string;
  endTime: string;
  onSave: (slotId: string, startTime: string, endTime: string) => Promise<void>;
}) {
  const [start, setStart] = useState(toDateTimeLocalValue(startTime));
  const [end, setEnd] = useState(toDateTimeLocalValue(endTime));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(slotId, toIsoString(start), toIsoString(end));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_1fr_auto]">
      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
      />
      <input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
      />
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Update"}
      </button>
    </div>
  );
}
