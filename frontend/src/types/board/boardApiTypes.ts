// Types matching backend board-member API responses.
// Shared application/club/department DTOs live in types/account/accountApplications.ts.

export type UserInfoDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  academicYear: string;
  studyMajor: string;
};

export type BookedInterviewSlotDto = {
  applicationId: string;
  startTime: string;
  endTime: string;
};
