import { useState } from "react";
import type { PersonalInfo } from "../../../types/application/application";

export type Step = 0 | 1 | 2;

export function useApplicationState(initial?: Partial<PersonalInfo>) {
  const [step, setStep] = useState<Step>(0);

  const [personal, setPersonal] = useState<PersonalInfo>({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");

  function setPersonalField<K extends keyof PersonalInfo>(key: K, value: string) {
    setPersonal((p) => ({ ...p, [key]: value }));
  }

  function setAnswer(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function nextStep() {
    setStep((s) => (s < 2 ? ((s + 1) as Step) : s));
  }

  function prevStep() {
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    personal,
    setPersonal,
    setPersonalField,
    answers,
    setAnswers,
    setAnswer,
    departmentId,
    setDepartmentId,
    departmentName,
    setDepartmentName,
  };
}