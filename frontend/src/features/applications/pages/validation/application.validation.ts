import type {
  ApplicationQuestion,
  PersonalInfo,
} from "../../../../types/application/application";

//TO DO: move validation logic to backend also add more validation rules (email format, phone format, answer length, etc.) anddd use zod for schema validation and type inference
export type Errors = {
  personal: Partial<Record<keyof PersonalInfo, string>>;
  answers: Record<string, string>;
};

export function validatePersonal(personal: PersonalInfo): Errors["personal"] {
  const e: Errors["personal"] = {};

  if (!personal.firstName.trim()) e.firstName = "First name is required";
  if (!personal.lastName.trim()) e.lastName = "Last name is required";

  const email = personal.email.trim();
  if (!email) e.email = "Email is required";
  else if (!email.includes("@")) e.email = "Email looks invalid";


  return e;
}

export function validateAnswers(
  questions: ApplicationQuestion[],
  answers: Record<string, string>,
): Errors["answers"] {
  const e: Errors["answers"] = {};

  for (const q of questions) {
    if (!q.required) continue;

    const val = String(answers[q.id] ?? "").trim();
    if (!val) e[q.id] = "This field is required";
  }

  return e;
}

export function isFormValid(
  personal: PersonalInfo,
  questions: ApplicationQuestion[],
  answers: Record<string, string>,
) {
  return (
    Object.keys(validatePersonal(personal)).length === 0 &&
    Object.keys(validateAnswers(questions, answers)).length === 0
  );
}
