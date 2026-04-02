import type { UserRole } from "./roles";

export type AccountNavKey =
  | "your profile"
  | "applications"
  | "interviews"
  | "clubPanel"
  | "systemPanel";

export type AccountNavItem = {
  key: AccountNavKey;
  label: string;
  description?: string;
  to: string;
  icon?: "user" | "file" | "shield" | "settings";
  roles: UserRole[];
};

export type AccountNavSection = {
  title?: string;
  items: AccountNavItem[];
};