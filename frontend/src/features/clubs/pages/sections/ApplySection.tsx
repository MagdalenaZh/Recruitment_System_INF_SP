import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApplicationsForCurrentUser,
  getDepartmentsForClub,
} from "../../../../services/applications/applicationStatusApi";

type Props = {
  clubId: string;
  clubName: string;
  clubDescription: string;
  admissionQuestions: string[];
};

export function ApplySection({
  clubId,
  clubName,
  clubDescription,
  admissionQuestions,
}: Props) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  async function onApplyClick() {
    try {
      setChecking(true);

      const [userApplications, departments] = await Promise.all([
        getApplicationsForCurrentUser(),
        getDepartmentsForClub(clubId),
      ]);

      const departmentIds = new Set(
        departments.map((department) => department.departmentId),
      );

      const hasActiveClubApplication = userApplications.some((application) => {
        if (!departmentIds.has(application.departmentId)) return false;
        const status = application.applicationStatus;
        return status === 1 || status === 2 || status === 3 || status === 6;
      });

      if (hasActiveClubApplication) {
        navigate("/account/applications", {
          state: {
            notice:
              "You have already applied to this club and your application is still under review.",
          },
        });
        return;
      }

      navigate(`/clubs/${clubId}/apply`, {
        state: {
          club: {
            clubId,
            clubName,
            description: clubDescription,
            admissionQuestions,
          },
        },
      });
    } catch {
      navigate(`/clubs/${clubId}/apply`, {
        state: {
          club: {
            clubId,
            clubName,
            description: clubDescription,
            admissionQuestions,
          },
        },
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="bg-slate-50 pb-16 text-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-2xl mb-6 font-semibold uppercase tracking-[0.24em] text-blue-700">
          Apply
        </p>
        <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Ready to apply to {clubName}?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If you think {clubName} is the right place for you, do not waste
                any time and apply for the opportunity to join the club.
                Complete the application form, answer the required questions
                carefully, and submit!
              </p>
            </div>

            <button
              type="button"
              onClick={() => void onApplyClick()}
              disabled={checking}
              className="shrink-0 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {checking ? "Checking..." : "Apply now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
