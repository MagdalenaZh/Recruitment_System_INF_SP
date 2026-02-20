import type { AccountNavSection } from "../types/nav";

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
        roles: ["Applicant", "Board", "ClubAdmin", "Admin", "User"],
        },
      {
        key: "inbox",
        label: "Inbox",
        description: "Updates about your applications",
        to: "/account/inbox",
        icon: "inbox",
        roles: ["Applicant", "Board", "ClubAdmin", "Admin", "User"],
      },
      {
        key: "applications",
        label: "My applications",
        description: "Statuses, interviews, decisions",
        to: "/account/applications",
        icon: "file",
        roles: ["Applicant", "User"], 
      },
    ],
  },

  // future: board/review tasks
  {
    title: "Board tools",
    items: [
      {
        key: "tasks",
        label: "Review tasks",
        description: "Assigned applications to review",
        to: "/account/tasks",
        icon: "shield",
        roles: ["Board", "ClubAdmin", "Admin"],
      },
      {
        key: "clubPanel",
        label: "Club panel",
        description: "Manage club recruitment settings",
        to: "/account/club",
        icon: "settings",
        roles: ["ClubAdmin", "Admin"],
      },
    ],
  },
];