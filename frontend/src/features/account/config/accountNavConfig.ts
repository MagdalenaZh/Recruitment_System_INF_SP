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
    title: "Board Workspace",
    items: [
      {
        key: "board home",
        label: "Applications workspace",
        description: "Review departments and current applications",
        to: "/board",
        icon: "file",
        roles: ["BoardMember", "ClubAdmin"],
      },
      {
        key: "board interviews",
        label: "Interviews workspace",
        description: "Review scheduled interviews and decisions",
        to: "/board/interviews",
        icon: "file",
        roles: ["BoardMember", "ClubAdmin"],
      },
    ],
  },
  {
    title: "Club Administration",
    items: [
      {
        key: "club admin home",
        label: "Admin panel",
        description: "Open the main club admin dashboard",
        to: "/club-admin",
        icon: "settings",
        roles: ["ClubAdmin"],
      },
      {
        key: "club settings",
        label: "Club settings",
        description: "Edit club information and departments",
        to: "/club-admin/club-info",
        icon: "settings",
        roles: ["ClubAdmin"],
      },
      {
        key: "club interview slots",
        label: "Interview slots",
        description: "Manage available interview booking slots",
        to: "/club-admin/interview-slots",
        icon: "settings",
        roles: ["ClubAdmin"],
      },
      {
        key: "club final decisions",
        label: "Final decisions",
        description: "Review and conclude final applicant decisions",
        to: "/club-admin/final-decisions",
        icon: "settings",
        roles: ["ClubAdmin"],
      },
      {
        key: "club applications workspace",
        label: "Applications workspace",
        description: "Open the shared applications review workspace",
        to: "/board",
        icon: "file",
        roles: ["ClubAdmin"],
      },
      {
        key: "club interviews workspace",
        label: "Interviews workspace",
        description: "Open the shared interview review workspace",
        to: "/board/interviews",
        icon: "file",
        roles: ["ClubAdmin"],
      },
    ],
  },
  {
    title: "System Administration",
    items: [
      {
        key: "systemPanel",
        label: "System admin page",
        description: "Open system administration tools",
        to: "/sys-admin",
        icon: "settings",
        roles: ["SystemAdmin"],
      },
    ],
  },
];
