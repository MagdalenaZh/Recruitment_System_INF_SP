import { apiGet, apiPut } from "../../services/api";

export type CurrentUserResponse = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;

  avatarUrl?: string | null;

  academicYear?: string | null;
  studyMajor?: string | null;
  cvUrl?: string | null;
  cvFileName?: string | null;

  departmentId?: string | null;
  departmentName?: string | null;
  clubId?: string | null;
  adminClubId?: string | null;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;

  avatarUrl?: string | null;

  academicYear?: string | null;
  studyMajor?: string | null;
  cvUrl?: string | null;
  cvFileName?: string | null;
};

export async function getCurrentUser() {
  return apiGet<CurrentUserResponse>("/api/auth/me");
}

export async function updateProfile(data: UpdateProfileRequest) {
  return apiPut<UpdateProfileRequest, void>("/api/auth/me", data);
}
