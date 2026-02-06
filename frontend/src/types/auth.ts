export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type RegisterResponse = {
  message: string;
};

export type UserRole = "Applicant" | "BoardMember" | "ClubAdmin";
export type LoginResponse = { token: string; role: UserRole };
