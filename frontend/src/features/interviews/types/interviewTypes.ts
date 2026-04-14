export type ApplicationStatusLike = string | number | null | undefined;

export interface UserApplication {
  applicationId: string;
  aggregateId?: string;
  userId?: string;
  departmentId?: string;
  departmentName?: string;
  clubId?: string;
  clubName?: string;
  status?: ApplicationStatusLike;
  applicationStatus?: ApplicationStatusLike;
}

export interface InterviewSlot {
  slotId: string;
  startTime: string;
  endTime: string;
}

export interface BookInterviewSlotRequest {
  applicationId: string;
  slot: InterviewSlot;
}

export interface ApprovedInterviewApplication {
  applicationId: string;
  clubId: string;
  clubName: string;
  departmentName?: string;
}
