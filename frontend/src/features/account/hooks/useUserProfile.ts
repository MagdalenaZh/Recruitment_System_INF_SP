import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../../../services/account/accountApi";
import { updateProfile as updateProfileApi } from "../../../services/account/accountApi";
export function useUserProfile() {
  const [profile, setProfile] = useState<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return `${profile.firstName} ${profile.lastName}`.trim();
  }, [profile]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCurrentUser();
        setProfile(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateProfile(data: { firstName: string; lastName: string; avatarUrl?: string | null }) {
  await updateProfileApi(data);
  setProfile((prev) => (prev ? { ...prev, ...data } : prev));
}
  return { profile, fullName, loading, updateProfile };
}