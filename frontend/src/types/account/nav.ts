import type { UserRole } from "./roles";

export type AccountNavKey =
  | "your profile"
  | "applications"
  | "interviews"
  | "board home"
  | "board interviews"
  | "club admin home"
  | "club settings"
  | "club interview slots"
  | "club final decisions"
  | "club applications workspace"
  | "club interviews workspace"
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
