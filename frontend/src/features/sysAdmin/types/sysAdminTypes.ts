export interface SysAdminClub {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: string;
}

export interface CreateClubInput {
  clubName: string;
  description: string;
  category?: string;
}