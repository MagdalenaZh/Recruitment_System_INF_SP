import { useMemo, useState } from "react";
import type { UserProfile, UpdateProfileRequest } from "../types/profile";
import type { UserRole } from "../types/roles";

// TEMP: until backend exists
const MOCK_PROFILE: UserProfile = {
  userId: "demo-user-id",
  role: "Applicant",
  firstName: "Jenny",
  lastName: "Smith",
  email: "jenny@aubg.edu",
  avatarUrl: null,
};

export function useUserProfile(role: UserRole) {
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...MOCK_PROFILE,
    role,
  }));

  const fullName = useMemo(
    () => `${profile.firstName} ${profile.lastName}`.trim(),
    [profile.firstName, profile.lastName]
  );

  async function updateProfile(input: UpdateProfileRequest) {
    // later: POST /api/me/profile
    setProfile((p) => ({
      ...p,
      firstName: input.firstName,
      lastName: input.lastName,
      avatarUrl: input.avatarUrl ?? p.avatarUrl,
    }));
  }

  return { profile, fullName, updateProfile };
}