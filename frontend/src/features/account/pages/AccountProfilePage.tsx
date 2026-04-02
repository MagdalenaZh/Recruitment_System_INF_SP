import { useEffect, useRef, useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useUserProfile } from "../hooks/useUserProfile";

export function AccountProfilePage() {
  const { profile, loading, updateProfile, uploadCv } = useUserProfile();

  const cvFileRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [studyMajor, setStudyMajor] = useState("");

  const [selectedCvName, setSelectedCvName] = useState<string | null>(null);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setAcademicYear(profile.academicYear ?? "");
    setStudyMajor(profile.studyMajor ?? "");
    setSelectedCvName(profile.cvFileName ?? null);
  }, [profile]);

  function onPickCv() {
    cvFileRef.current?.click();
  }

  function onCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) return;

    setSelectedCvFile(file);
    setSelectedCvName(file.name);
    e.target.value = "";
  }

  async function onUploadCv() {
    if (!selectedCvFile || !uploadCv) return;

    setUploadingCv(true);
    try {
      await uploadCv(selectedCvFile);
    } finally {
      setUploadingCv(false);
    }
  }

  async function onSave() {
    if (!profile) return;

    setSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        academicYear: academicYear || null,
        studyMajor: studyMajor || null,
        cvUrl: profile.cvUrl ?? null,
        cvFileName: selectedCvName ?? profile.cvFileName ?? null,
        avatarUrl: profile.avatarUrl ?? null,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-600">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-sm text-red-600">Failed to load profile.</div>;
  }

  const isApplicant = profile.role === "Applicant" || profile.role === "User";
  const isBoardMember = profile.role === "BoardMember";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Your profile</h2>
        <p className="mt-1 text-sm text-slate-600">
          View and update your personal information.
        </p>
      </div>

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
          <Input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Freshman, Sophomore, Junior..."
          />
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

            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onUploadCv}
              disabled={!selectedCvFile || uploadingCv}
            >
              {uploadingCv ? "Uploading..." : "Upload CV"}
            </Button>

            <input
              ref={cvFileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={onCvChange}
            />
          </div>

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
