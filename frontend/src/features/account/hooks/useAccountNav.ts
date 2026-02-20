import type { UserRole } from "../../../types/account/roles";
import { ACCOUNT_NAV_SECTIONS } from "../config/accountNavConfig";

export function useAccountNav(role: UserRole) {
  return ACCOUNT_NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((i) => i.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}