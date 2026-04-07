import type { AccountNavSection } from "../../../types/account/nav";

export const ACCOUNT_NAV_SECTIONS: AccountNavSection[] = [
  {
    title: "Account",
    items: [
      {
        key: "your profile",
        label: "Your profile",
        description: "View and edit your personal information",
        to: "/account",
        icon: "user",
        roles: ["Applicant", "BoardMember", "ClubAdmin", "SystemAdmin", "User"],
      },
      {
        key: "applications",
        label: "My applications",
        description: "Statuses, interviews, decisions",
        to: "/account/applications",
        icon: "file",
        roles: ["Applicant", "User"],
      },
      {
        key: "interviews",
        label: "Interview booking",
        description: "Choose and book your interview slot",
        to: "/account/interview-booking",
        icon: "file",
        roles: ["Applicant", "User"],
      },
    ],
  },
  {
    title: "Board tools",
    items: [
      {
        key: "clubPanel",
        label: "Club panel",
        description: "Manage club recruitment settings",
        to: "/account/club",
        icon: "settings",
        roles: ["ClubAdmin", "SystemAdmin"],
      },
    ],
  },
];