export type ApplicationStatus =
  | "Submitted"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Interview"
  | "Unknown";

export type BoardVote = "Approve" | "Reject";

export type VoteResult = {
  approvalsCount: number;
  requiredApprovals: number;
  status: ApplicationStatus;
  myVote: BoardVote | null;
};

export type BoardDepartment = {
  departmentId: string;
  departmentName: string;
  description: string;
  targetSpots: number;
  totalApplicants: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  clubId: string;
};

export type ApplicationAnswer = {
  question: string;
  answer: string;
};

export type ApplicationAttachment = {
  id: string;
  fileName: string;
  fileSizeLabel: string;
  url: string;
};

export type ApplicationListItem = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  submittedAt: string;
  approvalsCount: number;
  requiredApprovals: number;
  departmentId: string;
  departmentName: string;
  userId: string;
  myVote: BoardVote | null;
};

export type ApplicationDetail = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  approvalsCount: number;
  requiredApprovals: number;
  myVote: BoardVote | null;
  submittedAt: string;
  departmentId: string;
  departmentName: string;
  clubId?: string;
  userId: string;
  answers: ApplicationAnswer[];
  attachments: ApplicationAttachment[];
  rawApplication?: unknown;
};