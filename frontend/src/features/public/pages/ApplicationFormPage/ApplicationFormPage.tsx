import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { ApplicationFormShell } from "../../../applications/components/ApplicationFormShell";
import { QuestionsStep } from "../../../applications/components/steps/QuestionsStep";
import { PersonalInfoStep } from "../../../applications/components/steps/PersonalInfoStep";
import { ReviewStep } from "../../../applications/components/steps/ReviewStep";
import { FormActions } from "../../../applications/components/FormActions";
import { Stepper } from "../../../applications/components/Stepper";

import type { Club } from "../../../../types/clubs/club";
import type { ApplicationQuestion } from "../../../../types/application/application";

import { applicationQuestionsByClubId } from "../../../../mocks/applicationQuestions.mock";

import { getClubById } from "../../../../services/clubs/clubs.api";

import { useApplicationState } from "../../../applications/hooks/useApplicationState";
import { useApplicationController } from "../../../applications/hooks/useApplicationController";

export default function ApplicationFormPage() {
  const { clubId } = useParams();
  const [search, setSearch] = useState("");

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = clubId ? await getClubById(clubId) : null;
      if (!cancelled) {
        setClub(res);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const questions: ApplicationQuestion[] = useMemo(() => {
    if (!clubId) return [];
    return applicationQuestionsByClubId[clubId] ?? [];
  }, [clubId]);

  // TO DO: prefill personal info from user profile: const state = useApplicationState({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  const state = useApplicationState();

  const controller = useApplicationController({
    clubId: clubId ?? "",
    questions,

    step: state.step,
    setStep: state.setStep,
    nextStep: state.nextStep,
    prevStep: state.prevStep,

    personal: state.personal,
    answers: state.answers,
  });

  if (!clubId) {
    return (
      <ApplicationFormShell search={search} setSearch={setSearch}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Missing club id.
        </div>
      </ApplicationFormShell>
    );
  }

  if (loading) {
    return (
      <ApplicationFormShell search={search} setSearch={setSearch}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading form...
        </div>
      </ApplicationFormShell>
    );
  }

  if (!club) {
    return (
      <ApplicationFormShell search={search} setSearch={setSearch}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Club not found.
        </div>
      </ApplicationFormShell>
    );
  }

  if (!club.isRecruiting) {
    return (
      <ApplicationFormShell
        search={search}
        setSearch={setSearch}
        clubId={club.clubId}
        clubName={club.name}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Applications for <span className="font-semibold">{club.name}</span>{" "}
          are closed.
        </div>
      </ApplicationFormShell>
    );
  }

  return (
    <ApplicationFormShell
      search={search}
      setSearch={setSearch}
      clubId={club.clubId}
      clubName={club.name}
    >
      <div className=" rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Stepper
          steps={["Personal info", "Questions", "Review"]}
          current={state.step}
        />

        {controller.isSubmitted ? (
          <div className="mt-8 rounded-xl bg-blue-50 p-5 text-sm text-blue-900 ring-1 ring-blue-100">
            Application submitted (mock). Check the console.
          </div>
        ) : (
          <>
            {state.step === 0 && (
              <PersonalInfoStep
                personal={state.personal}
                setField={state.setPersonalField}
                errors={controller.errors.personal}
                clearError={controller.clearPersonalError}
              />
            )}

            {state.step === 1 && (
              <QuestionsStep
                questions={questions}
                answers={state.answers}
                setAnswer={state.setAnswer}
                errors={controller.errors.answers}
                clearError={controller.clearAnswerError}
              />
            )}

            {state.step === 2 && (
              <ReviewStep
                personal={state.personal}
                questions={questions}
                answers={state.answers}
              />
            )}

            <FormActions
              step={state.step}
              isSubmitting={controller.isSubmitting}
              canSubmit={controller.canSubmit}
              onBack={controller.goBack}
              onNext={controller.goNext}
              onSubmit={controller.submit}
            />
          </>
        )}
      </div>
    </ApplicationFormShell>
  );
}
