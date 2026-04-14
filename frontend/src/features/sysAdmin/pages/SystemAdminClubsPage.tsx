import { useMemo, useState } from "react";
import { AddClubModal } from "../components/AddClubModal";
import { ClubCard } from "../components/ClubCard";
import { useSysAdmin } from "../context/SysAdminContext";
import {
  createDepartment,
  getDepartmentsForClub,
  promoteUserToClubAdmin,
  updateClubInformation,
  updateDepartmentInformation,
} from "../api/sysAdminApi";
import { mapClubCategory } from "../../public/utils/clubCategory";

export function SystemAdminClubsPage() {
  const { clubs, loading, error, refresh, addClub } = useSysAdmin();
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return clubs;

    return clubs.filter(
      (club) =>
        club.clubName.toLowerCase().includes(normalized) ||
        club.category.toLowerCase().includes(normalized) ||
        club.description.toLowerCase().includes(normalized),
    );
  }, [clubs, query]);

  async function handleAssignAdmin(clubId: string, clubName: string) {
    const userId = window.prompt(
      `Enter user ID to promote as club admin for "${clubName}"`,
    );
    if (!userId) return;

    try {
      await promoteUserToClubAdmin(userId.trim(), clubId);
      setNotice(`Updated club admin assignment for "${clubName}".`);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? `Failed to assign admin: ${err.message}`
          : "Failed to assign admin.",
      );
    }
  }

  async function handleEditClub(
    clubId: string,
    clubName: string,
    category: string,
    description: string,
    admissionQuestions: string[],
  ) {
    const nextName = window.prompt("Club name", clubName);
    if (!nextName) return;

    const nextCategory = window.prompt(
      "Category (Math & Science, Technology, Sports, Business, Politics, Art, Media & Journalism, Entrepreneurship, Music, Other)",
      category || "Other",
    );
    if (!nextCategory) return;

    const nextDescription = window.prompt("Description", description) ?? "";
    const questionsCsv = window.prompt(
      "Application questions (comma separated)",
      admissionQuestions.join(", "),
    );
    const requiredApprovalsRaw = window.prompt("Required approvals", "1");
    const requiredApprovals = Number(requiredApprovalsRaw ?? "1");

    try {
      await updateClubInformation(clubId, {
        clubName: nextName,
        category: mapClubCategory(nextCategory),
        description: nextDescription,
        requiredApprovals:
          Number.isFinite(requiredApprovals) && requiredApprovals > 0
            ? requiredApprovals
            : 1,
        applicationQuestions:
          questionsCsv?.split(",").map((q) => q.trim()).filter(Boolean) ?? [],
      });
      await refresh();
      setNotice(`Updated club "${nextName}".`);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? `Failed to update club: ${err.message}`
          : "Failed to update club.",
      );
    }
  }

  async function handleCreateDepartment(clubId: string, clubName: string) {
    const departmentName = window.prompt(
      `Department name for "${clubName}"`,
      "",
    );
    if (!departmentName) return;
    const description = window.prompt("Department description", "") ?? "";
    const openPositionsRaw = window.prompt("Open positions", "1");
    const openPositions = Number(openPositionsRaw ?? "1");

    try {
      await createDepartment({
        clubId,
        departmentName,
        description,
        numberOfOpenPositions:
          Number.isFinite(openPositions) && openPositions >= 0
            ? openPositions
            : 0,
      });
      setNotice(`Created department "${departmentName}".`);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? `Failed to create department: ${err.message}`
          : "Failed to create department.",
      );
    }
  }

  async function handleEditDepartment(clubId: string, clubName: string) {
    try {
      const departments = await getDepartmentsForClub(clubId);
      if (departments.length === 0) {
        setNotice(`No departments found for "${clubName}".`);
        return;
      }

      const deptList = departments
        .map((d) => `${d.departmentId} - ${d.departmentName}`)
        .join("\n");
      const selectedDepartmentId = window.prompt(
        `Choose department ID to edit for "${clubName}":\n${deptList}`,
      );
      if (!selectedDepartmentId) return;

      const department = departments.find(
        (d) => d.departmentId === selectedDepartmentId.trim(),
      );
      if (!department) {
        setNotice("Department ID not found.");
        return;
      }

      const departmentName = window.prompt(
        "Department name",
        department.departmentName,
      );
      if (!departmentName) return;

      const description =
        window.prompt("Department description", department.description) ?? "";
      const openPositionsRaw = window.prompt(
        "Open positions",
        String(department.numberOfOpenPositions),
      );
      const openPositions = Number(openPositionsRaw);

      await updateDepartmentInformation(department.departmentId, {
        departmentName,
        description,
        numberOfOpenPositions:
          Number.isFinite(openPositions) && openPositions >= 0
            ? openPositions
            : department.numberOfOpenPositions,
      });
      setNotice(`Updated department "${departmentName}".`);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? `Failed to update department: ${err.message}`
          : "Failed to update department.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sky-200/70">
            Manage clubs
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Club list</h2>
          <p className="mt-2 text-sm text-slate-400">
            Create clubs and manage existing club records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="rounded-2xl bg-sky-500/20 px-4 py-3 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
        >
          + Create club
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs by name, category, or description..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {notice ? (
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {notice}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
          Loading clubs...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-100">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-4 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((club) => (
              <ClubCard
                key={club.clubId}
                club={club}
                actions={
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        void handleAssignAdmin(club.clubId, club.clubName)
                      }
                      className="rounded-2xl bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/30"
                    >
                      Assign / Reassign admin
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleEditClub(
                          club.clubId,
                          club.clubName,
                          club.category,
                          club.description,
                          club.admissionQuestions,
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                    >
                      Edit club
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCreateDepartment(club.clubId, club.clubName)
                      }
                      className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20"
                    >
                      Add department
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleEditDepartment(club.clubId, club.clubName)
                      }
                      className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
                    >
                      Edit department
                    </button>
                  </div>
                }
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
              No clubs found.
            </div>
          ) : null}
        </>
      ) : null}

      <AddClubModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={addClub}
      />
    </div>
  );
}
