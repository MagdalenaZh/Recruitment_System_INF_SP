import { useMemo, useState } from "react";
import type { Step } from "./useApplicationState";
import type { ApplicationDraft, ApplicationQuestion, PersonalInfo } from "../../../types/application/application";
import { isFormValid, validateAnswers, validatePersonal, type Errors } from "../../public/pages/ApplicationFormPage/validation/application.validation";
import { submitApplicationDraft } from "../../../services/applications/applicationSubmit";



export function useApplicationController(args: {
  clubId: string;
  questions: ApplicationQuestion[];
  step: Step;
  setStep: (s: Step) => void;
  nextStep: () => void;
  prevStep: () => void;
  personal: PersonalInfo;
  answers: Record<string, string>;
}) {
  const { clubId, questions, step, setStep, nextStep, prevStep, personal, answers } = args;

  const [errors, setErrors] = useState<Errors>({ personal: {}, answers: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      const a = validateAnswers(questions, answers);
      setErrors((e) => ({ ...e, answers: a }));
      if (Object.keys(a).length === 0) nextStep();
      return;
    }
  }

  function goBack() {
    prevStep();
  }

  const canSubmit = useMemo(() => isFormValid(personal, questions, answers), [
    personal,
    questions,
    answers,
  ]);

  async function submit() {
    const p = validatePersonal(personal);
    const a = validateAnswers(questions, answers);
    setErrors({ personal: p, answers: a });

    if (Object.keys(p).length > 0) {
      setStep(0);
      return;
    }
    if (Object.keys(a).length > 0) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const draft: ApplicationDraft = { clubId, personal, answers };
      const res = await submitApplicationDraft(draft);
      if (res?.ok) setIsSubmitted(true);
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
