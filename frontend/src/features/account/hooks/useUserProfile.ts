import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  updateProfile as updateProfileRequest,
  type CurrentUserResponse,
  type UpdateProfileRequest,
} from "../../../services/account/accountApi";
import { normalizeRole } from "../../../types/account/roles";
import type { UserProfile } from "../../../types/account/profile";

function mapCurrentUserToProfile(user: CurrentUserResponse): UserProfile {
  return {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: normalizeRole(user.role),
    avatarUrl: user.avatarUrl ?? null,
    academicYear: user.academicYear ?? null,
    studyMajor: user.studyMajor ?? null,
    cvUrl: user.cvUrl ?? null,
    cvFileName: user.cvFileName ?? null,
    departmentId: user.departmentId ?? null,
    departmentName: user.departmentName ?? null,
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setProfile(mapCurrentUserToProfile(data));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      await updateProfileRequest(data);
      await loadProfile();
    },
    [loadProfile]
  );
  
  const uploadCv = useCallback(
    async (_file: File) => {
      // Implementation for uploading CV
    },
    []
  );

  return {
    profile,
    loading,
    updateProfile,
    uploadCv
  };
}
