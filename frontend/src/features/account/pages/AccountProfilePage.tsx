import { useEffect, useRef, useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useUserProfile } from "../hooks/useUserProfile";

const ACADEMIC_YEAR_OPTIONS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
] as const;

export function AccountProfilePage() {
  const { profile, loading, updateProfile } = useUserProfile();

  const cvFileRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [studyMajor, setStudyMajor] = useState("");

  const [selectedCvName, setSelectedCvName] = useState<string | null>(null);
  const [selectedCvBytes, setSelectedCvBytes] = useState<number[] | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setAcademicYear(profile.academicYear ?? "");
    setStudyMajor(profile.studyMajor ?? "");
    setSelectedCvName(profile.cvFileName ?? null);
    setSelectedCvBytes(null);
  }, [profile]);

  function onPickCv() {
    cvFileRef.current?.click();
  }

  async function onCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    try {
      if (!isPdf) {
        setSaveError("Only PDF CV files are supported.");
        return;
      }

      const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
      setSelectedCvBytes(bytes);
      setSelectedCvName(file.name);
      setSaveError(null);
    } catch {
      setSaveError("Failed to read the selected CV file.");
    } finally {
      e.target.value = "";
    }
  }

  async function onSave() {
    if (!profile) return;

    const normalizedAcademicYear = academicYear.trim();
    const normalizedStudyMajor = studyMajor.trim();
    const hasAcademicYear = normalizedAcademicYear.length > 0;
    const hasStudyMajor = normalizedStudyMajor.length > 0;

    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    if (hasAcademicYear !== hasStudyMajor) {
      setSaving(false);
      setSaveError(
        "Academic year and study major should be filled in together, or both left empty.",
      );
      return;
    }

    try {
      await updateProfile({
        firstName,
        lastName,
        academicYear: normalizedAcademicYear || null,
        studyMajor: normalizedStudyMajor || null,
        cvContent: selectedCvBytes ?? profile.cv?.content ?? null,
        avatarUrl: profile.avatarUrl ?? null,
      });
      setSaveSuccess("Profile updated successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      setSaveError(
        message.includes("StudyMajor")
          ? "Study major is required by the backend. Fill in both academic year and study major, then try again."
          : message,
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!saveSuccess) return;
    const timeout = window.setTimeout(() => setSaveSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [saveSuccess]);

  if (loading) {
    return <div className="text-sm text-slate-600">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-sm text-red-600">Failed to load profile.</div>;
  }

  const isApplicant = profile.role === "Applicant" || profile.role === "User";
  const isBoardMember = profile.role === "BoardMember";
  const isClubAdmin = profile.role === "ClubAdmin";

  return (
    <div className="space-y-6">
      <div>
        <p className="mt-1 text-base text-slate-800">
          View and update your personal information.
        </p>
      </div>

      {saveSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {saveSuccess}
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {saveError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">Email</label>
          <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
            {profile.email}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Role</label>
          <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
            {profile.role}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">
            First name
          </label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Last name
          </label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">
            Academic year
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select academic year</option>
            {ACADEMIC_YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Study major
          </label>
          <Input
            value={studyMajor}
            onChange={(e) => setStudyMajor(e.target.value)}
            placeholder="Computer Science"
          />
        </div>
      </div>

      {isBoardMember && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Department
            </label>
            <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
              {profile.departmentName ?? "Not assigned"}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              This is assigned by a club admin and cannot be edited here.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Club</label>
            <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
              {profile.clubName ?? "Not assigned"}
            </div>
          </div>
        </div>
      )}

      {isClubAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Club</label>
            <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
              {profile.clubName ?? "Not assigned"}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              This is based on your club-admin assignment and cannot be edited
              here.
            </p>
          </div>
        </div>
      )}

      {isApplicant && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-base font-semibold text-slate-900">CV</h3>
            <p className="mt-1 text-sm text-slate-600">
              Upload or replace your CV in PDF format.
            </p>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-slate-600">
              Current CV
            </label>
            <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
              {selectedCvName ?? "No CV uploaded"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onPickCv}>
              Choose CV
            </Button>

            <input
              ref={cvFileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={onCvChange}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            The selected PDF will be uploaded when you save your profile changes.
          </p>

          {profile.cvUrl && (
            <div className="mt-4">
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Open current CV
              </a>
            </div>
          )}
        </div>
      )}

      <div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
