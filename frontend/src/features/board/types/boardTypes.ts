export type ApplicationStatus =
  | "Submitted"
  | "Pending"
  | "InterviewPending"
  | "Interview"
  | "FinalReview"
  | "Approved"
  | "Rejected"
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

export type FinalInterviewDecision = "Approved" | "Rejected";

export type InterviewSlotPhase =
  | "Scheduled"
  | "Live now"
  | "Ready for decision"
  | "Decision submitted";

export type BoardInterviewAnswer = {
  id: string;
  question: string;
  answer: string;
};

export type BoardInterviewAttachment = {
  id: string;
  name: string;
};

export type BoardInterviewNote = {
  id: string;
  author: string;
  createdAt: string;
  text: string;
};

export type BoardInterviewDepartmentDecision = {
  departmentId: string;
  departmentName: string;
  roundOneStatus: "Approved" | "Rejected";
  finalDecision: FinalInterviewDecision | null;
  targetSpots: number;
};

export type BoardInterviewSlot = {
  id: string;
  applicationId: string;
  clubId: string;
  clubName: string;
  departmentId: string;
  departmentName: string;
  date: string;
  startTime: string;
  endTime: string;
  startAt: string;
  endAt: string;
  candidateName: string;
  candidateEmail: string;
  answers: BoardInterviewAnswer[];
  attachments: BoardInterviewAttachment[];
  notes: BoardInterviewNote[];
  decisions: BoardInterviewDepartmentDecision[];
};

export type BoardInterviewDepartmentStats = {
  departmentId: string;
  departmentName: string;
  totalApplicants: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  targetSpots: number;
};
