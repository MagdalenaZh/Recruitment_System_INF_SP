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
    <section className="bg-slate-50 pb-14 text-slate-900">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Apply</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ready to apply to {clubName}?
            </p>
          </div>

          <button
            type="button"
            onClick={() => void onApplyClick()}
            disabled={checking}
            className="shrink-0 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {checking ? "Checking..." : "Apply now"}
          </button>
        </div>
      </div>
    </section>
  );
}
