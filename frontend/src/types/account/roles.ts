export type UserRole = "Applicant" | "BoardMember" | "ClubAdmin" | "Admin" | "User";

export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return "User";
  if (role === "BoardMember") return "BoardMember";  // was "Board"
  if (role === "ClubAdmin") return "ClubAdmin";
  if (role === "Admin") return "Admin";
  if (role === "Applicant") return "Applicant";
  return "User";
}