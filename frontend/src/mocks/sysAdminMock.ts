import type { ClubAdminAssignment, SysAdminClub, SysAdminUser } from "../features/sysAdmin/types/sysAdminTypes";


export const mockSysAdminClubs: SysAdminClub[] = [
  {
    id: "club-1",
    name: "The Hub",
    shortName: "HUB",
    category: "Technology",
    description: "Student technology club focused on software, events, and innovation.",
    status: "active",
    createdAt: "2026-03-01",
  },
  {
    id: "club-2",
    name: "HackAUBG",
    shortName: "HACK",
    category: "Events",
    description: "Hackathon organizing team and innovation community.",
    status: "active",
    createdAt: "2026-03-05",
  },
  {
    id: "club-3",
    name: "Baxter Society",
    shortName: "BAX",
    category: "Academic",
    description: "Academic and leadership-oriented student organization.",
    status: "draft",
    createdAt: "2026-03-10",
  },
];

export const mockSysAdminUsers: SysAdminUser[] = [
  {
    id: "admin-1",
    name: "Elena Petrova",
    email: "elena@aubg.edu",
    role: "clubAdmin",
  },
  {
    id: "admin-2",
    name: "Martin Georgiev",
    email: "martin@aubg.edu",
    role: "clubAdmin",
  },
  {
    id: "user-1",
    name: "Kristina Ivanova",
    email: "kristina@aubg.edu",
    role: "applicant",
  },
  {
    id: "user-2",
    name: "Ivan Kolev",
    email: "ivan@aubg.edu",
    role: "applicant",
  },
  {
    id: "user-3",
    name: "Mariya Nikolova",
    email: "mariya@aubg.edu",
    role: "applicant",
  },
];

export const mockClubAdminAssignments: ClubAdminAssignment[] = [
  {
    clubId: "club-1",
    adminId: "admin-1",
    assignedAt: "2026-03-11",
  },
  {
    clubId: "club-2",
    adminId: "admin-2",
    assignedAt: "2026-03-12",
  },
];