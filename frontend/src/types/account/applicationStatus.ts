import type { ApplicationStage } from "./applicationStage";


export type UserApplicationResponse = {
  applicationId: string;
  userId: string;
  departmentId: string;
  questionnaire: Record<string, string>;
  applicationStatus: number;
};

export type ClubResponse = {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: string;
};

export type DepartmentResponse = {
  departmentId: string;
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

export type InitialRepresentation = {
  applicationId: string;
  applicationProcessed: boolean;
};

export type ProcessingStateRepresentation = {
  applicationId: string;
  requiredNumberOfApprovals: number;
  currentNumberOfApprovals: number;
  userDecisionsMap: Record<string, boolean>;
};

export type HibernatedStateRepresentation = {
  applicationId: string;
  scheduledTime: string;
};

export type ApprovedStateRepresentation = {
  applicationId: string;
  interviewTimesProposals: string[];
};

export type ConcludedStateRepresentation = {
  applicationId: string;
  conclusionResult: string;
};

export type LatestApplicationStateResponse =
  | InitialRepresentation
  | ProcessingStateRepresentation
  | HibernatedStateRepresentation
  | ApprovedStateRepresentation
  | ConcludedStateRepresentation;

export type AccountApplicationCard = {
  id: string;
  clubName: string;
  stage: ApplicationStage;
  updatedAt: string;
};