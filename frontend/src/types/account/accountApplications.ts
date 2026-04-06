import type { ApplicationStage } from "./applicationStage";

export type UserApplicationDto = {
  applicationId: string;
  userId: string;
  departmentId: string;
  questionnaire: Record<string, string>;
  applicationStatus: number;
};

export type ClubDto = {
  clubId: string;
  clubName: string;
  description?: string;
  category?: string;
};

export type DepartmentDto = {
  departmentId: string;
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

export type AccountApplicationCard = {
  id: string;
  clubName: string;
  departmentName: string;
  stage: ApplicationStage;
  updatedAt: string;
};