export type FinalInterviewDecision = "Approved" | "Rejected";
export type RoundOneStatus = "Approved" | "Pending" | "Rejected";
export type InterviewSlotPhase =
  | "Upcoming"
  | "Live now"
  | "Ready for decision"
  | "Decision submitted";

export type BoardInterviewAnswer = {
  id: string;
  question: string;
  answer: string;
};

export type BoardInterviewAttachment = {
  id: string;
  name: string;
};

export type BoardInterviewNote = {
  id: string;
  author: string;
  createdAt: string;
  text: string;
};

export type BoardInterviewDepartmentDecision = {
  departmentId: string;
  departmentName: string;
  roundOneStatus: RoundOneStatus;
  finalDecision: FinalInterviewDecision | null;
};

export type BoardInterviewSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  candidateName: string;
  candidateEmail: string;
  answers: BoardInterviewAnswer[];
  attachments: BoardInterviewAttachment[];
  notes: BoardInterviewNote[];
  decisions: BoardInterviewDepartmentDecision[];
};

export type DepartmentTarget = {
  departmentId: string;
  departmentName: string;
  targetSpots: number;
};

export type DepartmentInterviewStat = {
  departmentId: string;
  departmentName: string;
  targetSpots: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  totalApplicants: number;
};

export const MOCK_NOW = "2026-09-12T19:52:00";

export const departmentTargetsMock: DepartmentTarget[] = [
  {
    departmentId: "marketing",
    departmentName: "Marketing",
    targetSpots: 5,
  },
  {
    departmentId: "design",
    departmentName: "Design",
    targetSpots: 4,
  },
  {
    departmentId: "tech",
    departmentName: "Tech",
    targetSpots: 6,
  },
  {
    departmentId: "events",
    departmentName: "Events",
    targetSpots: 3,
  },
];

