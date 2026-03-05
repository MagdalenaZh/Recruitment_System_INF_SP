import type { ApplicationDetail, ApplicationListItem, BoardDepartment, BoardVote } from "../features/board/types/boardTypes";


function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const REQUIRED_APPROVALS_DEFAULT = 10;

export const MOCK_BOARD_MEMBER_ID = "bm_1";

export const departmentsSeed: Array<{ id: string; name: string }> = [
  { id: "dep_marketing", name: "Marketing" },
  { id: "dep_design", name: "Design" },
  { id: "dep_tech", name: "Tech" },
  { id: "dep_events", name: "Events" },
];

const baseApplications: ApplicationDetail[] = [
  {
    id: "app_001",
    applicantId: "u_001",
    applicantName: "Ivana Petrova",
    submittedAt: isoDaysAgo(2),
    status: "Pending",
    departmentId: "dep_marketing",
    approvalsCount: 2,
    requiredApprovals: REQUIRED_APPROVALS_DEFAULT,
    myVote: null,
    answers: [
      { question: "Why do you want to join?", answer: "I want to learn and contribute to real campaigns." },
      { question: "Relevant experience?", answer: "I ran social media for my high school club." },
      { question: "Weekly availability?", answer: "6–8 hours." },
    ],
    attachments: [
      { id: "att_001", fileName: "CV_Ivana_Petrova.pdf", fileSizeLabel: "242 KB", url: "#" },
      { id: "att_002", fileName: "Portfolio.pdf", fileSizeLabel: "1.4 MB", url: "#" },
    ],
    notes: "Strong motivation. Check availability for event days.",
  },
  {
    id: "app_002",
    applicantId: "u_002",
    applicantName: "Georgi Dimitrov",
    submittedAt: isoDaysAgo(5),
    status: "Pending",
    departmentId: "dep_design",
    approvalsCount: 6,
    requiredApprovals: REQUIRED_APPROVALS_DEFAULT,
    myVote: "Approve",
    answers: [
      { question: "Why design?", answer: "I like visual storytelling and branding." },
      { question: "Tools?", answer: "Figma, Illustrator, some Photoshop." },
    ],
    attachments: [{ id: "att_003", fileName: "Georgi_Portfolio.pdf", fileSizeLabel: "3.2 MB", url: "#" }],
  },
  {
    id: "app_003",
    applicantId: "u_003",
    applicantName: "Maria Ivanova",
    submittedAt: isoDaysAgo(1),
    status: "Pending",
    departmentId: "dep_tech",
    approvalsCount: 1,
    requiredApprovals: REQUIRED_APPROVALS_DEFAULT,
    myVote: null,
    answers: [
      { question: "Tech interests?", answer: "Web dev, React, and backend basics." },
      { question: "Projects?", answer: "Small portfolio site + a todo app." },
    ],
    attachments: [{ id: "att_004", fileName: "Maria_GitHub_Link.txt", fileSizeLabel: "2 KB", url: "#" }],
  },
  {
    id: "app_004",
    applicantId: "u_004",
    applicantName: "Nikolay Georgiev",
    submittedAt: isoDaysAgo(9),
    status: "Rejected",
    departmentId: "dep_events",
    approvalsCount: 0,
    requiredApprovals: REQUIRED_APPROVALS_DEFAULT,
    myVote: "Reject",
    answers: [{ question: "Why events?", answer: "I want to help with logistics." }],
    attachments: [],
  },
  {
    id: "app_005",
    applicantId: "u_005",
    applicantName: "Elena Stoyanova",
    submittedAt: isoDaysAgo(14),
    status: "Approved",
    departmentId: "dep_marketing",
    approvalsCount: 10,
    requiredApprovals: REQUIRED_APPROVALS_DEFAULT,
    myVote: "Approve",
    answers: [{ question: "What can you bring?", answer: "Consistent content planning and copywriting." }],
    attachments: [{ id: "att_005", fileName: "Elena_CV.pdf", fileSizeLabel: "198 KB", url: "#" }],
  },
];

export function buildDepartments(apps: ApplicationDetail[]): BoardDepartment[] {
  return departmentsSeed.map((d) => {
    const forDep = apps.filter((a) => a.departmentId === d.id);
    const pending = forDep.filter((a) => a.status === "Pending").length;

    return {
      id: d.id,
      name: d.name,
      totalApplications: forDep.length,
      pendingApplications: pending,
    };
  });
}

export function toListItem(a: ApplicationDetail): ApplicationListItem {
  const { answers, attachments, notes, ...rest } = a;
  return rest;
}

export function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

// This is our in-memory "database"
export function createMockStore() {
  let applications = deepClone(baseApplications);

  function findAppOrThrow(applicationId: string) {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) throw new Error(`Application not found: ${applicationId}`);
    return app;
  }

  function recomputeStatus(app: ApplicationDetail) {
    if (app.status === "Rejected") return;
    if (app.approvalsCount >= app.requiredApprovals) app.status = "Approved";
    else app.status = "Pending";
  }

  function vote(applicationId: string, vote: BoardVote) {
    const app = findAppOrThrow(applicationId);

    const prev = app.myVote ?? null;

    if (prev === vote) {
      app.myVote = null;
      if (vote === "Approve") app.approvalsCount = clamp(app.approvalsCount - 1, 0, 999);
    } else {
      app.myVote = vote;
      if (vote === "Approve") {
        if (prev !== "Approve") app.approvalsCount = clamp(app.approvalsCount + 1, 0, 999);
      } else {
        if (prev === "Approve") app.approvalsCount = clamp(app.approvalsCount - 1, 0, 999);
      }
    }
    recomputeStatus(app);

    return deepClone(app);
  }

  return {
    getAll: () => deepClone(applications),
    setAll: (next: ApplicationDetail[]) => {
      applications = deepClone(next);
    },
    findByDepartment: (departmentId: string) =>
      deepClone(applications.filter((a) => a.departmentId === departmentId)),
    findById: (applicationId: string) => deepClone(findAppOrThrow(applicationId)),
    vote,
  };
}