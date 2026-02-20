import type { UserRole } from "./roles";

export type AccountNavKey = "editProfile" | "inbox" | "applications" | "tasks" | "clubPanel";

export type AccountNavItem = {
  key: AccountNavKey;
  label: string;
  description?: string;
  to: string;

  icon?: "user" | "inbox" | "file" | "shield" | "settings";
  roles: UserRole[]; 
};

export type AccountNavSection = {
  title?: string;
  items: AccountNavItem[];
};