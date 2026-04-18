import type { ApiCvFile } from "../../utils/binaryFile";

export type UserInfoDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  academicYear: string;
  studyMajor: string;
  cv?: ApiCvFile | null;
};

export type BookedInterviewSlotDto = {
  applicationId: string;
  startTime: string;
  endTime: string;
};

export type ApplicationNoteDto = {
  noteId: string;
  applicationId: string;
  userId: string;
  content: string;
  authorName: string;
};
