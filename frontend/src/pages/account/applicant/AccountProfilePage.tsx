import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useState } from "react";
import { useAuth } from "../../../pages/auth/AuthContext";
import { normalizeRole } from "../types/roles";
import { useUserProfile } from "../hooks/useUserProfile";

export function AccountProfilePage() {
  const { role } = useAuth();
  const normalized = normalizeRole(role);

  const { profile, updateProfile } = useUserProfile(normalized);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    await updateProfile({ firstName, lastName });
    setSaving(false);
  }

  return (
    <div>
      <div className="text-sm font-semibold text-slate-900">Profile</div>
      <div className="mt-1 text-sm text-slate-500">
        Update your personal details.
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
