import { apiGet, apiPost } from "../../../services/api";
import type {
  CreateClubInput,
  SysAdminClub,
} from "../types/sysAdminTypes";

type CreateClubRequest = {
  clubName: string;
  admissionQuestions: string[];
  requiredNumberOfApprovals: number;
  description: string;
  category: string;
};

type CreateClubResponse = {
  message: string;
};

export async function getSystemAdminClubs(): Promise<SysAdminClub[]> {
  return apiGet<SysAdminClub[]>("/api/recruitmentInfo/api/clubs", false);
}

export async function createClub(
  input: CreateClubInput,
): Promise<CreateClubResponse> {
  const body: CreateClubRequest = {
    clubName: input.clubName.trim(),
    description: input.description.trim(),
    category: input.category?.trim() ?? "",
    admissionQuestions: [],
    requiredNumberOfApprovals: 1,
  };

  return apiPost<CreateClubRequest, CreateClubResponse>(
    "/api/recruitmentInfo/api/create-club",
    body,
    true,
  );
}