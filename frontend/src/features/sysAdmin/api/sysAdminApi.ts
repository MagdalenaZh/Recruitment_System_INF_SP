import { apiGet, apiPost, apiPut } from "../../../services/api";
import {
  mapClubCategory,
  toClubCategoryApiValue,
} from "../../public/utils/clubCategory";
import type {
  CreateClubInput,
  CreateDepartmentInput,
  SysAdminClub,
  SysAdminDepartment,
  UpdateClubInput,
  UpdateDepartmentInput,
} from "../types/sysAdminTypes";

type ClubDto = {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: number | string | null;
};

type DepartmentDto = {
  departmentId: string;
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

type CreateClubRequest = {
  clubName: string;
  category: number;
};

type UpdateClubRequest = {
  clubName: string;
  applicationQuestions: string[];
  requiredApprovals: number;
  description: string;
  category: number;
};

type CreateDepartmentRequest = {
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

type UpdateDepartmentRequest = {
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

type MessageResponse = {
  message: string;
};

type UserInfoDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
};

function mapClub(dto: ClubDto): SysAdminClub {
  return {
    clubId: dto.clubId,
    clubName: dto.clubName,
    admissionQuestions: dto.admissionQuestions ?? [],
    description: dto.description ?? "",
    category: mapClubCategory(dto.category),
  };
}

function mapDepartment(dto: DepartmentDto): SysAdminDepartment {
  return {
    departmentId: dto.departmentId,
    clubId: dto.clubId,
    departmentName: dto.departmentName,
    numberOfOpenPositions: dto.numberOfOpenPositions,
    description: dto.description,
  };
}

export async function getSystemAdminClubs(): Promise<SysAdminClub[]> {
  const clubs = await apiGet<ClubDto[]>("/api/recruitmentInfo/api/clubs", true);
  return clubs.map(mapClub);
}

export async function createClub(
  input: CreateClubInput,
): Promise<MessageResponse> {
  const body: CreateClubRequest = {
    clubName: input.clubName.trim(),
    category: toClubCategoryApiValue(input.category),
  };

  return apiPost<CreateClubRequest, MessageResponse>(
    "/api/recruitmentInfo/api/create-club",
    body,
    true,
  );
}

export async function updateClubInformation(
  clubId: string,
  input: UpdateClubInput,
): Promise<MessageResponse> {
  const body: UpdateClubRequest = {
    clubName: input.clubName.trim(),
    applicationQuestions: input.applicationQuestions.map((q) => q.trim()),
    requiredApprovals: input.requiredApprovals,
    description: input.description.trim(),
    category: toClubCategoryApiValue(input.category),
  };

  return apiPut<UpdateClubRequest, MessageResponse>(
    `/api/recruitmentInfo/api/update-club-information/${clubId}`,
    body,
    true,
  );
}

export async function getDepartmentsForClub(
  clubId: string,
): Promise<SysAdminDepartment[]> {
  const departments = await apiGet<DepartmentDto[]>(
    `/api/recruitmentInfo/api/departments-club/${clubId}`,
    true,
  );
  return departments.map(mapDepartment);
}

export async function createDepartment(
  input: CreateDepartmentInput,
): Promise<MessageResponse> {
  const body: CreateDepartmentRequest = {
    clubId: input.clubId,
    departmentName: input.departmentName.trim(),
    numberOfOpenPositions: input.numberOfOpenPositions,
    description: input.description.trim(),
  };

  return apiPost<CreateDepartmentRequest, MessageResponse>(
    "/api/recruitmentInfo/api/create-department",
    body,
    true,
  );
}

export async function updateDepartmentInformation(
  departmentId: string,
  input: UpdateDepartmentInput,
): Promise<MessageResponse> {
  const body: UpdateDepartmentRequest = {
    departmentName: input.departmentName.trim(),
    numberOfOpenPositions: input.numberOfOpenPositions,
    description: input.description.trim(),
  };

  return apiPut<UpdateDepartmentRequest, MessageResponse>(
    `/api/recruitmentInfo/api/update-department-information/${departmentId}`,
    body,
    true,
  );
}

export async function promoteUserToClubAdmin(
  userId: string,
  clubId: string,
): Promise<MessageResponse> {
  return apiPut<string, MessageResponse>(
    `/api/recruitmentInfo/api/update-user-promote-club-admin/${userId}`,
    clubId,
    true,
  );
}

export async function getUserInformation(userId: string): Promise<UserInfoDto> {
  return apiGet<UserInfoDto>(
    `/api/recruitmentInfo/api/user-information/${userId}`,
    true,
  );
}
