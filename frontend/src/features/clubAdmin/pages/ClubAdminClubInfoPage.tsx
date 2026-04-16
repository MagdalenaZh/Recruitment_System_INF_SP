import { useEffect, useState } from "react";
import { ClubAdminShell } from "../components/ClubAdminShell";
import { ClubAdminPageHeader } from "../components/ClubAdminPageHeader";
import { ClubAdminSectionNav } from "../components/ClubAdminSectionNav";
import { useClubAdminClubInfo } from "../hooks/useClubAdminClubInfo";
import { ClubAdminDepartmentManagementCard } from "../components/ClubAdminDepartmentManagementCard";
import { ApplicationQuestionsManager } from "../components/ApplicationQuestionsManager";
import { AssignBoardMemberModal } from "../components/AssignBoardMemberModal";

const CATEGORY_OPTIONS = [
  "Math & Science",
  "Technology",
  "Sports",
  "Business",
  "Politics",
  "Art",
  "Media & Journalism",
  "Entrepreneurship",
  "Music",
  "Other",
] as const;

export function ClubAdminClubInfoPage() {
  const {
    data,
    loading,
    error,
    refetch,
    updateOpenPositions,
    updateDepartment,
    createDepartment,
    updateClubInfo,
    assignBoardMember,
  } = useClubAdminClubInfo();
  const [
    pendingBoardAssignmentDepartmentId,
    setPendingBoardAssignmentDepartmentId,
  ] = useState<string | null>(null);

  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [requiredApprovals, setRequiredApprovals] = useState(1);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [newDepartmentOpenPositions, setNewDepartmentOpenPositions] =
    useState(0);
  const [savingClub, setSavingClub] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setClubName(data.clubName);
    setDescription(data.description);
    setCategory(data.category || "Other");
    setRequiredApprovals(Math.max(1, data.requiredApprovals || 1));
  }, [data]);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    setMessage(null);
    setSaveError(null);
  }, [clubName, description, category, requiredApprovals]);

  async function handleSaveClubInfo() {
    if (!data) return;

    setSavingClub(true);
    try {
      await updateClubInfo({
        clubName: clubName.trim(),
        description: description.trim(),
        category,
        requiredApprovals: Math.max(1, requiredApprovals),
        applicationQuestions: data.admissionQuestions ?? [],
      });
      setMessage("Club info updated.");
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update club info.",
      );
    } finally {
      setSavingClub(false);
    }
  }

  async function handleSaveQuestions(questions: string[]) {
    if (!data) return;

    try {
      await updateClubInfo({
        clubName: clubName.trim(),
        description: description.trim(),
        category,
        requiredApprovals: Math.max(1, requiredApprovals),
        applicationQuestions: questions,
      });
      setMessage("Application questions updated.");
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update application questions.",
      );
      throw err;
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

  async function handleAssignBoardMember(userId: string) {
    if (!pendingBoardAssignmentDepartmentId) return;

    try {
      const assignedName = await assignBoardMember(
        userId,
        pendingBoardAssignmentDepartmentId,
      );
      setMessage(
        assignedName
          ? `${assignedName} assigned as department head.`
          : "Department head assigned.",
      );
      setSaveError(null);
      setPendingBoardAssignmentDepartmentId(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to assign board member.",
      );
      throw err;
    }
  }

  return (
    <ClubAdminShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Club settings"
          description="Edit your club information, required approvals, departments, and application questions without leaving the page."
          onRefresh={refetch}
        />

        <ClubAdminSectionNav />

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
              <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                      Club profile
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Edit core club information
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Club name
                    </label>
                    <input
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Required approvals
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={requiredApprovals}
                      onChange={(e) =>
                        setRequiredApprovals(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Used across the recruitment flow when approvals are
                      evaluated.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <div
                    className="mr-auto flex min-h-10 items-center"
                    aria-live="polite"
                  >
                    {message ? (
                      <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                        {message}
                      </div>
                    ) : null}
                    {saveError ? (
                      <div className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                        {saveError}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClubName(data.clubName);
                      setDescription(data.description);
                      setCategory(data.category || "Other");
                      setRequiredApprovals(
                        Math.max(1, data.requiredApprovals || 1),
                      );
                      setMessage(null);
                      setSaveError(null);
                    }}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveClubInfo()}
                    disabled={savingClub}
                    className="rounded-xl border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
                  >
                    {savingClub ? "Saving..." : "Save club info"}
                  </button>
                </div>
              </section>

              <ApplicationQuestionsManager
                initialQuestions={data.admissionQuestions ?? []}
                onSave={handleSaveQuestions}
              />

              <section className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur shadow-lg">
                <h3 className="text-xl font-semibold text-white">
                  Create department
                </h3>
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
                    onChange={(e) =>
                      setNewDepartmentOpenPositions(Number(e.target.value))
                    }
                    placeholder="Open positions"
                    className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  />
                  <input
                    value={newDepartmentDescription}
                    onChange={(e) =>
                      setNewDepartmentDescription(e.target.value)
                    }
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
              </section>

              <div className="space-y-4">
                {data.departments.map((department) => (
                  <ClubAdminDepartmentManagementCard
                    key={department.departmentId}
                    department={department}
                    onSaveOpenPositions={updateOpenPositions}
                    onSaveDepartment={updateDepartment}
                    onAssignBoardMember={setPendingBoardAssignmentDepartmentId}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AssignBoardMemberModal
        open={pendingBoardAssignmentDepartmentId !== null}
        departmentName={
          data?.departments.find(
            (department) =>
              department.departmentId === pendingBoardAssignmentDepartmentId,
          )?.departmentName ?? ""
        }
        onClose={() => setPendingBoardAssignmentDepartmentId(null)}
        onSubmit={handleAssignBoardMember}
      />
    </ClubAdminShell>
  );
}