export const boardInterviewSlotsMock: BoardInterviewSlot[] = [
  {
    id: "slot-1",
    date: "12.09.2026",
    startTime: "19:30",
    endTime: "19:45",
    candidateName: "Alexander Borisov",
    candidateEmail: "alexander.b@example.com",
    answers: [
      {
        id: "a1",
        question: "Why do you want to join AUBG Clubs?",
        answer:
          "I want to be more active on campus and work with a team that plans real events and campaigns.",
      },
      {
        id: "a2",
        question: "What can you contribute?",
        answer:
          "I have experience with social media planning, event photography, and basic Canva design work.",
      },
    ],
    attachments: [
      { id: "at1", name: "CV_Alexander_Borisov.pdf" },
      { id: "at2", name: "Portfolio_Alexander_Borisov.pdf" },
    ],
    notes: [
      {
        id: "n1",
        author: "Maria T.",
        createdAt: "12.09.2026 19:44",
        text: "Strong communication. Gave clear examples from high school club projects.",
      },
    ],
    decisions: [
      {
        departmentId: "marketing",
        departmentName: "Marketing",
        roundOneStatus: "Approved",
        finalDecision: "Approved",
      },
      {
        departmentId: "design",
        departmentName: "Design",
        roundOneStatus: "Approved",
        finalDecision: "Approved",
      },
    ],
  },
  {
    id: "slot-2",
    date: "12.09.2026",
    startTime: "19:45",
    endTime: "20:00",
    candidateName: "Maria Angelova",
    candidateEmail: "maria.a@example.com",
    answers: [
      {
        id: "a3",
        question: "Why this department?",
        answer:
          "I am applying for Tech because I want to improve my frontend skills and contribute to student-facing projects.",
      },
      {
        id: "a4",
        question: "What is your biggest strength?",
        answer:
          "I learn quickly and I am comfortable asking questions when I get stuck.",
      },
    ],
    attachments: [{ id: "at3", name: "CV_Maria_Angelova.pdf" }],
    notes: [
      {
        id: "n2",
        author: "Ivan P.",
        createdAt: "12.09.2026 19:50",
        text: "Interview currently in progress. Candidate seems calm and prepared.",
      },
    ],
    decisions: [
      {
        departmentId: "tech",
        departmentName: "Tech",
        roundOneStatus: "Approved",
        finalDecision: null,
      },
    ],
  },
  {
    id: "slot-3",
    date: "12.09.2026",
    startTime: "20:00",
    endTime: "20:15",
    candidateName: "Ivan Petrov",
    candidateEmail: "ivan.petrov@example.com",
    answers: [
      {
        id: "a5",
        question: "Why should we choose you?",
        answer:
          "I enjoy organizing people, keeping track of deadlines, and helping with event logistics.",
      },
      {
        id: "a6",
        question: "How do you handle pressure?",
        answer:
          "I usually break tasks into smaller steps and stay focused on the next important thing.",
      },
    ],
    attachments: [{ id: "at4", name: "CV_Ivan_Petrov.pdf" }],
    notes: [],
    decisions: [
      {
        departmentId: "events",
        departmentName: "Events",
        roundOneStatus: "Approved",
        finalDecision: null,
      },
      {
        departmentId: "marketing",
        departmentName: "Marketing",
        roundOneStatus: "Approved",
        finalDecision: null,
      },
    ],
  },
  {
    id: "slot-4",
    date: "12.09.2026",
    startTime: "20:15",
    endTime: "20:30",
    candidateName: "Elena Dimitrova",
    candidateEmail: "elena.d@example.com",
    answers: [
      {
        id: "a7",
        question: "What experience do you already have?",
        answer:
          "I have worked on small student posters, Instagram story templates, and event visuals.",
      },
      {
        id: "a8",
        question: "What do you want to learn?",
        answer:
          "I want to improve branding consistency and make visuals that actually fit a larger campaign.",
      },
    ],
    attachments: [
      { id: "at5", name: "CV_Elena_Dimitrova.pdf" },
      { id: "at6", name: "Mini_Portfolio_Elena.pdf" },
    ],
    notes: [],
    decisions: [
      {
        departmentId: "design",
        departmentName: "Design",
        roundOneStatus: "Approved",
        finalDecision: null,
      },
    ],
  },
  {
    id: "slot-5",
    date: "13.09.2026",
    startTime: "19:30",
    endTime: "19:45",
    candidateName: "Nikolay Stoyanov",
    candidateEmail: "nikolay.s@example.com",
    answers: [
      {
        id: "a9",
        question: "Why do you want to join the team?",
        answer:
          "I like technical problem solving and I want to work on projects that people around campus actually use.",
      },
      {
        id: "a10",
        question: "What is one area you want to improve?",
        answer:
          "Backend fundamentals and writing cleaner code in team projects.",
      },
    ],
    attachments: [{ id: "at7", name: "CV_Nikolay_Stoyanov.pdf" }],
    notes: [],
    decisions: [
      {
        departmentId: "tech",
        departmentName: "Tech",
        roundOneStatus: "Approved",
        finalDecision: null,
      },
    ],
  },
  {
    id: "slot-6",
    date: "14.09.2026",
    startTime: "20:15",
    endTime: "20:30",
    candidateName: "Petar Kolev",
    candidateEmail: "petar.k@example.com",
    answers: [
      {
        id: "a11",
        question: "Why this role?",
        answer:
          "I enjoy working around people and I am interested in helping with events from setup to execution.",
      },
      {
        id: "a12",
        question: "Tell us about teamwork.",
        answer:
          "I am used to coordinating with classmates and making sure everyone knows what still needs to be done.",
      },
    ],
    attachments: [{ id: "at8", name: "CV_Petar_Kolev.pdf" }],
    notes: [],
    decisions: [
      {
        departmentId: "events",
        departmentName: "Events",
        roundOneStatus: "Approved",
        finalDecision: null,
      },
    ],
  },
];

