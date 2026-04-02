export type UserRole =
  | "Applicant"
  | "BoardMember"
  | "ClubAdmin"
  | "SystemAdmin"
  | "User";

export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return "User";
  if (role === "BoardMember") return "BoardMember";
  if (role === "ClubAdmin") return "ClubAdmin";
  if (role === "SystemAdmin") return "SystemAdmin";
  if (role === "Applicant") return "Applicant";
  return "User";
}