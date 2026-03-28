export type ClubStatus = "active" | "draft";

export type SysAdminUserRole = "clubAdmin" | "boardMember" | "applicant";

export interface SysAdminClub {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  status: ClubStatus;
  createdAt: string;
}

export interface SysAdminUser {
  id: string;
  name: string;
  email: string;
  role: SysAdminUserRole;
}

export interface ClubAdminAssignment {
  clubId: string;
  adminId: string;
  assignedAt: string;
}

export interface CreateClubInput {
  name: string;
  shortName: string;
  category: string;
  description: string;
}