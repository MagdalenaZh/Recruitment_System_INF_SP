export type AdminApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Admitted";

export type AdminDecision = "Admit" | "Reject";

export interface ClubAdminDepartment {
  id: string;
  name: string;
  totalApplications: number;
  pendingApplications: number;
}

export interface ClubAdminApplicationListItem {
  id: string;
  applicantId: string;
  applicantName: string;
  submittedAt: string;
  status: AdminApplicationStatus;
  departmentId: string;
  approvalsCount: number;
  requiredApprovals: number;
}

export interface ClubAdminApplicationAnswer {
  question: string;
  answer: string;
}

export interface ClubAdminApplicationAttachment {
  id: string;
  fileName: string;
  fileSizeLabel: string;
  url: string;
}

export interface ClubAdminApplicationDetail
  extends ClubAdminApplicationListItem {
  answers: ClubAdminApplicationAnswer[];
  attachments: ClubAdminApplicationAttachment[];
  assignedBoardMembers: string[];
  notes?: string;
}

export interface BoardMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedDepartments: string[];
}

export interface FinalizeResult {
  applicationId: string;
  status: AdminApplicationStatus;
}

export interface ClubAdminApi {
  getDepartments(): Promise<ClubAdminDepartment[]>;
  getApplicationsByDepartment(
    departmentId: string
  ): Promise<ClubAdminApplicationListItem[]>;
  getApplicationDetail(
    applicationId: string
  ): Promise<ClubAdminApplicationDetail>;
  finalizeApplication(
    applicationId: string,
    decision: AdminDecision
  ): Promise<FinalizeResult>;
  getBoardMembers(): Promise<BoardMember[]>;
}

export interface ClubInfo {
  name: string;
  shortDescription: string;
  longDescription: string;
  recruitmentOpen: boolean;
  contactEmail: string;
  location: string;
}