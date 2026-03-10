import type { AdminDecision, BoardMember, ClubAdminApplicationDetail, ClubAdminApplicationListItem, ClubAdminDepartment } from "../features/clubAdmin/types/clubAdminTypes";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const clubAdminDepartmentsSeed = [
  { id: "dep_marketing", name: "Marketing" },
  { id: "dep_design", name: "Design" },
  { id: "dep_tech", name: "Tech" },
  { id: "dep_events", name: "Events" },
];

const initialApplications: ClubAdminApplicationDetail[] = [
  {
    id: "admin_app_001",
    applicantId: "u_001",
    applicantName: "Ivana Petrova",
    submittedAt: isoDaysAgo(2),
    status: "Pending",
    departmentId: "dep_marketing",
    approvalsCount: 2,
    requiredApprovals: 10,
    assignedBoardMembers: ["bm_001", "bm_002"],
    answers: [
      {
        question: "Why do you want to join?",
        answer: "I want to contribute to campaigns and learn by doing.",
      },
      {
        question: "Experience?",
        answer: "Some social media content planning and event promo.",
      },
    ],
    attachments: [
      {
        id: "att_001",
        fileName: "Ivana_CV.pdf",
        fileSizeLabel: "242 KB",
        url: "#",
      },
    ],
  },
  {
    id: "admin_app_002",
    applicantId: "u_002",
    applicantName: "Georgi Dimitrov",
    submittedAt: isoDaysAgo(4),
    status: "Approved",
    departmentId: "dep_design",
    approvalsCount: 8,
    requiredApprovals: 10,
    assignedBoardMembers: ["bm_003"],
    answers: [
      {
        question: "Why this department?",
        answer: "I enjoy branding and visual communication.",
      },
    ],
    attachments: [],
  },
  {
    id: "admin_app_003",
    applicantId: "u_003",
    applicantName: "Maria Ivanova",
    submittedAt: isoDaysAgo(1),
    status: "Pending",
    departmentId: "dep_tech",
    approvalsCount: 1,
    requiredApprovals: 10,
    assignedBoardMembers: ["bm_001"],
    answers: [
      {
        question: "Tech background?",
        answer: "React, TypeScript, and some backend basics.",
      },
    ],
    attachments: [],
  },
];

const initialBoardMembers: BoardMember[] = [
  {
    id: "bm_001",
    firstName: "Alex",
    lastName: "Petrov",
    email: "alex@aubg.edu",
    assignedDepartments: ["dep_marketing", "dep_tech"],
  },
  {
    id: "bm_002",
    firstName: "Mila",
    lastName: "Georgieva",
    email: "mila@aubg.edu",
    assignedDepartments: ["dep_marketing"],
  },
  {
    id: "bm_003",
    firstName: "Kristian",
    lastName: "Nikolov",
    email: "kristian@aubg.edu",
    assignedDepartments: ["dep_design"],
  },
];

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

export function createClubAdminMockStore() {
  let applications = deepClone(initialApplications);
  let boardMembers = deepClone(initialBoardMembers);

  return {
    getDepartments(): ClubAdminDepartment[] {
      return clubAdminDepartmentsSeed.map((d) => {
        const depApps = applications.filter((a) => a.departmentId === d.id);
        return {
          id: d.id,
          name: d.name,
          totalApplications: depApps.length,
          pendingApplications: depApps.filter((a) => a.status === "Pending")
            .length,
        };
      });
    },

    getApplicationsByDepartment(
      departmentId: string
    ): ClubAdminApplicationListItem[] {
      return applications
        .filter((a) => a.departmentId === departmentId)
        .map(({ answers, attachments, assignedBoardMembers, notes, ...rest }) => rest);
    },

    getApplicationDetail(applicationId: string): ClubAdminApplicationDetail {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error("Application not found");
      return deepClone(app);
    },

    finalizeApplication(applicationId: string, decision: AdminDecision) {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error("Application not found");

      app.status = decision === "Admit" ? "Admitted" : "Rejected";

      return {
        applicationId: app.id,
        status: app.status,
      };
    },

    getBoardMembers(): BoardMember[] {
      return deepClone(boardMembers);
    },
  };
}