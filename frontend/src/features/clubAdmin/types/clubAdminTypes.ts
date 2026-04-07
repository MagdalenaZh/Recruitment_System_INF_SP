export interface ClubAdminClubDepartmentInfo {
  departmentId: string;
  departmentName: string;
  description: string;
  openPositions: number;
  headName?: string | null;
  headUserId?: string | null;
}

export interface ClubAdminClubInfo {
  clubId: string;
  clubName: string;
  description: string;
  category: string;
  admissionQuestions: string[];
  departments: ClubAdminClubDepartmentInfo[];
}