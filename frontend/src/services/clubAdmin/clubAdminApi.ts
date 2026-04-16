import { apiGet, apiPost, apiPut } from "../api";
import { getStoredUser } from "../auth/auth.api";
import { mapClubCategory, toClubCategoryApiValue } from "../../features/public/utils/clubCategory";
import type {
  AdminDecision,
  AdminApplicationStatus,
} from "../../types/clubAdmin/clubAdmin";
import type { UserApplicationDto } from "../../types/account/accountApplications";
import type { ClubAdminClubInfo } from "../../features/clubAdmin/types/clubAdminTypes";

type ClubDto = {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: number | string | null;
  requiredApprovals?: number;
};

type DepartmentDto = {
  clubId: string;
  departmentId: string;
  departmentName: string;
  description: string;
  numberOfOpenPositions: number;
};

type ClubUpdateRequest = {
  clubName: string;
  applicationQuestions: string[];
  requiredApprovals: number;
  description: string;
  category: number;
};

type DepartmentUpdateRequest = {
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

type DepartmentCreateRequest = {
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

type InterviewSlotDto = {
  slotId: string;
  startTime: string;
  endTime: string;
};

type SlotUpdateRequest = {
  startTime: string;
  endTime: string;
};

type MessageResponse = {
  message: string;
};

type RoleDto = {
  roleId: string;
  roleName: string;
};

type UserInfoDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
};

function parseJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function resolveCurrentClubId(): string {
  const token = localStorage.getItem("auth_token");
  const payload = parseJwtPayload(token);

  if (
    payload &&
    typeof payload.adminClubId === "string" &&
    payload.adminClubId.length > 0
  ) {
    return payload.adminClubId;
  }

  if (payload && typeof payload.clubId === "string" && payload.clubId.length > 0) {
    return payload.clubId;
  }

  const storedUser = getStoredUser();
  if (storedUser?.adminClubId) return storedUser.adminClubId;
  if (storedUser?.clubId) return storedUser.clubId;

  throw new Error("Could not resolve the current club from auth data.");
}

function mapApplicationStatus(value: number): AdminApplicationStatus {
  if (value === 5) return "Admitted";
  if (value === 4) return "Rejected";
  if (value === 3 || value === 2) return "Approved";
  return "Pending";
}

async function fetchCurrentClubBundle(clubId: string): Promise<{
  club: ClubDto;
  departments: DepartmentDto[];
}> {
  const [clubs, departments] = await Promise.all([
    apiGet<ClubDto[]>("/api/recruitmentInfo/api/clubs"),
    apiGet<DepartmentDto[]>(`/api/recruitmentInfo/api/departments-club/${clubId}`),
  ]);

  const club = clubs.find((c) => c.clubId === clubId);
  if (!club) {
    throw new Error("Could not find the current club.");
  }

  return { club, departments };
}

async function updateClubWithCurrentValues(
  clubId: string,
  patch: Partial<ClubUpdateRequest>,
): Promise<MessageResponse> {
  const { club } = await fetchCurrentClubBundle(clubId);

  const body: ClubUpdateRequest = {
    clubName: patch.clubName ?? club.clubName,
    applicationQuestions: patch.applicationQuestions ?? club.admissionQuestions ?? [],
    requiredApprovals: patch.requiredApprovals ?? 1,
    description: patch.description ?? club.description ?? "",
    category:
      patch.category ??
      toClubCategoryApiValue(club.category),
  };

  return apiPut<ClubUpdateRequest, MessageResponse>(
    `/api/recruitmentInfo/api/update-club-information/${clubId}`,
    body,
  );
}

export const clubAdminApi = {
  async getCurrentClubInfo(): Promise<ClubAdminClubInfo> {
    const clubId = resolveCurrentClubId();
    const { club, departments } = await fetchCurrentClubBundle(clubId);

    return {
      clubId: club.clubId,
      clubName: club.clubName,
      description: club.description ?? "",
      category: mapClubCategory(club.category),
      requiredApprovals: club.requiredApprovals ?? 1,
      admissionQuestions: club.admissionQuestions ?? [],
      departments: departments.map((d) => ({
        departmentId: d.departmentId,
        departmentName: d.departmentName,
        description: d.description,
        openPositions: d.numberOfOpenPositions,
        headName: null,
        headUserId: null,
      })),
    };
  },

  async updateClubInfo(input: {
    clubId: string;
    clubName: string;
    description: string;
    category: string;
    requiredApprovals: number;
    applicationQuestions: string[];
  }): Promise<MessageResponse> {
    return updateClubWithCurrentValues(input.clubId, {
      clubName: input.clubName,
      description: input.description,
      requiredApprovals: input.requiredApprovals,
      applicationQuestions: input.applicationQuestions,
      category: toClubCategoryApiValue(input.category),
    });
  },

  async updateAdmissionQuestions(clubId: string, questions: string[]) {
    return updateClubWithCurrentValues(clubId, {
      applicationQuestions: questions,
    });
  },

  async createDepartment(input: DepartmentCreateRequest): Promise<MessageResponse> {
    return apiPost<DepartmentCreateRequest, MessageResponse>(
      "/api/recruitmentInfo/api/create-department",
      input,
    );
  },

  async updateDepartment(
    departmentId: string,
    input: DepartmentUpdateRequest,
  ): Promise<MessageResponse> {
    return apiPut<DepartmentUpdateRequest, MessageResponse>(
      `/api/recruitmentInfo/api/update-department-information/${departmentId}`,
      input,
    );
  },

  async updateOpenPositions(departmentId: string, openPositions: number) {
    const clubId = resolveCurrentClubId();
    const { departments } = await fetchCurrentClubBundle(clubId);
    const department = departments.find((d) => d.departmentId === departmentId);
    if (!department) {
      throw new Error("Department not found.");
    }

    return this.updateDepartment(departmentId, {
      departmentName: department.departmentName,
      description: department.description,
      numberOfOpenPositions: openPositions,
    });
  },

  async getAvailableRoles(): Promise<RoleDto[]> {
    return apiGet<RoleDto[]>("/api/recruitmentInfo/api/roles");
  },

  async assignBoardMember(
    userId: string,
    departmentId: string,
    roleId: string,
  ): Promise<MessageResponse> {
    return apiPut<{ departmentId: string; roleId: string }, MessageResponse>(
      `/api/recruitmentInfo/api/assign-board-member/${userId}`,
      { departmentId, roleId },
    );
  },

  async getUserInformation(userId: string): Promise<UserInfoDto> {
    return apiGet<UserInfoDto>(`/api/recruitmentInfo/api/user-information/${userId}`);
  },

  async getAvailableInterviewSlots(clubId: string): Promise<InterviewSlotDto[]> {
    return apiGet<InterviewSlotDto[]>(
      `/api/recruitmentInfo/api/available-interview-slots/${clubId}`,
    );
  },

  async createInterviewSlot(
    clubId: string,
    startTime: string,
    endTime: string,
  ): Promise<MessageResponse> {
    return apiPost<
      { clubId: string; startTime: string; endTime: string },
      MessageResponse
    >("/api/recruitmentInfo/api/create-interview-slot", {
      clubId,
      startTime,
      endTime,
    });
  },

  async updateInterviewSlot(
    slotId: string,
    startTime: string,
    endTime: string,
  ): Promise<MessageResponse> {
    return apiPut<SlotUpdateRequest, MessageResponse>(
      `/api/recruitmentInfo/api/update-interview-slot/${slotId}`,
      {
        startTime,
        endTime,
      },
    );
  },

  async getApplicationDetail(applicationId: string) {
    const clubId = resolveCurrentClubId();
    const [applications, departments] = await Promise.all([
      apiGet<UserApplicationDto[]>(`/api/recruitmentInfo/api/applications-club/${clubId}`),
      apiGet<DepartmentDto[]>(`/api/recruitmentInfo/api/departments-club/${clubId}`),
    ]);

    const application = applications.find((a) => a.applicationId === applicationId);
    if (!application) {
      throw new Error("Application not found.");
    }

    const user = await apiGet<{
      userId: string;
      firstName: string;
      lastName: string;
      email: string;
    }>(`/api/recruitmentInfo/api/user-information/${application.userId}`);

    const department = departments.find(
      (d) => d.departmentId === application.departmentId,
    );

    return {
      id: application.applicationId,
      applicantId: application.userId,
      applicantName: `${user.firstName} ${user.lastName}`.trim(),
      submittedAt: "",
      status: mapApplicationStatus(application.applicationStatus),
      departmentId: application.departmentId,
      approvalsCount: 0,
      requiredApprovals: 1,
      answers: Object.entries(application.questionnaire ?? {}).map(
        ([question, answer]) => ({
          question,
          answer: String(answer ?? ""),
        }),
      ),
      attachments: [],
      assignedBoardMembers: [],
      notes: department?.departmentName ?? "",
    };
  },

  async finalizeApplication(applicationId: string, decision: AdminDecision) {
    if (decision === "Admit") {
      await apiPut<undefined, unknown>(
        `/api/conclude-accept-application/${applicationId}`,
        undefined,
      );
      return { applicationId, status: "Admitted" as const };
    }

    await apiPut<undefined, unknown>(
      `/api/conclude-reject-application/${applicationId}`,
      undefined,
    );
    return { applicationId, status: "Rejected" as const };
  },
};
