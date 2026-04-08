import type {
  ApplicationAnswer,
  ApplicationDetail,
  ApplicationListItem,
  ApplicationStatus,
  BoardDepartment,
} from "../types/boardTypes";
import type {
  RecruitmentApplicationDto,
  RecruitmentDepartmentDto,
} from "../../../services/board/boardApi";

export function normalizeApplicationStatus(rawStatus: number): ApplicationStatus {
  switch (rawStatus) {
    case 1:
      return "Submitted";
    case 2:
      return "Pending";
    case 3:
      return "Interview";
    case 4:
      return "Rejected";
    case 5:
      return "Approved";
    case 6:
      return "FinalReview";
    default:
      return "Unknown";
  }
}

export function buildApplicantDisplayName(userId: string): string {
  return `Applicant ${userId.slice(0, 8)}`;
}

export function mapQuestionnaireToAnswers(
  questionnaire: Record<string, string> | null | undefined,
): ApplicationAnswer[] {
  if (!questionnaire) return [];

  return Object.entries(questionnaire).map(([question, answer]) => ({
    question,
    answer: String(answer ?? ""),
  }));
}

export function mapDepartmentDtoToBoardDepartment(
  department: RecruitmentDepartmentDto,
  applications: RecruitmentApplicationDto[],
): BoardDepartment {
  const departmentApplications = applications.filter(
    (app) => app.departmentId === department.departmentId,
  );

  const approvedCount = departmentApplications.filter(
    (app) => normalizeApplicationStatus(app.applicationStatus) === "Approved",
  ).length;

  const rejectedCount = departmentApplications.filter(
    (app) => normalizeApplicationStatus(app.applicationStatus) === "Rejected",
  ).length;

  const pendingCount = departmentApplications.filter((app) => {
    const status = normalizeApplicationStatus(app.applicationStatus);
    return (
      status === "Pending" ||
      status === "Submitted" ||
      status === "InterviewPending" ||
      status === "Interview" ||
      status === "FinalReview" ||
      status === "Unknown"
    );
  }).length;

  return {
    clubId: department.clubId,
    departmentId: department.departmentId,
    departmentName: department.departmentName,
    description: department.description,
    targetSpots: department.numberOfOpenPositions,
    totalApplicants: departmentApplications.length,
    approvedCount,
    rejectedCount,
    pendingCount,
  };
}

export function mapApplicationDtoToListItem(
  application: RecruitmentApplicationDto,
  departmentName: string,
): ApplicationListItem {
  return {
    id: application.applicationId,
    applicantName: buildApplicantDisplayName(application.userId),
    applicantEmail: "",
    status: normalizeApplicationStatus(application.applicationStatus),
    submittedAt: new Date().toISOString(),
    approvalsCount: 0,
    requiredApprovals: 0,
    departmentId: application.departmentId,
    departmentName,
    userId: application.userId,
    myVote: null,
  };
}

export function mapApplicationDtoToDetail(
  application: RecruitmentApplicationDto,
  departmentName: string,
  clubId?: string,
): ApplicationDetail {
  return {
    id: application.applicationId,
    applicantName: buildApplicantDisplayName(application.userId),
    applicantEmail: "",
    status: normalizeApplicationStatus(application.applicationStatus),
    approvalsCount: 0,
    requiredApprovals: 0,
    myVote: null,
    submittedAt: new Date().toISOString(),
    departmentId: application.departmentId,
    departmentName,
    clubId,
    userId: application.userId,
    answers: mapQuestionnaireToAnswers(application.questionnaire),
    attachments: [],
    rawApplication: application,
  };
}
