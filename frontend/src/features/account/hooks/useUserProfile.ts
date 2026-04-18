import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  getUserInformation,
  updateProfile as updateProfileRequest,
  type CurrentUserResponse,
  type UpdateProfileRequest,
} from "../../../services/account/accountApi";
import {
  getAllClubs,
  getDepartmentsForClub,
} from "../../../services/applications/applicationStatusApi";
import {
  getStoredUser,
  mergeStoredUser,
} from "../../../services/auth/auth.api";
import { getNormalizedUserRole } from "../../auth/utils/routeAuthorization";
import type { UserProfile } from "../../../types/account/profile";
import {
  createObjectUrlFromBytes,
  decodeBase64ToBytes,
} from "../../../utils/binaryFile";

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
  const effectiveRoleSource =
    (options?.adminClubId ?? user.adminClubId) ? "ClubAdmin" : user.role;

  return {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: getNormalizedUserRole(effectiveRoleSource),
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
  const cvObjectUrlRef = useRef<string | null>(null);

  const revokeCvObjectUrl = useCallback(() => {
    if (!cvObjectUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(cvObjectUrlRef.current);
    cvObjectUrlRef.current = null;
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      const storedUser = getStoredUser();
      const syncedStoredUser =
        mergeStoredUser({
          userId: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          departmentId: data.departmentId ?? null,
          clubId: data.clubId ?? null,
          adminClubId: data.adminClubId ?? null,
        }) ?? storedUser;
      const userInformation =
        data.userId
          ? await getUserInformation(data.userId).catch(() => null)
          : null;
      const effectiveRoleSource =
        (data.adminClubId ?? syncedStoredUser?.adminClubId) ? "ClubAdmin" : data.role;
      const role = getNormalizedUserRole(effectiveRoleSource);
      const clubId =
        data.clubId ??
        data.adminClubId ??
        syncedStoredUser?.adminClubId ??
        syncedStoredUser?.clubId ??
        null;
      const adminClubId = data.adminClubId ?? syncedStoredUser?.adminClubId ?? null;
      const departmentId = data.departmentId ?? null;

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

      revokeCvObjectUrl();
      const cvBytes = decodeBase64ToBytes(userInformation?.cv?.content);
      const generatedCvUrl = createObjectUrlFromBytes(
        cvBytes,
        userInformation?.cv?.contentType,
      );
      cvObjectUrlRef.current = generatedCvUrl;

      setProfile(
        {
          ...mapCurrentUserToProfile(data, {
            departmentId,
            departmentName,
            clubId,
            adminClubId,
            clubName,
          }),
          firstName: userInformation?.firstName ?? data.firstName,
          lastName: userInformation?.lastName ?? data.lastName,
          email: userInformation?.email ?? data.email,
          academicYear: userInformation?.academicYear ?? null,
          studyMajor: userInformation?.studyMajor ?? null,
          cv: userInformation?.cv
            ? {
                ...userInformation.cv,
                content: cvBytes,
              }
            : null,
          cvUrl: generatedCvUrl ?? data.cvUrl ?? null,
          cvFileName: userInformation?.cv?.fileName ?? data.cvFileName ?? null,
        },
      );
    } finally {
      setLoading(false);
    }
  }, [revokeCvObjectUrl]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => revokeCvObjectUrl, [revokeCvObjectUrl]);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      await updateProfileRequest(data);
      await loadProfile();
    },
    [loadProfile]
  );

  return {
    profile,
    loading,
    updateProfile,
  };
}
