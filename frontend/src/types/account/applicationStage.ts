export type ApplicationStage =
  | "Submitted"
  | "UnderReview"
  | "Interview"
  | "Accepted"
  | "Rejected"
  | "Waitlisted";

export type ApplicationListItem = {
  id: string;
  clubName: string;
  stage: ApplicationStage;
  updatedAt: string;
};