import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { ApplicationFormShell } from "../components/ApplicationFormShell";
import { QuestionsStep } from "../components/steps/QuestionsStep";
import { PersonalInfoStep } from "../components/steps/PersonalInfoStep";
import { ReviewStep } from "../components/steps/ReviewStep";
import { FormActions } from "../components/FormActions";
import { Stepper } from "../components/Stepper";

import type { ApplicationQuestion } from "../../../types/application/application";
import type { ClubListItem } from "../../../types/clubs/club";

import { getClubById } from "../../../services/clubs/clubs.api";
import {
  getApplicationsForCurrentUser,
  getDepartmentsForClub,
} from "../../../services/applications/applicationStatusApi";
import { useApplicationState } from "../hooks/useApplicationState";
import { useApplicationController } from "../hooks/useApplicationController";

type LocationState = {
  club?: ClubListItem;
};

function mapAdmissionQuestionsToFormQuestions(
  questions: string[],
): ApplicationQuestion[] {
  return questions.map((question, index) => ({
    id: `question-${index + 1}`,
    label: question,
    type: "textarea",
    required: true,
    placeholder: "Type your answer here...",
  }));
}

export default function ApplicationFormPage() {
  const { clubId } = useParams();
  const location = useLocation();
  const stateFromLocation = location.state as LocationState | null;

  const [search, setSearch] = useState("");
  const [club, setClub] = useState<ClubListItem | null>(
    stateFromLocation?.club ?? null,
  );
  const [hasActiveClubApplication, setHasActiveClubApplication] = useState(false);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!clubId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (stateFromLocation?.club) {
          if (!cancelled) {
            setClub(stateFromLocation.club);
            setLoading(false);
          }
          return;
        }

        const res = await getClubById(clubId);
        if (!cancelled) setClub(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clubId, stateFromLocation?.club]);

  useEffect(() => {
    let cancelled = false;

    async function checkDuplicateActiveApplication() {
      if (!clubId) {
        if (!cancelled) {
          setHasActiveClubApplication(false);
          setDuplicateCheckLoading(false);
        }
        return;
      }

      try {
        setDuplicateCheckLoading(true);

        const [userApplications, departments] = await Promise.all([
          getApplicationsForCurrentUser(),
          getDepartmentsForClub(clubId),
        ]);

        const departmentIds = new Set(departments.map((department) => department.departmentId));
        const hasDuplicate = userApplications.some((application) => {
          if (!departmentIds.has(application.departmentId)) return false;

          const status = application.applicationStatus;
          return status === 1 || status === 2 || status === 3 || status === 6;
        });

        if (!cancelled) {
          setHasActiveClubApplication(hasDuplicate);
        }
      } catch {
        if (!cancelled) {
          setHasActiveClubApplication(false);
        }
      } finally {
        if (!cancelled) {
          setDuplicateCheckLoading(false);
        }
      }
    }

    void checkDuplicateActiveApplication();

    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const questions: ApplicationQuestion[] = useMemo(() => {
    if (!club) return [];
    return mapAdmissionQuestionsToFormQuestions(club.admissionQuestions);
  }, [club]);

  const state = useApplicationState();

  const controller = useApplicationController({
    clubId: clubId ?? "",
    hasActiveClubApplication,
    questions,
    step: state.step,
    setStep: state.setStep,
    nextStep: state.nextStep,
    prevStep: state.prevStep,
    personal: state.personal,
    setPersonal: state.setPersonal,
    answers: state.answers,
    departmentId: state.departmentId,
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

  return (
    <ApplicationFormShell
      search={search}
      setSearch={setSearch}
      clubId={club.clubId}
      clubName={club.clubName}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Stepper
          steps={["Personal info", "Questions", "Review"]}
          current={state.step}
        />

        {!duplicateCheckLoading && hasActiveClubApplication ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-100">
            You have already applied to this club and your application is still under review.
          </div>
        ) : null}

        {controller.isSubmitted ? (
          <div className="mt-8 rounded-xl bg-blue-50 p-5 text-sm text-blue-900 ring-1 ring-blue-100">
            Your application has been submitted successfully!
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
                clubId={clubId}
                questions={questions}
                answers={state.answers}
                setAnswer={state.setAnswer}
                departmentId={state.departmentId}
                setDepartmentId={state.setDepartmentId}
                setDepartmentName={state.setDepartmentName}
                errors={controller.errors.answers}
                departmentError={controller.errors.department}
                clearError={controller.clearAnswerError}
              />
            )}

            {state.step === 2 && (
              <ReviewStep
                personal={state.personal}
                questions={questions}
                answers={state.answers}
                departmentName={state.departmentName}
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
