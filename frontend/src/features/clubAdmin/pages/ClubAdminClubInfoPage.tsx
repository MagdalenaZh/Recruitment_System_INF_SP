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
    useState("");
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
        Math.max(0, Number(newDepartmentOpenPositions) || 0),
        newDepartmentDescription.trim(),
      );
      setNewDepartmentName("");
      setNewDepartmentDescription("");
      setNewDepartmentOpenPositions("");
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
        <div className="mb-8">
          <ClubAdminSectionNav />
        </div>
        <ClubAdminPageHeader
          backTo="/club-admin"
          backLabel="Back to admin home"
          title="Club settings"
          description="Edit your club information, departments, and application questions."
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
              <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg">
                <div>
                  <h2 className=" text-sky-300 mt-2 text-3xl font-semibold ">
                    Club profile
                  </h2>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                      Club name
                    </label>
                    <input
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_240px]">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                      Required approvals
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={requiredApprovals}
                      onChange={(e) =>
                        setRequiredApprovals(Number(e.target.value))
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <div
                    className="flex min-h-10 items-center"
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

                  <div className="flex flex-wrap gap-3">
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
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="mt-2 text-3xl font-semibold text-emerald-200">
                      Departments
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                      Create new departments and manage the ones that already
                      exist.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Total departments
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-white">
                      {data.departments.length}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                    Create department
                  </p>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_220px_1.4fr]">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                        Department name
                      </label>
                      <input
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        placeholder="Marketing, Events, Logistics..."
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                        Available spots
                      </label>
                      <input
                        type="number"
                        placeholder="8"
                        min={0}
                        value={newDepartmentOpenPositions}
                        onChange={(e) =>
                          setNewDepartmentOpenPositions(e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                        Short description
                      </label>
                      <input
                        value={newDepartmentDescription}
                        onChange={(e) =>
                          setNewDepartmentDescription(e.target.value)
                        }
                        placeholder="What applicants will work on in this department"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() => void handleCreateDepartment()}
                      className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
                    >
                      Create department
                    </button>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="mt-2 text-3xl font-semibold text-emerald-200">
                        Current departments
                      </h3>
                    </div>
                  </div>

                  {data.departments.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-5 text-sm text-slate-300">
                      No departments yet. Create your first one above to start
                      organizing applicants.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {data.departments.map((department) => (
                        <ClubAdminDepartmentManagementCard
                          key={department.departmentId}
                          department={department}
                          onSaveDepartment={updateDepartment}
                          onAssignBoardMember={
                            setPendingBoardAssignmentDepartmentId
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur shadow-lg">
                <div>
                  <h2 className="mt-2 text-3xl font-semibold text-yellow-200">
                    Application
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                    Maintain the questions applicants answer when applying to
                    your club.
                  </p>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                  <ApplicationQuestionsManager
                    initialQuestions={data.admissionQuestions ?? []}
                    onSave={handleSaveQuestions}
                  />
                </div>
              </section>
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
