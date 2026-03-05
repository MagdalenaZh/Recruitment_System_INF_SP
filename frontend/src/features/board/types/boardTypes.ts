export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export type BoardVote = "Approve" | "Reject";

export interface BoardDepartment {
  id: string;
  name: string;
  totalApplications: number;
  pendingApplications: number;
}

export interface ApplicationListItem {
  id: string;
  applicantId: string;
  applicantName: string;
  submittedAt: string; // ISO string
  status: ApplicationStatus;

  departmentId: string;

  approvalsCount: number; // e.g. 2
  requiredApprovals: number; // e.g. 10

  myVote?: BoardVote | null;
}

export interface ApplicationAnswer {
  question: string;
  answer: string;
}

export interface ApplicationAttachment {
  id: string;
  fileName: string;
  fileSizeLabel: string; // "1.2 MB"
  url: string; // backend later
}

export interface ApplicationDetail extends ApplicationListItem {
  answers: ApplicationAnswer[];
  attachments: ApplicationAttachment[];
  notes?: string;
}

export interface VoteResult {
  applicationId: string;
  approvalsCount: number;
  requiredApprovals: number;
  status: ApplicationStatus;
  myVote: BoardVote | null;
}

export interface BoardApi {
  getDepartments(): Promise<BoardDepartment[]>;
  getApplicationsByDepartment(departmentId: string): Promise<ApplicationListItem[]>;
  getApplicationDetail(applicationId: string): Promise<ApplicationDetail>;
  voteOnApplication(applicationId: string, vote: BoardVote): Promise<VoteResult>;
}