import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

import { useUserProfile } from "../hooks/useUserProfile";

export function AccountProfilePage() {
  const { profile, loading, updateProfile } = useUserProfile();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setAvatarPreview(profile.avatarUrl ?? null);
  }, [profile]);

  const initials = useMemo(() => {
    const a = (firstName?.[0] ?? "U").toUpperCase();
    const b = (lastName?.[0] ?? "").toUpperCase();
    return a + b;
  }, [firstName, lastName]);

  function onPickPhoto() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    e.target.value = "";
  }

  function onRemovePhoto() {
    setAvatarPreview(null);
  }

  async function onSave() {
    setSaving(true);

    await updateProfile({
      firstName,
      lastName,
      avatarUrl: avatarPreview,
    });

    setSaving(false);
  }

  if (loading)
    return <div className="text-sm text-slate-600">Loading profile...</div>;
  if (!profile)
    return <div className="text-sm text-red-600">Failed to load profile.</div>;

  return (
    <div>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative">
          <div className="grid h-50 w-50 place-items-center overflow-hidden rounded-full bg-slate-900 text-white text-lg font-semibold ring-2 ring-slate-200">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xl font-medium text-slate-900">
            Profile photo
          </div>
          <div className="text-xs text-slate-500">JPG/PNG</div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={onPickPhoto}>
              Upload photo
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemovePhoto}
              disabled={!avatarPreview}
            >
              Remove
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-600">Email</label>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
          {profile.email}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
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

      <div className="mt-5">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
