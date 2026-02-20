import type { Club } from "../types/clubs/club";

export const clubsMock: Club[] = [
  {
    clubId: "11111111-1111-1111-1111-111111111111",
    name: "The Hub",
    shortDescription: "Tech community for building, learning, and shipping projects.",
    category: "Tech",
    isRecruiting: true,
    about:
      "The Hub is AUBG’s tech club. We build projects, host workshops, and create opportunities for students to learn by doing.",
    departments: [
      {
        id: "dev-dept",
        name: "Development",
        description: "Builds the website, internal tools, and hackathon projects.",
      },
      {
        id: "design-dept",
        name: "Design",
        description: "UI/UX, branding, and visuals for events and products.",
      },
      {
        id: "logistics-dept",
        name: "Logistics",
        description: "Organizes meetups, workshops, and collaborations.",
      },
      {
        id: "marketing-dept",
        name: "Marketing",
        description: "Manages social media, outreach, and community engagement.",
      }
    ],
    events: [
      {
        id: "ev-1",
        title: "HackAUBG 8.0",
        dateText: "March 2026",
        description: "A practical workshop for beginners with a mini project.",
      },
      {
        id: "ev-2",
        title: "Project Showcase Night",
        dateText: "April 2026",
        description: "Students demo what they built this semester.",
      },
    ],
  },
  {
    clubId: "22222222-2222-2222-2222-222222222222",
    name: "Dance Crew",
    shortDescription: "Weekly practice, performances, and good vibes.",
    category: "Arts",
    isRecruiting: false,
  },
  {
    clubId: "33333333-3333-3333-3333-333333333333",
    name: "TEDxAUBG",
    shortDescription: "Speaker curation, event organization, storytelling.",
    category: "Community",
    isRecruiting: true,
  },
  {
    clubId: "44444444-4444-4444-4444-444444444444",
    name: "Olympics",
    shortDescription: "Join teams, tournaments, and campus sports activities.",
    category: "Sports",
    isRecruiting: true,
  },
  {
    clubId: "55555555-5555-5555-5555-555555555555",
    name: "Polygon",
    shortDescription: "Mathematics club for problem-solving, competitions, and math talks.",
    category: "Science",
    isRecruiting: true,
  },
  {
    clubId: "66666666-6666-6666-6666-666666666666",
    name: "Bussiness Club",
    shortDescription: "Networking, workshops, and career development for business students.",
    category: "Business",
    isRecruiting: false,
  }
];
