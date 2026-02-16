export type ClubCategory =
  | "Tech"
  | "Sports"
  | "Arts"
  | "Business"
  | "Science"
  | "Community"
  | "Entertainment"
  | "Other";

export type ClubDepartment = {
  id: string;
  name: string;
  description: string;
};

export type ClubEvent = {
  id: string;
  title: string;
  dateText: string; 
  description: string;
};

export type Club = {
  clubId: string;
  name: string;
  shortDescription: string;
  category: ClubCategory;
  isRecruiting: boolean;
  about?: string;
  departments?: ClubDepartment[];
  events?: ClubEvent[];
};
