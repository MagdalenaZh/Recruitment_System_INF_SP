import { useState } from "react";
import { ClubAdminPageHeader } from "../components/ClubAdminPageHeader";
import { ClubAdminSectionNav } from "../components/ClubAdminSectionNav";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { useClubAdminClubInfo } from "../hooks/useClubAdminClubInfo";

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

export function ClubAdminInterviewSlotsPage() {
  const {
    interviewSlots,
    loading,
    error,
    refetch,
    createInterviewSlot,
    updateInterviewSlot,
  } = useClubAdminClubInfo();
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleCreateSlot() {
    if (!newSlotStart || !newSlotEnd) return;

    try {
      await createInterviewSlot(
        toIsoString(newSlotStart),
        toIsoString(newSlotEnd),
      );
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
        <div className="mb-8">
          <ClubAdminSectionNav />
        </div>
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Interview slots"
          description="Create and update available interview slots for your club."
          onRefresh={refetch}
        />

        <div className="mt-8 space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
            <h3 className="text-xl font-semibold text-white">
              Create interview slot
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
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-200 backdrop-blur">
              Loading interview slots...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
              {error}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
              <h3 className="text-xl font-semibold text-white">
                Available slots
              </h3>

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
          )}

          {message ? (
            <div className="text-sm text-emerald-300">{message}</div>
          ) : null}
          {saveError ? (
            <div className="text-sm text-rose-300">{saveError}</div>
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
