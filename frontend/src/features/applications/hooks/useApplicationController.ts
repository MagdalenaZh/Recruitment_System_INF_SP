import { useEffect, useMemo, useState } from "react";

import {
  isFormValid,
  validateAnswers,
  validatePersonal,
  type Errors,
} from "../pages/validation/application.validation";

import { submitApplication } from "../../../services/applications/applications.api";
import { getCurrentUser, getStoredUserId } from "../../../services/auth/auth.api";

import type {
  ApplicationQuestion,
  PersonalInfo,
} from "../../../types/application/application";

import type { Step } from "./useApplicationState";

export function useApplicationController(args: {
  clubId: string;
  questions: ApplicationQuestion[];
  step: Step;
  setStep: (s: Step) => void;
  nextStep: () => void;
  prevStep: () => void;
  personal: PersonalInfo;
  setPersonal: (p: PersonalInfo) => void;
  answers: Record<string, string>;
  departmentId: string;
}) {
  const {
    questions,
    step,
    setStep,
    nextStep,
    prevStep,
    personal,
    setPersonal,
    answers,
    departmentId,
  } = args;

  const [errors, setErrors] = useState<Errors & { department: string }>({
    personal: {},
    answers: {},
    department: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-fill personal info from logged-in user on mount
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setPersonal({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: "",
        });
      })
      .catch(() => {
        // not logged in or request failed — leave fields as-is
      });
  }, []);

  function clearPersonalError(key: keyof PersonalInfo) {
    setErrors((e) => ({ ...e, personal: { ...e.personal, [key]: "" } }));
  }

  function clearAnswerError(id: string) {
    setErrors((e) => ({ ...e, answers: { ...e.answers, [id]: "" } }));
  }

  function goNext() {
    if (step === 0) {
      const p = validatePersonal(personal);
      setErrors((e) => ({ ...e, personal: p }));
      if (Object.keys(p).length === 0) nextStep();
      return;
    }

    if (step === 1) {
      const dept = departmentId ? "" : "Please select a department.";
      const a = validateAnswers(questions, answers);
      setErrors((e) => ({ ...e, answers: a, department: dept }));
      if (!dept && Object.keys(a).length === 0) nextStep();
      return;
    }
  }

  function goBack() {
    prevStep();
  }

  const canSubmit = useMemo(
    () => isFormValid(personal, questions, answers) && !!departmentId,
    [personal, questions, answers, departmentId],
  );

  async function submit() {
    const p = validatePersonal(personal);
    const a = validateAnswers(questions, answers);
    const dept = departmentId ? "" : "Please select a department.";

    setErrors({ personal: p, answers: a, department: dept });

    if (Object.keys(p).length > 0) { setStep(0); return; }
    if (dept || Object.keys(a).length > 0) { setStep(1); return; }

    const userId = getStoredUserId();
    if (!userId) {
      alert("You must be logged in to submit an application.");
      return;
    }

    const questionnaire: Record<string, string> = {};
    for (const q of questions) {
      questionnaire[q.label] = answers[q.id] ?? "";
    }

    setIsSubmitting(true);
    try {
      await submitApplication({ userId, departmentId, questionnaire });
      setIsSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    errors,
    isSubmitting,
    isSubmitted,
    canSubmit,
    goNext,
    goBack,
    submit,
    clearPersonalError,
    clearAnswerError,
  };
}