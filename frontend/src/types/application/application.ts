export type ApplicationQuestionType = "text" | "textarea" | "select";

export type ApplicationQuestion = {
  id: string;
  label: string;
  required?: boolean;
  type: ApplicationQuestionType;
  options?: string[];
};

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type ApplicationDraft = {
  clubId: string;
  personal: PersonalInfo;
  answers: Record<string, string>;
};
