export type UserRole = "Applicant" | "Board" | "ClubAdmin" | "Admin" | "User";

export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return "User";
  if (role === "Board") return "Board";
  if (role === "ClubAdmin") return "ClubAdmin";
  if (role === "Admin") return "Admin";
  if (role === "Applicant") return "Applicant";
  return "User";
}