function toDateTime(date: string, time: string) {
  const [day, month, year] = date.split(".");
  return new Date(`${year}-${month}-${day}T${time}:00`);
}

export function cloneBoardInterviewSlotsMock() {
  return JSON.parse(JSON.stringify(boardInterviewSlotsMock)) as BoardInterviewSlot[];
}

export function sortInterviewSlots(slots: BoardInterviewSlot[]) {
  return [...slots].sort((a, b) => {
    const aTime = toDateTime(a.date, a.startTime).getTime();
    const bTime = toDateTime(b.date, b.startTime).getTime();
    return aTime - bTime;
  });
}

export function getSlotPhase(
  slot: BoardInterviewSlot,
  nowIso: string = MOCK_NOW
): InterviewSlotPhase {
  const now = new Date(nowIso);
  const start = toDateTime(slot.date, slot.startTime);
  const end = toDateTime(slot.date, slot.endTime);

  const allDecided = slot.decisions.every(
    (decision) => decision.finalDecision !== null
  );

  if (allDecided) {
    return "Decision submitted";
  }

  if (now < start) {
    return "Upcoming";
  }

  if (now >= start && now < end) {
    return "Live now";
  }

  return "Ready for decision";
}

export function groupSlotsByDate(slots: BoardInterviewSlot[]) {
  const grouped = new Map<string, BoardInterviewSlot[]>();

  for (const slot of sortInterviewSlots(slots)) {
    const existing = grouped.get(slot.date) ?? [];
    existing.push(slot);
    grouped.set(slot.date, existing);
  }

  return Array.from(grouped.entries()).map(([date, dateSlots]) => ({
    date,
    slots: dateSlots,
  }));
}

export function filterSlotsByDepartment(
  slots: BoardInterviewSlot[],
  departmentId: string
) {
  if (departmentId === "all") return slots;

  return slots.filter((slot) =>
    slot.decisions.some((decision) => decision.departmentId === departmentId)
  );
}

export function getDepartmentStats(
  slots: BoardInterviewSlot[]
): DepartmentInterviewStat[] {
  return departmentTargetsMock.map((department) => {
    const allDecisions = slots.flatMap((slot) =>
      slot.decisions.filter(
        (decision) => decision.departmentId === department.departmentId
      )
    );

    return {
      departmentId: department.departmentId,
      departmentName: department.departmentName,
      targetSpots: department.targetSpots,
      approvedCount: allDecisions.filter(
        (decision) => decision.finalDecision === "Approved"
      ).length,
      rejectedCount: allDecisions.filter(
        (decision) => decision.finalDecision === "Rejected"
      ).length,
      pendingCount: allDecisions.filter(
        (decision) => decision.finalDecision === null
      ).length,
      totalApplicants: allDecisions.length,
    };
  });
}

export function getCurrentInterview(slots: BoardInterviewSlot[]) {
  return sortInterviewSlots(slots).find(
    (slot) => getSlotPhase(slot) === "Live now"
  );
}

export function getNextInterview(slots: BoardInterviewSlot[]) {
  return sortInterviewSlots(slots).find(
    (slot) => getSlotPhase(slot) === "Upcoming"
  );
}

export function getDecisionProgressLabel(slot: BoardInterviewSlot) {
  const decided = slot.decisions.filter(
    (decision) => decision.finalDecision !== null
  ).length;

  return `${decided}/${slot.decisions.length} department decisions submitted`;
}

export function getInterviewVotingHint(slot: BoardInterviewSlot) {
  const phase = getSlotPhase(slot);

  if (phase === "Upcoming") {
    return `Voting will open after ${slot.endTime}.`;
  }

  if (phase === "Live now") {
    return `Interview is in progress. Voting opens at ${slot.endTime}.`;
  }

  if (phase === "Ready for decision") {
    return "The interview slot has ended. You can now submit a decision.";
  }

  return "All decisions for this applicant have already been submitted.";
}

export function getFormattedMockNow() {
  const date = new Date(MOCK_NOW);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}