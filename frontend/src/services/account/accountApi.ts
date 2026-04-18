import { apiGet, apiPut } from "../../services/api";
import {
  encodeBytesToBase64,
  type ApiCvFile,
} from "../../utils/binaryFile";

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

export type UserInformationResponse = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  academicYear?: string | null;
  studyMajor?: string | null;
  cv?: ApiCvFile | null;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;

  avatarUrl?: string | null;

  academicYear?: string | null;
  studyMajor?: string | null;
  cvContent?: number[] | null;
};

export async function getCurrentUser() {
  return apiGet<CurrentUserResponse>("/api/auth/me");
}

export async function getUserInformation(userId: string) {
  return apiGet<UserInformationResponse>(
    `/api/recruitmentInfo/api/user-information/${userId}`,
  );
}

export async function updateProfile(data: UpdateProfileRequest) {
  const payload = {
    ...data,
    cvContent: encodeBytesToBase64(data.cvContent),
  };

  return apiPut<typeof payload, void>(
    "/api/recruitmentInfo/api/update-user-information",
    payload,
  );
}
