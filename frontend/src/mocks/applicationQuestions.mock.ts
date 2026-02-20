import type { ApplicationQuestion } from "../types/application/application";

export const applicationQuestionsByClubId: Record<string, ApplicationQuestion[]> = {
  "11111111-1111-1111-1111-111111111111": [
    {
      id: "motivation",
      label: "Why do you want to join this club?",
      type: "textarea",
      required: true,
    },
    {
      id: "department",
      label: "Which department interests you most?",
      type: "select",
      required: true,
      options: ["Engineering", "Design", "Events", "Not sure yet"],
    },
    {
      id: "portfolio",
      label: "Portfolio / GitHub link (optional)",
      type: "text",
      required: false,
    },
  ],
};
