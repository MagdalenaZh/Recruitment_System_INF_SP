export type ClubCategory =
  | "Math & Science"
  | "Technology"
  | "Sports"
  | "Business"
  | "Politics"
  | "Art"
  | "Media & Journalism"
  | "Entrepreneurship"
  | "Music"
  | "Other";

export type ClubListItem = {
  clubId: string;
  clubName: string;
  admissionQuestions: string[];
  description: string;
  category: ClubCategory;
};

export type ClubDepartment = {
  departmentId: string;
  clubId: string;
  departmentName: string;
  numberOfOpenPositions: number;
  description: string;
};

export type ClubDetails = {
  clubId: string;
  clubName: string;
  description: string;
  admissionQuestions: string[];
  departments: ClubDepartment[];
  category: ClubCategory;
};