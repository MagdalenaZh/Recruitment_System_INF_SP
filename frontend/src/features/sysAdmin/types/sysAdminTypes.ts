export interface SysAdminClub {
  id?: string;
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: string;
}

export interface CreateClubInput {
  clubName: string;
  description: string;
  category: string;
}

export interface UpdateClubInput {
  clubName: string;
  applicationQuestions: string[];
  requiredApprovals: number;
  description: string;
  category: string;
}

export interface SysAdminDepartment {
  departmentId: string;
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
}

export interface CreateDepartmentInput {
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
}

export interface UpdateDepartmentInput {
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
}

export interface SysAdminUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ClubAdminAssignment {
  clubId: string;
  userId: string;
}
