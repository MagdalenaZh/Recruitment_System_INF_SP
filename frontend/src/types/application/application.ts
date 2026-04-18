export type ApplicationQuestionType = "text" | "textarea" | "select";

export type ApplicationQuestion = {
  id: string;
  label: string;
  required?: boolean;
  type: ApplicationQuestionType;
  options?: string[];
  placeholder?: string;
};

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvFileName?: string;
  cvFileContent?: number[];
};

export type ApplicationDraft = {
  clubId: string;
  departmentId: string;
  personal: PersonalInfo;
  answers: Record<string, string>;
};

export type SubmitApplicationRequest = {
  departmentId: string;
  questionnaire: Record<string, string>;
  cvFile: number[];
};
