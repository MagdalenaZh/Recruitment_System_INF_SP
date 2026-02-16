export type ClubCategory =
  | "Tech"
  | "Sports"
  | "Arts"
  | "Business"
  | "Science"
  | "Community"
  | "Entertainment"
  | "Other";

export type Club = {
  clubId: string;          
  name: string;
  shortDescription: string;
  category: ClubCategory;
  isRecruiting: boolean;
  logoUrl?: string;       
};
