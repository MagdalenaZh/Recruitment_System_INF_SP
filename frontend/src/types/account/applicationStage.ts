export type ApplicationStage =
  | "Submitted"
  | "UnderReview"
  | "Interview"
  | "Accepted"
  | "Rejected"
  | "Waitlisted";

export type ApplicationListItem = {
  departmentId: string;
  status: string;
  id: string;
  clubName: string;
  stage: ApplicationStage;
  updatedAt: string;
};