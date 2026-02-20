import type { UserRole } from "./roles";

export type UserProfile = {
  userId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
    avatarUrl?: string | null;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null; 
};

export type UpdateProfileResponse = UserProfile;