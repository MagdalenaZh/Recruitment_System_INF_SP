import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  updateProfile as updateProfileRequest,
  type CurrentUserResponse,
  type UpdateProfileRequest,
} from "../../../services/account/accountApi";
import {
  getAllClubs,
  getDepartmentsForClub,
} from "../../../services/applications/applicationStatusApi";
import { getStoredUser } from "../../../services/auth/auth.api";
import { normalizeRole } from "../../../types/account/roles";
import type { UserProfile } from "../../../types/account/profile";

function mapCurrentUserToProfile(
  user: CurrentUserResponse,
  options?: {
    departmentId?: string | null;
    departmentName?: string | null;
    clubId?: string | null;
    adminClubId?: string | null;
    clubName?: string | null;
  },
): UserProfile {
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
    departmentId: options?.departmentId ?? user.departmentId ?? null,
    departmentName: options?.departmentName ?? user.departmentName ?? null,
    clubId: options?.clubId ?? user.clubId ?? null,
    adminClubId: options?.adminClubId ?? user.adminClubId ?? null,
    clubName: options?.clubName ?? null,
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      const storedUser = getStoredUser();
      const role = normalizeRole(data.role);
      const clubId =
        data.clubId ??
        data.adminClubId ??
        storedUser?.adminClubId ??
        storedUser?.clubId ??
        null;
      const adminClubId = data.adminClubId ?? storedUser?.adminClubId ?? null;
      const departmentId = data.departmentId ?? storedUser?.departmentId ?? null;

      let departmentName = data.departmentName ?? null;
      if (!departmentName && role === "BoardMember" && clubId && departmentId) {
        try {
          const departments = await getDepartmentsForClub(clubId);
          departmentName =
            departments.find((department) => department.departmentId === departmentId)
              ?.departmentName ?? null;
        } catch {
          departmentName = null;
        }
      }

      let clubName: string | null = null;
      if (clubId && (role === "BoardMember" || role === "ClubAdmin")) {
        try {
          const clubs = await getAllClubs();
          clubName = clubs.find((club) => club.clubId === clubId)?.clubName ?? null;
        } catch {
          clubName = null;
        }
      }

      setProfile(
        mapCurrentUserToProfile(data, {
          departmentId,
          departmentName,
          clubId,
          adminClubId,
          clubName,
        }),
      );
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
