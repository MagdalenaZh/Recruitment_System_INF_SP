import type { UserRole } from "./roles";

export type CvFile = {
  fileName: string;
  contentType: string;
  content: number[];
};

export type UserProfile = {
  userId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  academicYear?: string | null;
  studyMajor?: string | null;
  cv?: CvFile | null;
  cvUrl?: string | null;
  cvFileName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  clubId?: string | null;
  adminClubId?: string | null;
  clubName?: string | null;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  academicYear?: string | null;
  studyMajor?: string | null;
  cvContent?: number[] | null;
};

export type UpdateProfileResponse = UserProfile;
